import { normalizeUrl, removeDuplicateLinks } from '../utils/patterns.js'

/**
 * Сервис для сканирования сайтов и извлечения ссылок
 */
export class ScannerService {
  constructor() {
    this.timeout = 10000 // 10 секунд таймаут для запросов
  }

  /**
   * Основной метод сканирования сайта
   * @param {string} baseUrl - URL сайта для сканирования
   * @returns {Promise<Array>} - Массив найденных ссылок
   */
  async scanSite(baseUrl) {
    const links = new Set()

    try {
      // Нормализуем базовый URL
      const normalizedBaseUrl = this.normalizeBaseUrl(baseUrl)

      // Параллельно запускаем все методы сканирования
      const results = await Promise.allSettled([
        this.scanSitemapIndex(normalizedBaseUrl),
        this.scanSitemap(normalizedBaseUrl),
        this.scanRobotsTxt(normalizedBaseUrl),
        this.scanAlternativeSitemaps(normalizedBaseUrl)
      ])

      // Собираем все найденные ссылки
      for (const result of results) {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
          result.value.forEach(link => links.add(link))
        }
      }

      // Преобразуем Set в массив, убираем дубликаты и возвращаем
      return removeDuplicateLinks(Array.from(links))
    } catch (error) {
      console.error('Error scanning site:', error)
      return []
    }
  }

  /**
   * Нормализует базовый URL
   * @param {string} url - URL для нормализации
   * @returns {string} - Нормализованный URL
   */
  normalizeBaseUrl(url) {
    try {
      const urlObj = new URL(url)
      return `${urlObj.protocol}//${urlObj.host}`
    } catch {
      // Если URL невалиден, пробуем добавить https://
      if (!url.startsWith('http')) {
        return `https://${url}`
      }
      return url
    }
  }

  /**
   * Парсит sitemap_index.xml
   * @param {string} baseUrl - Базовый URL сайта
   * @returns {Promise<Array>} - Массив ссылок из всех sitemap
   */
  async scanSitemapIndex(baseUrl) {
    const sitemapIndexUrl = `${baseUrl}/sitemap_index.xml`
    const links = []

    try {
      const response = await this.fetchWithTimeout(sitemapIndexUrl)
      if (!response.ok) return []

      const text = await response.text()

      // Используем regex для парсинга XML (DOMParser недоступен в Service Worker)
      const sitemapLocRegex = /<sitemap>[\s\S]*?<loc>(.*?)<\/loc>[\s\S]*?<\/sitemap>/gi
      const matches = [...text.matchAll(sitemapLocRegex)]

      if (matches.length === 0) return []

      // Параллельно сканируем все найденные sitemap
      const sitemapPromises = matches.map(match =>
        this.scanSitemapUrl(match[1].trim())
      )

      const results = await Promise.allSettled(sitemapPromises)

      for (const result of results) {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
          links.push(...result.value)
        }
      }
    } catch (error) {
      console.error('Error scanning sitemap index:', error)
    }

    return links
  }

  /**
   * Парсит sitemap.xml
   * @param {string} baseUrl - Базовый URL сайта
   * @returns {Promise<Array>} - Массив ссылок
   */
  async scanSitemap(baseUrl) {
    const sitemapUrl = `${baseUrl}/sitemap.xml`
    return this.scanSitemapUrl(sitemapUrl)
  }

  /**
   * Парсит конкретный sitemap URL
   * @param {string} sitemapUrl - URL sitemap
   * @returns {Promise<Array>} - Массив ссылок
   */
  async scanSitemapUrl(sitemapUrl) {
    const links = []

    try {
      const response = await this.fetchWithTimeout(sitemapUrl)
      if (!response.ok) return []

      const text = await response.text()

      // Используем regex для парсинга XML (DOMParser недоступен в Service Worker)
      // Ищем все <url><loc> теги
      const urlLocRegex = /<url>[\s\S]*?<loc>(.*?)<\/loc>[\s\S]*?<\/url>/gi
      const urlMatches = [...text.matchAll(urlLocRegex)]

      for (const match of urlMatches) {
        const url = match[1].trim()
        if (url) {
          links.push(url)
        }
      }

      // Также проверяем, не является ли это sitemap index
      const sitemapLocRegex = /<sitemap>[\s\S]*?<loc>(.*?)<\/loc>[\s\S]*?<\/sitemap>/gi
      const sitemapMatches = [...text.matchAll(sitemapLocRegex)]

      if (sitemapMatches.length > 0) {
        // Рекурсивно сканируем вложенные sitemap
        const sitemapPromises = sitemapMatches.map(match =>
          this.scanSitemapUrl(match[1].trim())
        )

        const results = await Promise.allSettled(sitemapPromises)

        for (const result of results) {
          if (result.status === 'fulfilled' && Array.isArray(result.value)) {
            links.push(...result.value)
          }
        }
      }
    } catch (error) {
      console.error('Error scanning sitemap:', error)
    }

    return links
  }

  /**
   * Парсит robots.txt
   * @param {string} baseUrl - Базовый URL сайта
   * @returns {Promise<Array>} - Массив ссылок из robots.txt
   */
  async scanRobotsTxt(baseUrl) {
    const robotsUrl = `${baseUrl}/robots.txt`
    const links = []

    try {
      const response = await this.fetchWithTimeout(robotsUrl)
      if (!response.ok) return []

      const text = await response.text()
      const lines = text.split('\n')

      // Собираем все sitemap URL для параллельной обработки
      const sitemapUrls = []

      for (const line of lines) {
        const trimmed = line.trim()

        // Ищем Sitemap: директивы
        if (trimmed.toLowerCase().startsWith('sitemap:')) {
          const sitemapUrl = trimmed.substring(8).trim()
          if (sitemapUrl) {
            sitemapUrls.push(sitemapUrl)
          }
        }

        // Ищем Allow: директивы (могут содержать интересные URL)
        if (trimmed.toLowerCase().startsWith('allow:')) {
          const allowedPath = trimmed.substring(6).trim()
          if (allowedPath && allowedPath !== '/') {
            const fullUrl = normalizeUrl(allowedPath, baseUrl)
            links.push(fullUrl)
          }
        }

        // Ищем Disallow: директивы (запрещенные страницы)
        if (trimmed.toLowerCase().startsWith('disallow:')) {
          const disallowedPath = trimmed.substring(9).trim()
          if (disallowedPath && disallowedPath !== '/' && disallowedPath !== '') {
            const fullUrl = normalizeUrl(disallowedPath, baseUrl)
            // Помечаем как disallowed для специальной категории
            links.push(`[DISALLOW]${fullUrl}`)
          }
        }
      }

      // Обрабатываем все sitemap параллельно
      if (sitemapUrls.length > 0) {
        console.log(`Found ${sitemapUrls.length} sitemap(s) in robots.txt:`, sitemapUrls)
        const sitemapPromises = sitemapUrls.map(url => this.scanSitemapUrl(url))
        const results = await Promise.allSettled(sitemapPromises)

        for (const result of results) {
          if (result.status === 'fulfilled' && Array.isArray(result.value)) {
            links.push(...result.value)
          }
        }
      }
    } catch (error) {
      console.error('Error scanning robots.txt:', error)
    }

    return links
  }

  /**
   * Сканирует альтернативные пути sitemap
   * @param {string} baseUrl - Базовый URL сайта
   * @returns {Promise<Array>} - Массив ссылок
   */
  async scanAlternativeSitemaps(baseUrl) {
    const alternativePaths = [
      '/sitemap-index.xml',
      '/post-sitemap.xml',
      '/page-sitemap.xml',
      '/category-sitemap.xml',
      '/product-sitemap.xml',
      '/sitemap1.xml',
      '/sitemap/sitemap.xml',
      '/wp-sitemap.xml',
      '/sitemap_index.xml.gz'
    ]

    const links = []

    // Пробуем все альтернативные пути параллельно
    const promises = alternativePaths.map(path =>
      this.scanSitemapUrl(`${baseUrl}${path}`)
    )

    const results = await Promise.allSettled(promises)

    for (const result of results) {
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        links.push(...result.value)
      }
    }

    return links
  }

  /**
   * Fetch с таймаутом
   * @param {string} url - URL для запроса
   * @returns {Promise<Response>} - Response объект
   */
  async fetchWithTimeout(url) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SiteLinkExplorer/1.0)'
        }
      })
      return response
    } finally {
      clearTimeout(timeoutId)
    }
  }

  /**
   * Получает прогресс сканирования (для UI)
   * @returns {Object} - Объект с информацией о прогрессе
   */
  getProgress() {
    return {
      status: 'scanning',
      message: 'Сканирование сайта...'
    }
  }
}

// Экспортируем singleton instance
export default new ScannerService()
