/**
 * Сервіс для роботи з Chrome Storage API
 */

const STORAGE_KEYS = {
  SCAN_RESULTS: 'scan_results',
  SCAN_HISTORY: 'scan_history',
  USER_SETTINGS: 'user_settings',
  CUSTOM_PATTERNS: 'custom_patterns'
}

const DEFAULT_SETTINGS = {
  autoScan: true,
  theme: 'auto', // 'light', 'dark', 'auto'
  maxHistoryItems: 50
}

/**
 * Зберігає результати сканування для домену
 * @param {string} domain - Домен сайту
 * @param {Array} links - Масив посилань
 * @param {Object} grouped - Згруповані посилання
 * @returns {Promise}
 */
export async function saveScanResults(domain, links, grouped) {
  const data = {
    domain,
    links,
    grouped,
    timestamp: Date.now(),
    totalCount: links.length
  }

  try {
    // Зберігаємо результати для конкретного домену
    await chrome.storage.local.set({
      [`${STORAGE_KEYS.SCAN_RESULTS}_${domain}`]: data
    })

    // Додаємо в історію
    await addToHistory(data)

    return true
  } catch (error) {
    console.error('Error saving scan results:', error)
    return false
  }
}

/**
 * Отримує результати сканування для домену
 * @param {string} domain - Домен сайту
 * @returns {Promise<Object|null>} - Результати сканування або null
 */
export async function getScanResults(domain) {
  try {
    const key = `${STORAGE_KEYS.SCAN_RESULTS}_${domain}`
    const result = await chrome.storage.local.get(key)
    return result[key] || null
  } catch (error) {
    console.error('Error getting scan results:', error)
    return null
  }
}

/**
 * Додає запис до історії сканувань
 * @param {Object} scanData - Дані сканування
 * @returns {Promise}
 */
export async function addToHistory(scanData) {
  try {
    // Отримуємо поточну історію
    const result = await chrome.storage.local.get(STORAGE_KEYS.SCAN_HISTORY)
    let history = result[STORAGE_KEYS.SCAN_HISTORY] || []

    // Додаємо новий запис на початок
    history.unshift({
      domain: scanData.domain,
      timestamp: scanData.timestamp,
      totalCount: scanData.totalCount
    })

    // Отримуємо налаштування
    const settings = await getUserSettings()

    // Обмежуємо розмір історії
    if (history.length > settings.maxHistoryItems) {
      history = history.slice(0, settings.maxHistoryItems)
    }

    // Зберігаємо оновлену історію
    await chrome.storage.local.set({
      [STORAGE_KEYS.SCAN_HISTORY]: history
    })
  } catch (error) {
    console.error('Error adding to history:', error)
  }
}

/**
 * Отримує історію сканувань
 * @returns {Promise<Array>} - Масив записів історії
 */
export async function getScanHistory() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.SCAN_HISTORY)
    return result[STORAGE_KEYS.SCAN_HISTORY] || []
  } catch (error) {
    console.error('Error getting scan history:', error)
    return []
  }
}

/**
 * Очищає історію сканувань
 * @returns {Promise}
 */
export async function clearScanHistory() {
  try {
    await chrome.storage.local.remove(STORAGE_KEYS.SCAN_HISTORY)
    return true
  } catch (error) {
    console.error('Error clearing scan history:', error)
    return false
  }
}

/**
 * Отримує налаштування користувача
 * @returns {Promise<Object>} - Налаштування користувача
 */
export async function getUserSettings() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.USER_SETTINGS)
    return { ...DEFAULT_SETTINGS, ...(result[STORAGE_KEYS.USER_SETTINGS] || {}) }
  } catch (error) {
    console.error('Error getting user settings:', error)
    return DEFAULT_SETTINGS
  }
}

/**
 * Зберігає налаштування користувача
 * @param {Object} settings - Налаштування для збереження
 * @returns {Promise}
 */
export async function saveUserSettings(settings) {
  try {
    const currentSettings = await getUserSettings()
    const updatedSettings = { ...currentSettings, ...settings }

    await chrome.storage.local.set({
      [STORAGE_KEYS.USER_SETTINGS]: updatedSettings
    })

    return true
  } catch (error) {
    console.error('Error saving user settings:', error)
    return false
  }
}

/**
 * Отримує користувацькі патерни
 * @returns {Promise<Object>} - Об'єкт із користувацькими патернами
 */
export async function getCustomPatterns() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.CUSTOM_PATTERNS)
    return result[STORAGE_KEYS.CUSTOM_PATTERNS] || {}
  } catch (error) {
    console.error('Error getting custom patterns:', error)
    return {}
  }
}

/**
 * Зберігає користувацькі патерни
 * @param {Object} patterns - Об'єкт із патернами за категоріями та категоріями
 * @returns {Promise}
 */
export async function saveCustomPatterns(patterns) {
  try {
    await chrome.storage.local.set({
      [STORAGE_KEYS.CUSTOM_PATTERNS]: patterns
    })
    return true
  } catch (error) {
    console.error('Error saving custom patterns:', error)
    return false
  }
}

/**
 * Отримує порядок категорій користувача
 * @returns {Promise<Array>} - Масив ID категорій у порядку користувача
 */
export async function getCategoryOrder() {
  try {
    const result = await chrome.storage.local.get('category_order')
    return result.category_order || null
  } catch (error) {
    console.error('Error getting category order:', error)
    return null
  }
}

/**
 * Зберігає порядок категорій
 * @param {Array} order - Масив ID категорій
 * @returns {Promise}
 */
export async function saveCategoryOrder(order) {
  try {
    await chrome.storage.local.set({ category_order: order })
    return true
  } catch (error) {
    console.error('Error saving category order:', error)
    return false
  }
}

/**
 * Очищає весь кеш (результати сканування)
 * @returns {Promise}
 */
export async function clearCache() {
  try {
    // Отримуємо всі ключі
    const allData = await chrome.storage.local.get(null)
    const keysToRemove = []

    // Знаходимо всі ключі результатів сканування
    for (const key in allData) {
      if (key.startsWith(STORAGE_KEYS.SCAN_RESULTS)) {
        keysToRemove.push(key)
      }
    }

    // Видаляємо всі результати сканування
    if (keysToRemove.length > 0) {
      await chrome.storage.local.remove(keysToRemove)
    }

    return true
  } catch (error) {
    console.error('Error clearing cache:', error)
    return false
  }
}

/**
 * Отримує розмір використаного сховища
 * @returns {Promise<number>} - Розмір у байтах
 */
export async function getStorageSize() {
  try {
    const bytesInUse = await chrome.storage.local.getBytesInUse()
    return bytesInUse
  } catch (error) {
    console.error('Error getting storage size:', error)
    return 0
  }
}

/**
 * Витягує домен із URL
 * @param {string} url - URL
 * @returns {string} - Домен
 */
export function extractDomain(url) {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return url
  }
}
