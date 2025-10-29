// Система категорий и паттернов для классификации ссылок

export const LINK_CATEGORIES = {
  CONVERSION: {
    id: 'conversion',
    name: 'Conversion Pages',
    icon: '💰',
    priority: 1,
    patterns: [
      'success',
      'thank',
      'thanks',
      'thank-you',
      'thankyou',
      'confirmation',
      'complete',
      'completed',
      'checkout',
      'cart',
      'order',
      'purchase',
      'payment',
      'paid'
    ]
  },
  PARTNER: {
    id: 'partner',
    name: 'Partner Programs',
    icon: '🤝',
    priority: 2,
    patterns: [
      'affiliate',
      'partner',
      'referral',
      'refer',
      'program',
      'commission'
    ]
  },
  ADMIN: {
    id: 'admin',
    name: 'Administrative',
    icon: '🔐',
    priority: 3,
    patterns: [
      'admin',
      'dashboard',
      'login',
      'signin',
      'sign-in',
      'wp-admin',
      'backend',
      'panel',
      'console',
      'manage'
    ]
  },
  API: {
    id: 'api',
    name: 'API & Documentation',
    icon: '📡',
    priority: 4,
    patterns: [
      'api',
      'docs',
      'documentation',
      'swagger',
      'graphql',
      'rest',
      'endpoint',
      'developer',
      'dev'
    ]
  },
  DISALLOWED: {
    id: 'disallowed',
    name: 'Disallowed',
    icon: '🚫',
    priority: 5,
    patterns: [
      // Эта категория заполняется динамически из robots.txt
    ]
  },
  USER: {
    id: 'user',
    name: 'User Pages',
    icon: '👤',
    priority: 6,
    patterns: [
      'signup',
      'register',
      'join',
      'account',
      'profile',
      'settings',
      'user',
      'member',
      'subscription'
    ]
  },
  CONTACT: {
    id: 'contact',
    name: 'Contact',
    icon: '📧',
    priority: 7,
    patterns: [
      'contact',
      'support',
      'help',
      'feedback',
      'about',
      'about-us',
      'team',
      'mailto:'
    ]
  },
  LEGAL: {
    id: 'legal',
    name: 'Legal',
    icon: '⚖️',
    priority: 8,
    patterns: [
      'privacy',
      'terms',
      'legal',
      'gdpr',
      'cookie',
      'disclaimer',
      'policy',
      'compliance'
    ]
  },
  CONTENT: {
    id: 'content',
    name: 'Blog & Content',
    icon: '📝',
    priority: 9,
    patterns: [
      'blog',
      'news',
      'press',
      'article',
      'post',
      'media',
      'story',
      'stories'
    ]
  },
  FILES: {
    id: 'files',
    name: 'Files & Resources',
    icon: '💾',
    priority: 10,
    patterns: [
      '.pdf',
      '.zip',
      '.doc',
      '.xls',
      'download',
      'resources',
      'assets',
      'files',
      'uploads'
    ]
  },
  SERVICE: {
    id: 'service',
    name: 'Service',
    icon: '🔧',
    priority: 11,
    patterns: [
      'search',
      'sitemap.html',
      'rss',
      'feed',
      '404',
      'error',
      'status',
      'health'
    ]
  },
  OTHER: {
    id: 'other',
    name: 'Other Links',
    icon: '📄',
    priority: 99,
    patterns: []
  }
}

/**
 * Классифицирует URL по категориям
 * @param {string} url - URL для классификации
 * @param {Object} customPatterns - Пользовательские паттерны {categoryId: [patterns]}
 * @param {Array} customCategories - Пользовательские категории [{name, icon, patterns}]
 * @param {Object} removedDefaults - Скрытые дефолтные паттерны {categoryId: [patterns]}
 * @returns {Object} - Объект категории с очищенным URL
 */
export function categorizeUrl(url, customPatterns = {}, customCategories = [], removedDefaults = {}) {
  // Проверяем специальные метки
  let cleanUrl = url
  let isDisallowed = false

  if (url.startsWith('[DISALLOW]')) {
    isDisallowed = true
    cleanUrl = url.substring(10) // Убираем метку [DISALLOW]
  }

  // Если это Disallow ссылка, возвращаем сразу категорию DISALLOWED
  if (isDisallowed) {
    return { ...LINK_CATEGORIES.DISALLOWED, cleanUrl }
  }

  const urlLower = cleanUrl.toLowerCase()

  // Сначала проверяем пользовательские категории
  for (let i = 0; i < customCategories.length; i++) {
    const cat = customCategories[i]
    const patterns = cat.patterns || []

    for (const pattern of patterns) {
      if (urlLower.includes(pattern.toLowerCase())) {
        return {
          id: `custom_${i}`,
          name: cat.name,
          icon: cat.icon,
          priority: 0.5 + i * 0.01, // Высокий приоритет для пользовательских
          cleanUrl
        }
      }
    }
  }

  // Проходим по всем стандартным категориям кроме OTHER и DISALLOWED
  for (const category of Object.values(LINK_CATEGORIES)) {
    if (category.id === 'other' || category.id === 'disallowed') continue

    // Фильтруем стандартные паттерны (убираем скрытые)
    const removedForCategory = removedDefaults[category.id] || []
    const activeDefaultPatterns = category.patterns.filter(
      p => !removedForCategory.includes(p)
    )

    // Объединяем стандартные и пользовательские паттерны
    const allPatterns = [
      ...activeDefaultPatterns,
      ...(customPatterns[category.id] || [])
    ]

    // Проверяем, содержит ли URL паттерн из категории
    for (const pattern of allPatterns) {
      if (urlLower.includes(pattern.toLowerCase())) {
        return { ...category, cleanUrl }
      }
    }
  }

  // Если не подошла ни одна категория, возвращаем OTHER
  return { ...LINK_CATEGORIES.OTHER, cleanUrl }
}

