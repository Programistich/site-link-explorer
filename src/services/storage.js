/**
 * Сервис для работы с Chrome Storage API
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
 * Сохраняет результаты сканирования для домена
 * @param {string} domain - Домен сайта
 * @param {Array} links - Массив ссылок
 * @param {Object} grouped - Группированные ссылки
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
    // Сохраняем результаты для конкретного домена
    await chrome.storage.local.set({
      [`${STORAGE_KEYS.SCAN_RESULTS}_${domain}`]: data
    })

    // Добавляем в историю
    await addToHistory(data)

    return true
  } catch (error) {
    console.error('Error saving scan results:', error)
    return false
  }
}

/**
 * Получает результаты сканирования для домена
 * @param {string} domain - Домен сайта
 * @returns {Promise<Object|null>} - Результаты сканирования или null
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
 * Добавляет запись в историю сканирований
 * @param {Object} scanData - Данные сканирования
 * @returns {Promise}
 */
export async function addToHistory(scanData) {
  try {
    // Получаем текущую историю
    const result = await chrome.storage.local.get(STORAGE_KEYS.SCAN_HISTORY)
    let history = result[STORAGE_KEYS.SCAN_HISTORY] || []

    // Добавляем новую запись в начало
    history.unshift({
      domain: scanData.domain,
      timestamp: scanData.timestamp,
      totalCount: scanData.totalCount
    })

    // Получаем настройки
    const settings = await getUserSettings()

    // Ограничиваем размер истории
    if (history.length > settings.maxHistoryItems) {
      history = history.slice(0, settings.maxHistoryItems)
    }

    // Сохраняем обновленную историю
    await chrome.storage.local.set({
      [STORAGE_KEYS.SCAN_HISTORY]: history
    })
  } catch (error) {
    console.error('Error adding to history:', error)
  }
}

/**
 * Получает историю сканирований
 * @returns {Promise<Array>} - Массив записей истории
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
 * Очищает историю сканирований
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
 * Получает настройки пользователя
 * @returns {Promise<Object>} - Настройки пользователя
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
 * Сохраняет настройки пользователя
 * @param {Object} settings - Настройки для сохранения
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
 * Получает пользовательские паттерны
 * @returns {Promise<Object>} - Объект с пользовательскими паттернами
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
 * Сохраняет пользовательские паттерны
 * @param {Object} patterns - Объект с паттернами по категориям и категориями
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
 * Получает порядок категорий пользователя
 * @returns {Promise<Array>} - Массив ID категорий в порядке пользователя
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
 * Сохраняет порядок категорий
 * @param {Array} order - Массив ID категорий
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
 * Очищает весь кеш (результаты сканирования)
 * @returns {Promise}
 */
export async function clearCache() {
  try {
    // Получаем все ключи
    const allData = await chrome.storage.local.get(null)
    const keysToRemove = []

    // Находим все ключи результатов сканирования
    for (const key in allData) {
      if (key.startsWith(STORAGE_KEYS.SCAN_RESULTS)) {
        keysToRemove.push(key)
      }
    }

    // Удаляем все результаты сканирования
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
 * Получает размер использованного хранилища
 * @returns {Promise<number>} - Размер в байтах
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
 * Извлекает домен из URL
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
