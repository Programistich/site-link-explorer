import { normalizeUrl, removeDuplicateLinks } from '../utils/patterns.js'

/**
 * Сервіс для сканування сайтів і витягування посилань
 */
export class ScannerService {
  constructor() {
    this.timeout = 10000 // 10 секунд таймаут для запитів
  }

  /**
   * Основний метод сканування сайту
   * @param {string} baseUrl - URL сайту для сканування
   * @returns {Promise<Array>} - Масив знайдених посилань
   */
  async scanSite(baseUrl) {
    const links = new Set()

    try {
      // Нормалізуємо базовий URL
      const normalizedBaseUrl = this.normalizeBaseUrl(baseUrl)

      // Паралельно запускаємо всі методи сканування
      const results = await Promise.allSettled([
        this.scanSitemapIndex(normalizedBaseUrl),
        this.scanSitemap(normalizedBaseUrl),
        this.scanRobotsTxt(normalizedBaseUrl),
        this.scanAlternativeSitemaps(normalizedBaseUrl)
      ])

      // Збираємо всі знайдені посилання
      for (const result of results) {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
          result.value.forEach(link => links.add(link))
        }
      }

      // Перетворюємо Set у масив, прибираємо дублікати та повертаємо
      return removeDuplicateLinks(Array.from(links))
    } catch (error) {
      console.error('Error scanning site:', error)
      return []
    }
  }

  /**
   * Нормалізує базовий URL
   * @param {string} url - URL для нормалізації
   * @returns {string} - Нормалізований URL
   */
  normalizeBaseUrl(url) {
    try {
      const urlObj = new URL(url)
      return `${urlObj.protocol}//${urlObj.host}`
    } catch {
      // Якщо URL невалідний, пробуємо додати https://
      if (!url.startsWith('http')) {
        return `https://${url}`
      }
      return url
    }
  }

  /**
   * Парсить sitemap_index.xml
   * @param {string} baseUrl - Базовий URL сайту
   * @returns {Promise<Array>} - Масив посилань з усіх sitemap
   */
  async scanSitemapIndex(baseUrl) {
    const sitemapIndexUrl = `${baseUrl}/sitemap_index.xml`
    const links = []

    try {
      const response = await this.fetchWithTimeout(sitemapIndexUrl)
      if (!response.ok) return []

      const text = await response.text()

      // Використовуємо regex для парсингу XML (DOMParser недоступний у Service Worker)
      const sitemapLocRegex = /<sitemap>[\s\S]*?<loc>(.*?)<\/loc>[\s\S]*?<\/sitemap>/gi
      const matches = [...text.matchAll(sitemapLocRegex)]

      if (matches.length === 0) return []

      // Паралельно скануємо всі знайдені sitemap
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
   * Парсить sitemap.xml
   * @param {string} baseUrl - Базовий URL сайту
   * @returns {Promise<Array>} - Масив посилань
   */
  async scanSitemap(baseUrl) {
    const sitemapUrl = `${baseUrl}/sitemap.xml`
    return this.scanSitemapUrl(sitemapUrl)
  }

  /**
   * Парсить конкретний sitemap URL
   * @param {string} sitemapUrl - URL sitemap
   * @returns {Promise<Array>} - Масив посилань
   */
  async scanSitemapUrl(sitemapUrl) {
    const links = []

    try {
      const response = await this.fetchWithTimeout(sitemapUrl)
      if (!response.ok) return []

      const text = await response.text()

      // Використовуємо regex для парсингу XML (DOMParser недоступний у Service Worker)
      // Шукаємо всі теги <url><loc>
      const urlLocRegex = /<url>[\s\S]*?<loc>(.*?)<\/loc>[\s\S]*?<\/url>/gi
      const urlMatches = [...text.matchAll(urlLocRegex)]

      for (const match of urlMatches) {
        const url = match[1].trim()
        if (url) {
          links.push(url)
        }
      }

      // Також перевіряємо, чи це не sitemap index
      const sitemapLocRegex = /<sitemap>[\s\S]*?<loc>(.*?)<\/loc>[\s\S]*?<\/sitemap>/gi
      const sitemapMatches = [...text.matchAll(sitemapLocRegex)]

      if (sitemapMatches.length > 0) {
        // Рекурсивно скануємо вкладені sitemap
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
   * Парсить robots.txt
   * @param {string} baseUrl - Базовий URL сайту
   * @returns {Promise<Array>} - Масив посилань з robots.txt
   */
  async scanRobotsTxt(baseUrl) {
    const robotsUrl = `${baseUrl}/robots.txt`
    const links = []

    try {
      const response = await this.fetchWithTimeout(robotsUrl)
      if (!response.ok) return []

      const text = await response.text()
      const lines = text.split('\n')

      // Збираємо всі sitemap URL для паралельної обробки
      const sitemapUrls = []

      for (const line of lines) {
        const trimmed = line.trim()

        // Шукаємо директиви Sitemap:
        if (trimmed.toLowerCase().startsWith('sitemap:')) {
          const sitemapUrl = trimmed.substring(8).trim()
          if (sitemapUrl) {
            sitemapUrls.push(sitemapUrl)
          }
        }

        // Шукаємо директиви Allow: (можуть містити цікаві URL)
        if (trimmed.toLowerCase().startsWith('allow:')) {
          const allowedPath = trimmed.substring(6).trim()
          if (allowedPath && allowedPath !== '/') {
            const fullUrl = normalizeUrl(allowedPath, baseUrl)
            links.push(fullUrl)
          }
        }

        // Шукаємо директиви Disallow: (заборонені сторінки)
        if (trimmed.toLowerCase().startsWith('disallow:')) {
          const disallowedPath = trimmed.substring(9).trim()
          if (disallowedPath && disallowedPath !== '/' && disallowedPath !== '') {
            const fullUrl = normalizeUrl(disallowedPath, baseUrl)
            // Позначаємо як disallowed для спеціальної категорії
            links.push(`[DISALLOW]${fullUrl}`)
          }
        }
      }

      // Обробляємо всі sitemap паралельно
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
   * Сканує альтернативні шляхи sitemap
   * @param {string} baseUrl - Базовий URL сайту
   * @returns {Promise<Array>} - Масив посилань
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

    // Пробуємо всі альтернативні шляхи паралельно
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
   * Fetch із таймаутом
   * @param {string} url - URL для запиту
   * @returns {Promise<Response>} - Об'єкт Response
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
   * Отримує прогрес сканування (для UI)
   * @returns {Object} - Об'єкт з інформацією про прогрес
   */
  getProgress() {
    return {
      status: 'scanning',
      message: 'Сканування сайту...'
    }
  }
}

// Експортуємо singleton instance
export default new ScannerService()