/**
 * Группирует массив ссылок по категориям
 * @param {Array} links - Массив URL
 * @param {Object} customPatterns - Пользовательские паттерны
 * @param {Array} customCategories - Пользовательские категории
 * @param {Array} categoryOrder - Пользовательский порядок категорий (массив ID категорий)
 * @param {Object} removedDefaults - Скрытые дефолтные паттерны
 * @returns {Object} - Объект с группированными ссылками
 */
export function groupLinksByCategory(links, customPatterns = {}, customCategories = [], categoryOrder = null, removedDefaults = {}) {
  const grouped = {}

  // Инициализируем группы для стандартных категорий
  for (const category of Object.values(LINK_CATEGORIES)) {
    grouped[category.id] = {
      category,
      links: [],
      count: 0
    }
  }

  // Инициализируем группы для пользовательских категорий
  for (let i = 0; i < customCategories.length; i++) {
    const cat = customCategories[i]
    const customId = `custom_${i}`
    grouped[customId] = {
      category: {
        id: customId,
        name: cat.name,
        icon: cat.icon,
        priority: 0.5 + i * 0.01,
        patterns: cat.patterns || []
      },
      links: [],
      count: 0
    }
  }

  // Распределяем ссылки по категориям
  for (const link of links) {
    const result = categorizeUrl(link, customPatterns, customCategories, removedDefaults)
    const cleanUrl = result.cleanUrl || link
    const categoryId = result.id

    // Используем очищенный URL без меток
    if (grouped[categoryId]) {
      grouped[categoryId].links.push(cleanUrl)
      grouped[categoryId].count++
    }
  }

  // Если указан пользовательский порядок, применяем его
  if (categoryOrder && Array.isArray(categoryOrder)) {
    const orderedGroups = {}
    let priority = 1

    // Сначала добавляем категории в заданном порядке
    for (const categoryId of categoryOrder) {
      if (grouped[categoryId]) {
        const group = grouped[categoryId]
        group.category.priority = priority++
        orderedGroups[categoryId] = group
      }
    }

    // Затем добавляем оставшиеся категории
    for (const categoryId in grouped) {
      if (!orderedGroups[categoryId]) {
        orderedGroups[categoryId] = grouped[categoryId]
      }
    }

    return orderedGroups
  }

  // Сортируем по приоритету
  return Object.values(grouped)
    .sort((a, b) => a.category.priority - b.category.priority)
    .reduce((acc, group) => {
      acc[group.category.id] = group
      return acc
    }, {})
}

/**
 * Добавляет пользовательский паттерн в категорию
 * @param {string} categoryId - ID категории
 * @param {string} pattern - Новый паттерн
 */
export function addCustomPattern(categoryId, pattern) {
  const category = LINK_CATEGORIES[categoryId.toUpperCase()]
  if (category && !category.patterns.includes(pattern.toLowerCase())) {
    category.patterns.push(pattern.toLowerCase())
  }
}

/**
 * Удаляет дубликаты ссылок (игнорируя query параметры)
 * @param {Array} links - Массив URL
 * @returns {Array} - Массив уникальных URL
 */
export function removeDuplicateLinks(links) {
  const seen = new Set()
  return links.filter(link => {
    try {
      const url = new URL(link)
      const cleanUrl = `${url.origin}${url.pathname}`
      if (seen.has(cleanUrl)) {
        return false
      }
      seen.add(cleanUrl)
      return true
    } catch {
      // Если URL невалиден, все равно добавляем (может быть относительным)
      if (seen.has(link)) {
        return false
      }
      seen.add(link)
      return true
    }
  })
}

/**
 * Нормализует URL (добавляет протокол если нужно)
 * @param {string} url - URL или путь
 * @param {string} baseUrl - Базовый URL сайта
 * @returns {string} - Нормализованный URL
 */
export function normalizeUrl(url, baseUrl) {
  try {
    // Если URL уже полный, возвращаем как есть
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }

    // Если начинается с //, добавляем протокол
    if (url.startsWith('//')) {
      const base = new URL(baseUrl)
      return `${base.protocol}${url}`
    }

    // Если относительный путь, добавляем базовый URL
    if (url.startsWith('/')) {
      const base = new URL(baseUrl)
      return `${base.origin}${url}`
    }

    // Если путь без /, добавляем базовый URL с /
    const base = new URL(baseUrl)
    return `${base.origin}/${url}`
  } catch {
    return url
  }
}
