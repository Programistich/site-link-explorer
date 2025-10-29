import { defineStore } from 'pinia'
import { getScanResults, extractDomain } from '../services/storage.js'

export const useLinksStore = defineStore('links', {
  state: () => ({
    // Текущий домен
    currentDomain: '',

    // Все найденные ссылки
    links: [],

    // Группированные ссылки по категориям
    grouped: {},

    // Общее количество ссылок
    totalCount: 0,

    // Статус загрузки
    loading: false,

    // Ошибка
    error: null,

    // Поисковый запрос
    searchQuery: '',

    // Выбранная категория для фильтрации (null = все)
    selectedCategory: null,

    // Timestamp последнего сканирования
    lastScanTimestamp: null
  }),

  getters: {
    /**
     * Фильтрованные ссылки по поисковому запросу и категории
     */
    filteredLinks(state) {
      let filtered = [...state.links]

      // Фильтрация по категории
      if (state.selectedCategory) {
        const categoryLinks = state.grouped[state.selectedCategory]?.links || []
        // Убираем префиксы [DISALLOW] перед сравнением
        filtered = filtered.filter(link => {
          const cleanLink = link.startsWith('[DISALLOW]') ? link.substring(10) : link
          return categoryLinks.includes(cleanLink)
        })
      }

      // Фильтрация по поисковому запросу
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase()
        filtered = filtered.filter(link => {
          const cleanLink = link.startsWith('[DISALLOW]') ? link.substring(10) : link
          return cleanLink.toLowerCase().includes(query)
        })
      }

      return filtered
    },

    /**
     * Фильтрованные ссылки без служебных префиксов для отображения
     */
    displayLinks(state) {
      return this.filteredLinks.map(link => {
        if (link.startsWith('[DISALLOW]')) {
          return link.substring(10)
        }
        return link
      })
    },

    /**
     * Категории с количеством ссылок
     */
    categoriesWithCount(state) {
      return Object.entries(state.grouped).map(([id, group]) => ({
        id,
        ...group.category,
        count: group.count
      }))
    },

    /**
     * Интересные ссылки (все кроме категории OTHER)
     */
    interestingLinks(state) {
      const interesting = []

      for (const [id, group] of Object.entries(state.grouped)) {
        if (id !== 'other' && group.links.length > 0) {
          interesting.push(...group.links)
        }
      }

      return interesting
    },

    /**
     * Время с последнего сканирования в читаемом формате
     */
    lastScanFormatted(state) {
      if (!state.lastScanTimestamp) return null

      const now = Date.now()
      const diff = now - state.lastScanTimestamp
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)

      if (minutes < 1) return 'только что'
      if (minutes < 60) return `${minutes} мин назад`
      if (hours < 24) return `${hours} ч назад`
      return `${days} д назад`
    }
  },

  actions: {
    /**
     * Загружает результаты сканирования для текущей вкладки
     */
    async loadCurrentTabResults() {
      this.loading = true
      this.error = null

      try {
        // Получаем текущую активную вкладку
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

        if (!tab || !tab.url) {
          throw new Error('Не удалось получить текущую вкладку')
        }

        // Извлекаем домен
        const domain = extractDomain(tab.url)
        this.currentDomain = domain

        // Получаем результаты из хранилища
        const results = await getScanResults(domain)

        if (results) {
          this.links = results.links || []
          this.grouped = results.grouped || {}
          this.totalCount = results.totalCount || 0
          this.lastScanTimestamp = results.timestamp
        } else {
          // Если результатов нет, запускаем сканирование
          await this.scanCurrentTab()
        }
      } catch (error) {
        console.error('Error loading results:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    /**
     * Запускает сканирование текущей вкладки
     */
    async scanCurrentTab() {
      this.loading = true
      this.error = null

      try {
        // Получаем текущую активную вкладку
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

        if (!tab || !tab.url) {
          throw new Error('Не удалось получить текущую вкладку')
        }

        // Отправляем сообщение background script для начала сканирования
        const response = await chrome.runtime.sendMessage({
          action: 'scan',
          url: tab.url
        })

        if (response.success) {
          this.links = response.data.links || []
          this.grouped = response.data.grouped || {}
          this.totalCount = response.data.totalCount || 0
          this.lastScanTimestamp = Date.now()
          this.currentDomain = response.data.domain
        } else {
          throw new Error(response.error || 'Ошибка сканирования')
        }
      } catch (error) {
        console.error('Error scanning:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    /**
     * Устанавливает поисковый запрос
     */
    setSearchQuery(query) {
      this.searchQuery = query
    },

    /**
     * Устанавливает выбранную категорию
     */
    setSelectedCategory(categoryId) {
      this.selectedCategory = categoryId
    },

    /**
     * Сбрасывает фильтры
     */
    resetFilters() {
      this.searchQuery = ''
      this.selectedCategory = null
    },

    /**
     * Открывает ссылку в новой вкладке
     */
    async openLink(url) {
      try {
        await chrome.tabs.create({ url })
      } catch (error) {
        console.error('Error opening link:', error)
      }
    },

    /**
     * Экспортирует ссылки в CSV
     */
    exportToCSV() {
      const csv = ['URL,Category']

      for (const [categoryId, group] of Object.entries(this.grouped)) {
        for (const link of group.links) {
          csv.push(`"${link}","${group.category.name}"`)
        }
      }

      const blob = new Blob([csv.join('\n')], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${this.currentDomain}_links_${Date.now()}.csv`
      a.click()
      URL.revokeObjectURL(url)
    },

    /**
     * Экспортирует ссылки в JSON
     */
    exportToJSON() {
      const data = {
        domain: this.currentDomain,
        timestamp: this.lastScanTimestamp,
        totalCount: this.totalCount,
        categories: this.grouped,
        links: this.links
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${this.currentDomain}_links_${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }
})
