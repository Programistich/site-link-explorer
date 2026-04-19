import { ScannerService } from '../services/scanner.js'
import { saveScanResults, getScanResults, getUserSettings, extractDomain, getCustomPatterns, getCategoryOrder } from '../services/storage.js'
import { groupLinksByCategory } from '../utils/patterns.js'

// Ініціалізація service worker
console.log('Site Link Explorer: Service Worker loaded')

function isScannableUrl(url) {
  if (!url) return false

  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

// Слухаємо події встановлення розширення
chrome.runtime.onInstalled.addListener(() => {
  console.log('Site Link Explorer: Extension installed')

  // Встановлюємо початкові значення badge
  chrome.action.setBadgeBackgroundColor({ color: '#4285F4' })
})

// Слухаємо оновлення вкладок
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Перевіряємо, чи завершене завантаження сторінки
  if (changeInfo.status === 'complete') {
    if (!isScannableUrl(tab.url)) {
      chrome.action.setBadgeText({ text: '', tabId })
      return
    }

    // Отримуємо налаштування
    const settings = await getUserSettings()

    // Якщо ввімкнене автосканування, запускаємо сканування
    if (settings.autoScan) {
      await scanTab(tab)
    } else {
      // Інакше просто скидаємо badge
      chrome.action.setBadgeText({ text: '', tabId })
    }
  }
})

// Слухаємо перемикання між вкладками
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId)
  if (isScannableUrl(tab.url)) {
    const domain = extractDomain(tab.url)
    const cached = await getScanResults(domain)

    if (cached) {
      // Якщо є кешовані дані, оновлюємо badge
      updateBadge(activeInfo.tabId, cached.totalCount)
    } else {
      chrome.action.setBadgeText({ text: '', tabId: activeInfo.tabId })
    }
  } else {
    chrome.action.setBadgeText({ text: '', tabId: activeInfo.tabId })
  }
})

// Слухаємо повідомлення від popup та інших частин розширення
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'scan') {
    // Запускаємо сканування вручну
    handleScanRequest(message.url).then(sendResponse)
    return true // Асинхронна відповідь
  }

  if (message.action === 'getResults') {
    // Отримуємо результати сканування
    handleGetResults(message.domain).then(sendResponse)
    return true
  }

  if (message.action === 'updateBadge') {
    // Оновлюємо badge
    updateBadge(sender.tab?.id, message.count)
    sendResponse({ success: true })
  }

  if (message.action === 'recategorize') {
    // Перескановуємо поточну вкладку після зміни категорій
    handleRecategorize().then(sendResponse)
    return true
  }
})

// Слухаємо зміни у сховищі (коли змінюються категорії/патерни)
chrome.storage.onChanged.addListener(async (changes, areaName) => {
  if (areaName === 'local' && changes.custom_patterns) {
    // Перескановуємо поточну активну вкладку
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tab && isScannableUrl(tab.url)) {
        await scanTab(tab)
      }
    } catch (error) {
      console.error('Error rescanning after patterns change:', error)
    }
  }
})

/**
 * Сканує вкладку
 * @param {Object} tab - Об'єкт вкладки Chrome
 */
async function scanTab(tab) {
  if (!isScannableUrl(tab.url)) {
    return
  }

  try {
    const domain = extractDomain(tab.url)

    // Перевіряємо, чи є кешовані результати
    const cached = await getScanResults(domain)

    // Якщо кеш свіжий (менше 1 години), використовуємо його
    if (cached && (Date.now() - cached.timestamp) < 3600000) {
      updateBadge(tab.id, cached.totalCount)
      return
    }

    // Інакше запускаємо нове сканування
    updateBadge(tab.id, '⋯')

    // Завантажуємо користувацькі патерни та категорії
    const customData = await getCustomPatterns()
    const categoryOrder = await getCategoryOrder()

    const scanner = new ScannerService()
    const links = await scanner.scanSite(tab.url)
    const grouped = groupLinksByCategory(
      links,
      customData.patterns || {},
      customData.categories || [],
      categoryOrder,
      customData.removedDefaults || {}
    )

    // Зберігаємо результати
    await saveScanResults(domain, links, grouped)

    // Оновлюємо badge
    updateBadge(tab.id, links.length)
  } catch (error) {
    console.error('Error scanning tab:', error)
    updateBadge(tab.id, '!')
  }
}

/**
 * Обробляє запит на сканування
 * @param {string} url - URL для сканування
 * @returns {Promise<Object>} - Результати сканування
 */
async function handleScanRequest(url) {
  try {
    const domain = extractDomain(url)

    // Завантажуємо користувацькі патерни та категорії
    const customData = await getCustomPatterns()
    const categoryOrder = await getCategoryOrder()

    // Запускаємо сканування
    const scanner = new ScannerService()
    const links = await scanner.scanSite(url)
    const grouped = groupLinksByCategory(
      links,
      customData.patterns || {},
      customData.categories || [],
      categoryOrder,
      customData.removedDefaults || {}
    )

    // Зберігаємо результати
    await saveScanResults(domain, links, grouped)

    return {
      success: true,
      data: {
        domain,
        links,
        grouped,
        totalCount: links.length
      }
    }
  } catch (error) {
    console.error('Error handling scan request:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Обробляє запит на отримання результатів
 * @param {string} domain - Домен
 * @returns {Promise<Object>} - Результати сканування
 */
async function handleGetResults(domain) {
  try {
    const results = await getScanResults(domain)

    if (results) {
      return {
        success: true,
        data: results
      }
    } else {
      return {
        success: false,
        error: 'No results found'
      }
    }
  } catch (error) {
    console.error('Error getting results:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Оновлює badge на іконці розширення
 * @param {number} tabId - ID вкладки
 * @param {number|string} count - Кількість посилань або текст
 */
function updateBadge(tabId, count) {
  if (tabId) {
    const text = typeof count === 'number'
      ? (count > 999 ? '999+' : count.toString())
      : count.toString()

    chrome.action.setBadgeText({ text, tabId })

    // Змінюємо колір залежно від статусу
    if (count === '!') {
      chrome.action.setBadgeBackgroundColor({ color: '#EA4335', tabId })
    } else if (count === '⋯') {
      chrome.action.setBadgeBackgroundColor({ color: '#FBBC04', tabId })
    } else {
      chrome.action.setBadgeBackgroundColor({ color: '#4285F4', tabId })
    }
  }
}
