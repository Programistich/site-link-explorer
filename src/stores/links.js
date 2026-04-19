import { defineStore } from 'pinia'
import { getScanResults, extractDomain } from '../services/storage.js'

export const useLinksStore = defineStore('links', {
  state: () => ({
    // Поточний домен
    currentDomain: '',

    // Усі знайдені посилання
    links: [],

    // Згруповані посилання за категоріями
    grouped: {},

    // Загальна кількість посилань
    totalCount: 0,

    // Статус завантаження
    loading: false,

    // Помилка
    error: null,

    // Пошуковий запит
    searchQuery: '',

    // Обрана категорія для фільтрації (null = усі)
    selectedCategory: null,

    // Timestamp останнього сканування
    lastScanTimestamp: null
  }),

  getters: {
    /**
     * Відфільтровані посилання за пошуковим запитом і категорією
     */
    filteredLinks(state) {
      let filtered = [...state.links]

      // Фільтрація за категорією
      if (state.selectedCategory) {
        const categoryLinks = state.grouped[state.selectedCategory]?.links || []
        // Прибираємо префікси [DISALLOW] перед порівнянням
        filtered = filtered.filter(link => {
          const cleanLink = link.startsWith('[DISALLOW]') ? link.substring(10) : link
          return categoryLinks.includes(cleanLink)
        })
      }

      // Фільтрація за пошуковим запитом
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
     * Відфільтровані посилання без службових префіксів для відображення
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
     * Категорії з кількістю посилань
     */
    categoriesWithCount(state) {
      return Object.entries(state.grouped).map(([id, group]) => ({
        id,
        ...group.category,
        count: group.count
      }))
    },

    /**
     * Цікаві посилання (усі, окрім категорії OTHER)
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
     * Час від останнього сканування в читабельному форматі
     */
    lastScanFormatted(state) {
      if (!state.lastScanTimestamp) return null

      const now = Date.now()
      const diff = now - state.lastScanTimestamp
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)

      if (minutes < 1) return 'щойно'
      if (minutes < 60) return `${minutes} хв тому`
      if (hours < 24) return `${hours} год тому`
      return `${days} дн тому`
    }
  },

  actions: {
    /**
     * Завантажує результати сканування для поточної вкладки
     */
    async loadCurrentTabResults() {
      this.loading = true
      this.error = null

      try {
        // Отримуємо поточну активну вкладку
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

        if (!tab || !tab.url) {
          throw new Error('Не вдалося отримати поточну вкладку')
        }

        // Витягуємо домен
        const domain = extractDomain(tab.url)
        this.currentDomain = domain

        // Отримуємо результати зі сховища
        const results = await getScanResults(domain)

        if (results) {
          this.links = results.links || []
          this.grouped = results.grouped || {}
          this.totalCount = results.totalCount || 0
          this.lastScanTimestamp = results.timestamp
        } else {
          // Якщо результатів немає, запускаємо сканування
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
     * Запускає сканування поточної вкладки
     */
    async scanCurrentTab() {
      this.loading = true
      this.error = null

      try {
        // Отримуємо поточну активну вкладку
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

        if (!tab || !tab.url) {
          throw new Error('Не вдалося отримати поточну вкладку')
        }

        // Надсилаємо повідомлення background script для запуску сканування
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
          throw new Error(response.error || 'Помилка сканування')
        }
      } catch (error) {
        console.error('Error scanning:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    /**
     * Встановлює пошуковий запит
     */
    setSearchQuery(query) {
      this.searchQuery = query
    },

    /**
     * Встановлює обрану категорію
     */
    setSelectedCategory(categoryId) {
      this.selectedCategory = categoryId
    },

    /**
     * Скидає фільтри
     */
    resetFilters() {
      this.searchQuery = ''
      this.selectedCategory = null
    },

    /**
     * Відкриває посилання в новій вкладці
     */
    async openLink(url) {
      try {
        await chrome.tabs.create({ url })
      } catch (error) {
        console.error('Error opening link:', error)
      }
    },

    /**
     * Експортує посилання в CSV
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
     * Експортує посилання в JSON
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
