// Система категорій і патернів для класифікації посилань

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
      // Ця категорія заповнюється динамічно з robots.txt
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
 * Класифікує URL за категоріями
 * @param {string} url - URL для класифікації
 * @param {Object} customPatterns - Користувацькі патерни {categoryId: [patterns]}
 * @param {Array} customCategories - Користувацькі категорії [{name, icon, patterns}]
 * @param {Object} removedDefaults - Приховані дефолтні патерни {categoryId: [patterns]}
 * @returns {Object} - Об'єкт категорії з очищеним URL
 */
export function categorizeUrl(url, customPatterns = {}, customCategories = [], removedDefaults = {}) {
  // Перевіряємо спеціальні мітки
  let cleanUrl = url
  let isDisallowed = false

  if (url.startsWith('[DISALLOW]')) {
    isDisallowed = true
    cleanUrl = url.substring(10) // Прибираємо мітку [DISALLOW]
  }

  // Якщо це Disallow-посилання, одразу повертаємо категорію DISALLOWED
  if (isDisallowed) {
    return { ...LINK_CATEGORIES.DISALLOWED, cleanUrl }
  }

  const urlLower = cleanUrl.toLowerCase()

  // Спочатку перевіряємо користувацькі категорії
  for (let i = 0; i < customCategories.length; i++) {
    const cat = customCategories[i]
    const patterns = cat.patterns || []

    for (const pattern of patterns) {
      if (urlLower.includes(pattern.toLowerCase())) {
        return {
          id: `custom_${i}`,
          name: cat.name,
          icon: cat.icon,
          priority: 0.5 + i * 0.01, // Високий пріоритет для користувацьких
          cleanUrl
        }
      }
    }
  }

  // Проходимо по всіх стандартних категоріях, окрім OTHER і DISALLOWED
  for (const category of Object.values(LINK_CATEGORIES)) {
    if (category.id === 'other' || category.id === 'disallowed') continue

    // Фільтруємо стандартні патерни (прибираємо приховані)
    const removedForCategory = removedDefaults[category.id] || []
    const activeDefaultPatterns = category.patterns.filter(
      p => !removedForCategory.includes(p)
    )

    // Об'єднуємо стандартні та користувацькі патерни
    const allPatterns = [
      ...activeDefaultPatterns,
      ...(customPatterns[category.id] || [])
    ]

    // Перевіряємо, чи містить URL патерн із категорії
    for (const pattern of allPatterns) {
      if (urlLower.includes(pattern.toLowerCase())) {
        return { ...category, cleanUrl }
      }
    }
  }

  // Якщо не підійшла жодна категорія, повертаємо OTHER
  return { ...LINK_CATEGORIES.OTHER, cleanUrl }
}

/**
 * Групує масив посилань за категоріями
 * @param {Array} links - Масив URL
 * @param {Object} customPatterns - Користувацькі патерни
 * @param {Array} customCategories - Користувацькі категорії
 * @param {Array} categoryOrder - Користувацький порядок категорій (масив ID категорій)
 * @param {Object} removedDefaults - Приховані дефолтні патерни
 * @returns {Object} - Об'єкт зі згрупованими посиланнями
 */
export function groupLinksByCategory(links, customPatterns = {}, customCategories = [], categoryOrder = null, removedDefaults = {}) {
  const grouped = {}

  // Ініціалізуємо групи для стандартних категорій
  for (const category of Object.values(LINK_CATEGORIES)) {
    grouped[category.id] = {
      category,
      links: [],
      count: 0
    }
  }

  // Ініціалізуємо групи для користувацьких категорій
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

  // Розподіляємо посилання за категоріями
  for (const link of links) {
    const result = categorizeUrl(link, customPatterns, customCategories, removedDefaults)
    const cleanUrl = result.cleanUrl || link
    const categoryId = result.id

    // Використовуємо очищений URL без міток
    if (grouped[categoryId]) {
      grouped[categoryId].links.push(cleanUrl)
      grouped[categoryId].count++
    }
  }

  // Якщо вказаний користувацький порядок, застосовуємо його
  if (categoryOrder && Array.isArray(categoryOrder)) {
    const orderedGroups = {}
    let priority = 1

    // Спочатку додаємо категорії в заданому порядку
    for (const categoryId of categoryOrder) {
      if (grouped[categoryId]) {
        const group = grouped[categoryId]
        group.category.priority = priority++
        orderedGroups[categoryId] = group
      }
    }

    // Потім додаємо категорії, що лишилися
    for (const categoryId in grouped) {
      if (!orderedGroups[categoryId]) {
        orderedGroups[categoryId] = grouped[categoryId]
      }
    }

    return orderedGroups
  }

  // Сортуємо за пріоритетом
  return Object.values(grouped)
    .sort((a, b) => a.category.priority - b.category.priority)
    .reduce((acc, group) => {
      acc[group.category.id] = group
      return acc
    }, {})
}

/**
 * Додає користувацький патерн до категорії
 * @param {string} categoryId - ID категорії
 * @param {string} pattern - Новий патерн
 */
export function addCustomPattern(categoryId, pattern) {
  const category = LINK_CATEGORIES[categoryId.toUpperCase()]
  if (category && !category.patterns.includes(pattern.toLowerCase())) {
    category.patterns.push(pattern.toLowerCase())
  }
}

/**
 * Видаляє дублікати посилань (ігноруючи query параметри)
 * @param {Array} links - Масив URL
 * @returns {Array} - Масив унікальних URL
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
      // Якщо URL невалідний, все одно додаємо (може бути відносним)
      if (seen.has(link)) {
        return false
      }
      seen.add(link)
      return true
    }
  })
}

/**
 * Нормалізує URL (додає протокол за потреби)
 * @param {string} url - URL або шлях
 * @param {string} baseUrl - Базовий URL сайту
 * @returns {string} - Нормалізований URL
 */
export function normalizeUrl(url, baseUrl) {
  try {
    // Якщо URL уже повний, повертаємо як є
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }

    // Якщо починається з //, додаємо протокол
    if (url.startsWith('//')) {
      const base = new URL(baseUrl)
      return `${base.protocol}${url}`
    }

    // Якщо відносний шлях, додаємо базовий URL
    if (url.startsWith('/')) {
      const base = new URL(baseUrl)
      return `${base.origin}${url}`
    }

    // Якщо шлях без /, додаємо базовий URL з /
    const base = new URL(baseUrl)
    return `${base.origin}/${url}`
  } catch {
    return url
  }
}
