import { ScannerService } from '../services/scanner.js'
import { saveScanResults, getScanResults, getUserSettings, extractDomain, getCustomPatterns, getCategoryOrder } from '../services/storage.js'
import { groupLinksByCategory } from '../utils/patterns.js'

// Инициализация service worker
console.log('Site Link Explorer: Service Worker loaded')

// Слушаем события установки расширения
chrome.runtime.onInstalled.addListener(() => {
  console.log('Site Link Explorer: Extension installed')

  // Устанавливаем начальные значения badge
  chrome.action.setBadgeBackgroundColor({ color: '#4285F4' })
})

// Слушаем обновления вкладок
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Проверяем, завершена ли загрузка страницы
  if (changeInfo.status === 'complete' && tab.url) {
    // Получаем настройки
    const settings = await getUserSettings()

    // Если включено автосканирование, запускаем сканирование
    if (settings.autoScan) {
      await scanTab(tab)
    } else {
      // Иначе просто сбрасываем badge
      chrome.action.setBadgeText({ text: '', tabId })
    }
  }
})

// Слушаем переключение между вкладками
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId)
  if (tab.url) {
    const domain = extractDomain(tab.url)
    const cached = await getScanResults(domain)

    if (cached) {
      // Если есть кешированные данные, обновляем badge
      updateBadge(activeInfo.tabId, cached.totalCount)
    } else {
      chrome.action.setBadgeText({ text: '', tabId: activeInfo.tabId })
    }
  }
})

// Слушаем сообщения от popup и других частей расширения
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'scan') {
    // Запускаем сканирование вручную
    handleScanRequest(message.url).then(sendResponse)
    return true // Асинхронный ответ
  }

  if (message.action === 'getResults') {
    // Получаем результаты сканирования
    handleGetResults(message.domain).then(sendResponse)
    return true
  }

  if (message.action === 'updateBadge') {
    // Обновляем badge
    updateBadge(sender.tab?.id, message.count)
    sendResponse({ success: true })
  }

  if (message.action === 'recategorize') {
    // Пересканируем текущую вкладку после изменения категорий
    handleRecategorize().then(sendResponse)
    return true
  }
})

// Слушаем изменения в хранилище (когда меняются категории/паттерны)
chrome.storage.onChanged.addListener(async (changes, areaName) => {
  if (areaName === 'local' && changes.custom_patterns) {
    // Пересканируем текущую активную вкладку
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tab && tab.url) {
        await scanTab(tab)
      }
    } catch (error) {
      console.error('Error rescanning after patterns change:', error)
    }
  }
})

/**
 * Сканирует вкладку
 * @param {Object} tab - Объект вкладки Chrome
 */
async function scanTab(tab) {
  if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
    return
  }

  try {
    const domain = extractDomain(tab.url)

    // Проверяем, есть ли кешированные результаты
    const cached = await getScanResults(domain)

    // Если кеш свежий (менее 1 часа), используем его
    if (cached && (Date.now() - cached.timestamp) < 3600000) {
      updateBadge(tab.id, cached.totalCount)
      return
    }

    // Иначе запускаем новое сканирование
    updateBadge(tab.id, '⋯')

    // Загружаем пользовательские паттерны и категории
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

    // Сохраняем результаты
    await saveScanResults(domain, links, grouped)

    // Обновляем badge
    updateBadge(tab.id, links.length)
  } catch (error) {
    console.error('Error scanning tab:', error)
    updateBadge(tab.id, '!')
  }
}

/**
 * Обрабатывает запрос на сканирование
 * @param {string} url - URL для сканирования
 * @returns {Promise<Object>} - Результаты сканирования
 */
async function handleScanRequest(url) {
  try {
    const domain = extractDomain(url)

    // Загружаем пользовательские паттерны и категории
    const customData = await getCustomPatterns()
    const categoryOrder = await getCategoryOrder()

    // Запускаем сканирование
    const scanner = new ScannerService()
    const links = await scanner.scanSite(url)
    const grouped = groupLinksByCategory(
      links,
      customData.patterns || {},
      customData.categories || [],
      categoryOrder,
      customData.removedDefaults || {}
    )

    // Сохраняем результаты
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
 * Обрабатывает запрос на получение результатов
 * @param {string} domain - Домен
 * @returns {Promise<Object>} - Результаты сканирования
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
 * Обновляет badge на иконке расширения
 * @param {number} tabId - ID вкладки
 * @param {number|string} count - Количество ссылок или текст
 */
function updateBadge(tabId, count) {
  if (tabId) {
    const text = typeof count === 'number'
      ? (count > 999 ? '999+' : count.toString())
      : count.toString()

    chrome.action.setBadgeText({ text, tabId })

    // Меняем цвет в зависимости от статуса
    if (count === '!') {
      chrome.action.setBadgeBackgroundColor({ color: '#EA4335', tabId })
    } else if (count === '⋯') {
      chrome.action.setBadgeBackgroundColor({ color: '#FBBC04', tabId })
    } else {
      chrome.action.setBadgeBackgroundColor({ color: '#4285F4', tabId })
    }
  }
}
