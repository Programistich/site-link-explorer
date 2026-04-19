<template>
  <div class="app" :data-theme="theme">
    <!-- Header -->
    <header class="header">
      <div class="header-top">
        <h1 class="title">Site Link Explorer</h1>
        <div class="header-actions">
          <button
            @click="toggleCategoriesExpand"
            class="icon-btn"
            :title="categoriesExpanded ? 'Згорнути категорії' : 'Розгорнути категорії'"
          >
            {{ categoriesExpanded ? '⬆️' : '⬇️' }}
          </button>
          <button
            @click="toggleTheme"
            class="icon-btn"
            :title="theme === 'dark' ? 'Світла тема' : 'Темна тема'"
          >
            {{ theme === 'dark' ? '☀️' : '🌙' }}
          </button>
          <button
            @click="openOptions"
            class="icon-btn"
            title="Налаштування"
          >
            ⚙️
          </button>
        </div>
      </div>

      <div v-if="store.currentDomain" class="domain-info">
        <span class="domain">{{ store.currentDomain }}</span>
        <span v-if="store.lastScanFormatted" class="scan-time">
          {{ store.lastScanFormatted }}
        </span>
      </div>

      <!-- Search -->
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Пошук за посиланнями..."
          class="search-input"
        />
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="clear-btn"
        >
          ✕
        </button>
      </div>

      <!-- Category Filters -->
      <div
        ref="categoriesContainer"
        class="categories"
        :class="{ 'categories-collapsed': !categoriesExpanded }"
        @mousedown="startDrag"
        @mousemove="onDrag"
        @mouseup="stopDrag"
        @mouseleave="stopDrag"
      >
        <button
          @click="selectCategory(null)"
          @mousedown="onButtonMouseDown"
          class="category-btn"
          :class="{ active: store.selectedCategory === null }"
        >
          All ({{ store.totalCount }})
        </button>
        <button
          v-for="category in store.categoriesWithCount"
          :key="category.id"
          @click="selectCategory(category.id)"
          @mousedown="onButtonMouseDown"
          class="category-btn"
          :class="{ active: store.selectedCategory === category.id }"
        >
          <span class="category-icon">{{ category.icon }}</span>
          {{ category.name }} ({{ category.count }})
        </button>
      </div>
    </header>

    <!-- Content -->
    <main class="content">
      <!-- Loading State -->
      <div v-if="store.loading" class="loading">
        <div class="spinner spin"></div>
        <p>Scanning site...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="store.error" class="error">
        <p>❌ {{ store.error }}</p>
        <button @click="store.scanCurrentTab()" class="btn btn-primary">
          Try again
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="store.filteredLinks.length === 0" class="empty">
        <p>Links not founded</p>
        <button @click="store.scanCurrentTab()" class="btn btn-secondary">
          Refresh
        </button>
      </div>

      <!-- Links List -->
      <div v-else class="links-list">
        <div
          v-for="(link, index) in store.displayLinks"
          :key="index"
          class="link-item"
          @click="openLink(link)"
        >
          <span class="link-icon">🔗</span>
          <span class="link-url text-truncate">{{ link }}</span>
          <button
            @click.stop="copyLink(link)"
            class="link-action"
            title="Copy link"
          >
            📋
          </button>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <button
        @click="store.scanCurrentTab()"
        class="btn btn-secondary"
        :disabled="store.loading"
      >
        🔄 Refresh
      </button>
      <div class="export-btns">
        <button
          @click="store.exportToCSV()"
          class="btn btn-outline"
          :disabled="store.links.length === 0"
          title="Експорт у CSV"
        >
          CSV
        </button>
        <button
          @click="store.exportToJSON()"
          class="btn btn-outline"
          :disabled="store.links.length === 0"
          title="Експорт у JSON"
        >
          JSON
        </button>
      </div>
    </footer>

    <!-- Toast Notification -->
    <transition name="toast">
      <div v-if="showToast" class="toast">
        {{ toastMessage }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useLinksStore } from '../stores/links.js'
import { getUserSettings, saveUserSettings } from '../services/storage.js'

const store = useLinksStore()

// Theme
const theme = ref('light')

// Search
const searchQuery = ref('')

// Toast
const showToast = ref(false)
const toastMessage = ref('')

// Categories expand/collapse
const categoriesExpanded = ref(
  localStorage.getItem('categoriesExpanded') !== 'false'
)

// Drag scroll
const categoriesContainer = ref(null)
const isDragging = ref(false)
const startX = ref(0)
const scrollLeft = ref(0)
const isClick = ref(true)

// Computed
const filteredCategories = computed(() => {
  return store.categoriesWithCount.filter(c => c.count > 0)
})

// Load data on mount
onMounted(async () => {
  // Load theme from settings
  const settings = await getUserSettings()

  if (settings.theme === 'auto') {
    // Detect system theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    theme.value = prefersDark ? 'dark' : 'light'
  } else {
    theme.value = settings.theme
  }

  // Load results for current tab
  await store.loadCurrentTabResults()

  // Listen for storage changes to auto-refresh
  chrome.storage.onChanged.addListener(async (changes, areaName) => {
    if (areaName === 'local') {
      // Check if any scan_results key changed (they include domain: scan_results_domain.com)
      const scanResultsChanged = Object.keys(changes).some(key => key.startsWith('scan_results_'))
      if (scanResultsChanged) {
        // Reload results when scan completes
        await store.loadCurrentTabResults()
      }
    }
  })
})

// Watch search query
watch(searchQuery, (newValue) => {
  store.setSearchQuery(newValue)
})

// Methods
function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  saveUserSettings({ theme: theme.value })
}

function openOptions() {
  chrome.runtime.openOptionsPage()
}

function clearSearch() {
  searchQuery.value = ''
}

function selectCategory(categoryId) {
  store.setSelectedCategory(categoryId)
}

function openLink(url) {
  store.openLink(url)
}

function copyLink(link) {
  navigator.clipboard.writeText(link).then(() => {
    showToastMessage('Посилання скопійовано!')
  })
}

function showToastMessage(message) {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

function toggleCategoriesExpand() {
  categoriesExpanded.value = !categoriesExpanded.value
  localStorage.setItem('categoriesExpanded', categoriesExpanded.value.toString())
}

// Drag scroll functions
function startDrag(e) {
  if (!categoriesContainer.value || categoriesExpanded.value) return

  isDragging.value = true
  isClick.value = true
  startX.value = e.pageX - categoriesContainer.value.offsetLeft
  scrollLeft.value = categoriesContainer.value.scrollLeft
  categoriesContainer.value.style.cursor = 'grabbing'
  categoriesContainer.value.style.userSelect = 'none'
}

function onDrag(e) {
  if (!isDragging.value || !categoriesContainer.value) return

  e.preventDefault()
  isClick.value = false // Рух миші - це не клік

  const x = e.pageX - categoriesContainer.value.offsetLeft
  const walk = (x - startX.value) * 2 // Множимо для швидшого скролу
  categoriesContainer.value.scrollLeft = scrollLeft.value - walk
}

function stopDrag() {
  if (!categoriesContainer.value) return

  isDragging.value = false
  categoriesContainer.value.style.cursor = 'grab'
  categoriesContainer.value.style.userSelect = ''
}

function onButtonMouseDown(e) {
  // Зберігаємо початкові координати для визначення кліку
  isClick.value = true
}
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

/* Header */
.header {
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-primary);
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
}

.title {
  font-size: 16px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.icon-btn:hover {
  background-color: var(--bg-hover);
}

.domain-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px 8px;
  font-size: 12px;
}

.domain {
  font-weight: 600;
  color: var(--text-primary);
}

.scan-time {
  color: var(--text-secondary);
}

/* Search */
.search-box {
  position: relative;
  padding: 0 16px 12px;
}

.search-input {
  width: 100%;
  padding: 8px 32px 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: var(--accent-color);
}

.clear-btn {
  position: absolute;
  right: 24px;
  top: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 4px;
  font-size: 14px;
}

/* Categories */
.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0 16px 12px;
  transition: all 0.3s ease;
}

.categories-collapsed {
  flex-wrap: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  cursor: grab;
}

.categories-collapsed:active {
  cursor: grabbing;
}

.categories-collapsed::-webkit-scrollbar {
  height: 4px;
}

.categories-collapsed::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

.categories-collapsed::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 2px;
}

.categories-collapsed::-webkit-scrollbar-thumb:hover {
  background: var(--accent-color);
}

.category-btn {
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
}

.category-btn:hover {
  background-color: var(--bg-hover);
}

.category-btn.active {
  background-color: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.category-icon {
  margin-right: 4px;
}

/* Content */
.content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.loading,
.error,
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
  padding: 32px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-top-color: var(--accent-color);
  border-radius: 50%;
}

/* Links List */
.links-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.link-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background-color: var(--bg-secondary);
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.link-item:hover {
  background-color: var(--bg-hover);
}

.link-icon {
  flex-shrink: 0;
  font-size: 14px;
}

.link-url {
  flex: 1;
  font-size: 13px;
  color: var(--text-primary);
}

.link-action {
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.link-action:hover {
  opacity: 1;
}

/* Footer */
.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-primary);
}

.export-btns {
  display: flex;
  gap: 8px;
}

/* Buttons */
.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--accent-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--accent-hover);
}

.btn-secondary {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--bg-hover);
}

.btn-outline {
  background: none;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-outline:hover:not(:disabled) {
  background-color: var(--bg-secondary);
}

/* Toast */
.toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--text-primary);
  color: var(--bg-primary);
  padding: 12px 20px;
  border-radius: 6px;
  font-size: 13px;
  box-shadow: var(--shadow);
  z-index: 1000;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}
</style>
