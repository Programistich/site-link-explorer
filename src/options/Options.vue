<template>
  <div class="options" :data-theme="settings.theme">
    <header class="header">
      <h1>⚙️ {{ $t('settingsTitle') }}</h1>
    </header>

    <main class="content">
      <!-- General Settings -->
      <section class="section">
        <h2>{{ $t('generalSettings') }}</h2>

        <div class="setting">
          <div class="setting-info">
            <label class="setting-label">{{ $t('autoScan') }}</label>
            <p class="setting-description">
              {{ $t('autoScanDesc') }}
            </p>
          </div>
          <label class="toggle">
            <input
              type="checkbox"
              v-model="settings.autoScan"
              @change="saveSettings"
            />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="setting">
          <div class="setting-info">
            <label class="setting-label">{{ $t('language') }}</label>
            <p class="setting-description">
              {{ $t('languageDesc') }}
            </p>
          </div>
          <select
            v-model="currentLocale"
            @change="changeLanguage"
            class="select"
          >
            <option v-for="locale in $locales" :key="locale.code" :value="locale.code">
              {{ locale.flag }} {{ locale.name }}
            </option>
          </select>
        </div>

        <div class="setting">
          <div class="setting-info">
            <label class="setting-label">{{ $t('theme') }}</label>
            <p class="setting-description">
              {{ $t('themeDesc') }}
            </p>
          </div>
          <select
            v-model="settings.theme"
            @change="saveSettings"
            class="select"
          >
            <option value="light">{{ $t('themeLight') }}</option>
            <option value="dark">{{ $t('themeDark') }}</option>
            <option value="auto">{{ $t('themeAuto') }}</option>
          </select>
        </div>

        <div class="setting">
          <div class="setting-info">
            <label class="setting-label">{{ $t('maxHistoryItemsLabel') }}</label>
            <p class="setting-description">
              {{ $t('maxHistoryItemsDesc') }}
            </p>
          </div>
          <input
            type="number"
            v-model.number="settings.maxHistoryItems"
            @change="saveSettings"
            min="10"
            max="100"
            class="input-number"
          />
        </div>
      </section>

      <!-- Categories & Patterns Management -->
      <section class="section">
        <h2>{{ $t('categoriesAndPatterns') }}</h2>
        <p class="section-description">
          {{ $t('categoriesAndPatternsDesc') }}
        </p>

        <!-- Categories List -->
        <div class="unified-categories-list">
          <div
            v-for="(category, index) in sortableCategories"
            :key="category.id"
            class="unified-category-item"
            :class="{ 'expanded': expandedCategories[category.id] }"
          >
            <!-- Category Header -->
            <div class="unified-category-header">
              <div class="unified-category-main" @click="toggleCategoryExpand(category.id)">
                <span class="unified-category-icon">{{ category.icon }}</span>

                <!-- Редагування назви -->
                <input
                  v-if="editingCategoryIndex === index"
                  v-model="editingCategoryName"
                  @keypress.enter="saveCategoryName(index)"
                  @blur="cancelEditCategoryName"
                  @click.stop
                  class="category-name-input"
                  ref="categoryNameInput"
                />
                <span v-else class="unified-category-name">
                  {{ category.displayName || category.name }}
                </span>

                <span class="unified-expand-icon">
                  {{ expandedCategories[category.id] ? '▼' : '▶' }}
                </span>
              </div>

              <div class="unified-category-controls">
                <!-- Кнопка редагування -->
                <button
                  v-if="editingCategoryIndex !== index"
                  @click.stop="startEditCategoryName(index)"
                  class="btn-icon"
                  :title="$t('rename')"
                >
                  ✏️
                </button>
                <button
                  v-else
                  @click.stop="saveCategoryName(index)"
                  class="btn-icon"
                  :title="$t('save')"
                >
                  ✓
                </button>

                <!-- Кнопка видалення/приховування -->
                <button
                  @click.stop="toggleCategoryVisibility(category.id)"
                  class="btn-icon"
                  :title="category.id.startsWith('custom_') ? $t('delete') : $t('hide')"
                >
                  {{ category.id.startsWith('custom_') ? '🗑️' : '👁️' }}
                </button>

                <!-- Кнопки переміщення -->
                <button
                  @click.stop="moveCategoryUp(index)"
                  :disabled="index === 0"
                  class="btn-arrow"
                  :title="$t('moveUp')"
                >
                  ▲
                </button>
                <button
                  @click.stop="moveCategoryDown(index)"
                  :disabled="index === sortableCategories.length - 1"
                  class="btn-arrow"
                  :title="$t('moveDown')"
                >
                  ▼
                </button>
              </div>
            </div>

            <!-- Category Content (Patterns) -->
            <div v-if="expandedCategories[category.id]" class="unified-category-content">
              <!-- Приклади патернів -->
              <div v-if="getExamples(category.id).length > 0" class="pattern-examples">
                <span class="examples-label">{{ $t('examples') }}</span>
                <span class="example-item" v-for="(pattern, idx) in getExamples(category.id)" :key="idx">
                  {{ pattern }}
                </span>
              </div>

              <!-- Input для додавання патерна -->
              <div class="pattern-input-group">
                <input
                  type="text"
                  v-model="newPatterns[category.id]"
                  @keypress.enter="addPattern(category.id)"
                  :placeholder="`${$t('addPattern')} - ${category.displayName || category.name}`"
                  class="input"
                />
                <button
                  @click="addPattern(category.id)"
                  class="btn btn-primary"
                >
                  {{ $t('addPattern') }}
                </button>
              </div>

              <!-- Дефолтні патерни -->
              <div v-if="getCategoryPatternsFromDefinition(category.id)?.length > 0">
                <button
                  @click="toggleDefaultPatterns(category.id)"
                  class="btn-text"
                >
                  {{ showDefaultPatterns[category.id] ? $t('hideDefaultPatterns') : $t('showDefaultPatterns') }} ({{ getCategoryPatternsFromDefinition(category.id).length }})
                </button>

                <div v-if="showDefaultPatterns[category.id]" class="patterns-list">
                  <div class="patterns-section-label">
                    <span>{{ $t('standardPatterns') }}</span>
                  </div>
                  <span
                    v-for="(pattern, idx) in getCategoryPatternsFromDefinition(category.id)"
                    :key="`default-${idx}`"
                    class="pattern-tag pattern-tag-default"
                  >
                    {{ pattern }}
                    <button
                      @click="removeDefaultPattern(category.id, pattern)"
                      class="pattern-remove"
                      :title="$t('hidePattern')"
                    >
                      ✕
                    </button>
                  </span>
                </div>
              </div>

              <!-- Користувацькі патерни -->
              <div v-if="getCategoryCustomPatterns(category.id)?.length > 0" class="patterns-list">
                <div class="patterns-section-label">
                  <span>{{ $t('yourPatterns') }}</span>
                </div>
                <span
                  v-for="(pattern, idx) in getCategoryCustomPatterns(category.id)"
                  :key="`custom-${idx}`"
                  class="pattern-tag pattern-tag-custom"
                >
                  {{ pattern }}
                  <button
                    @click="removePatternFromCategory(category.id, idx)"
                    class="pattern-remove"
                  >
                    ✕
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Приховані категорії -->
        <div v-if="hiddenCategories.length > 0" class="hidden-categories-section">
          <h3>{{ $t('hiddenCategories') }}</h3>
          <div class="hidden-categories-list">
            <div
              v-for="category in hiddenCategories"
              :key="category.id"
              class="hidden-category-item"
            >
              <span>{{ category.icon }} {{ category.displayName || category.name }}</span>
              <button
                @click="restoreCategory(category.id)"
                class="btn-text-small"
              >
                {{ $t('restore') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Створення нової категорії -->
        <div class="create-category-section">
          <h3>✨ {{ $t('createNewCategory') }}</h3>
          <div class="custom-category-input">
            <input
              type="text"
              v-model="newCategoryName"
              :placeholder="$t('categoryNamePlaceholder')"
              class="input"
              style="flex: 2;"
            />
            <input
              type="text"
              v-model="newCategoryIcon"
              :placeholder="$t('iconPlaceholder')"
              class="input"
              style="flex: 0 0 80px;"
              maxlength="2"
            />
            <button
              @click="addCustomCategory"
              class="btn btn-primary"
            >
              {{ $t('createCategory') }}
            </button>
          </div>
        </div>

        <button @click="resetCategoryOrder" class="btn btn-secondary" style="margin-top: 16px;">
          {{ $t('resetOrder') }}
        </button>
      </section>

      <!-- History -->
      <section class="section">
        <h2>{{ $t('scanHistory') }}</h2>
        <p class="section-description">
          {{ $t('scanHistoryDesc') }}
        </p>

        <div class="history-stats">
          <div class="stat">
            <span class="stat-label">{{ $t('historyItems') }}</span>
            <span class="stat-value">{{ historyCount }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">{{ $t('memoryUsed') }}</span>
            <span class="stat-value">{{ formatBytes(storageSize) }}</span>
          </div>
        </div>

        <div class="history-list" v-if="history.length > 0">
          <div
            v-for="item in history"
            :key="item.timestamp"
            class="history-item"
          >
            <span class="history-domain">{{ item.domain }}</span>
            <span class="history-count">{{ item.totalCount }} {{ $t('linksCount') }}</span>
            <span class="history-time">{{ formatTime(item.timestamp) }}</span>
          </div>
        </div>

        <div class="button-group">
          <button @click="clearHistory" class="btn btn-danger">
            {{ $t('clearHistory') }}
          </button>
          <button @click="clearCache" class="btn btn-warning">
            {{ $t('clearCache') }}
          </button>
        </div>
      </section>
    </main>

    <!-- Success Toast -->
    <transition name="toast">
      <div v-if="showToast" class="toast toast-success">
        {{ toastMessage }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  getUserSettings,
  saveUserSettings,
  getCustomPatterns,
  saveCustomPatterns,
  getScanHistory,
  clearScanHistory,
  clearCache as clearStorageCache,
  getStorageSize,
  getCategoryOrder,
  saveCategoryOrder
} from '../services/storage.js'
import { LINK_CATEGORIES } from '../utils/patterns.js'
import { getCurrentLocale } from '../utils/i18n.js'
import { setLocale } from '../plugins/i18n.js';

// Settings
const settings = ref({
  autoScan: true,
  theme: 'auto',
  maxHistoryItems: 50
})

// Custom patterns
const customPatterns = ref({})
const newPatterns = ref({})
const removedDefaultPatterns = ref({}) // Зберігає приховані дефолтні патерни
const showDefaultPatterns = ref({}) // Чи показувати дефолтні патерни для категорії
const expandedCategories = ref({}) // Які категорії розгорнуті

// Custom categories
const customCategories = ref([])
const newCategoryName = ref('')
const newCategoryIcon = ref('')

// Categories
const categories = Object.values(LINK_CATEGORIES).filter(c => c.id !== 'other')

// Category ordering
const sortableCategories = ref([])
const hiddenCategories = ref([])
const editingCategoryIndex = ref(null)
const editingCategoryName = ref('')
const categoryNameInput = ref(null)
const categoryRenames = ref({}) // {categoryId: newName}
const hiddenCategoryIds = ref([]) // [categoryId1, categoryId2]

// Pattern examples for each category
const patternExamples = {
  conversion: ['promo', 'discount', 'deal', 'offer', 'sale'],
  partner: ['collab', 'partnership', 'reseller', 'ambassador'],
  admin: ['control', 'management', 'moderator', 'staff'],
  api: ['webhook', 'integration', 'sdk', 'v1', 'v2'],
  disallowed: ['private', 'internal', 'test', 'staging'],
  user: ['my-account', 'preferences', 'billing', 'plan'],
  contact: 'mailto, chat, phone, email, call'.split(', '),
  legal: ['tos', 'copyright', 'license', 'dmca'],
  content: ['tutorial', 'guide', 'announcement', 'release'],
  files: ['.csv', '.json', '.xml', '.txt', 'export'],
  service: ['ping', '404.html', 'robots.txt', 'ads.txt']
}

// History
const history = ref([])
const historyCount = ref(0)
const storageSize = ref(0)

// Toast
const showToast = ref(false)
const toastMessage = ref('')

// Language
const currentLocale = ref(getCurrentLocale())

// Load settings on mount
onMounted(async () => {
  await loadSettings()
  await loadCustomPatterns()
  await loadHistory()
  await loadStorageSize()
  await loadCategoryOrder()

  // Listen for storage changes from other sources
  chrome.storage.onChanged.addListener(async (changes, areaName) => {
    if (areaName === 'local') {
      if (changes.custom_patterns) {
        // Reload patterns if changed externally
        await loadCustomPatterns()
      }
      if (changes.category_order) {
        // Reload category order if changed
        await loadCategoryOrder()
      }
    }
  })
})

// Load settings
async function loadSettings() {
  settings.value = await getUserSettings()
}

// Save settings
async function saveSettings() {
  await saveUserSettings(settings.value)
  showToastMessage($t('settingsSaved'))
}

// Change language
async function changeLanguage() {
  await setLocale(currentLocale.value)
  showToastMessage($t('languageChanged'))
  // Перезавантажуємо сторінку для застосування нової мови
  setTimeout(() => {
    window.location.reload()
  }, 1000)
}

// Load custom patterns
async function loadCustomPatterns() {
  const patterns = await getCustomPatterns()
  customPatterns.value = patterns.patterns || {}
  customCategories.value = patterns.categories || []
  removedDefaultPatterns.value = patterns.removedDefaults || {}
  categoryRenames.value = patterns.categoryRenames || {}
  hiddenCategoryIds.value = patterns.hiddenCategories || []

  // Reload category order when custom categories change
  await loadCategoryOrder()
}

// Get examples for category
function getExamples(categoryId) {
  return patternExamples[categoryId] || []
}

// Toggle category expand/collapse
function toggleCategoryExpand(categoryId) {
  expandedCategories.value[categoryId] = !expandedCategories.value[categoryId]
}

// Get category patterns from LINK_CATEGORIES definition
function getCategoryPatternsFromDefinition(categoryId) {
  const category = Object.values(LINK_CATEGORIES).find(c => c.id === categoryId)
  return category?.patterns || []
}

// Get custom patterns for a category
function getCategoryCustomPatterns(categoryId) {
  if (categoryId.startsWith('custom_')) {
    const index = parseInt(categoryId.replace('custom_', ''))
    return customCategories.value[index]?.patterns || []
  }
  return customPatterns.value[categoryId] || []
}

// Remove pattern from category
async function removePatternFromCategory(categoryId, patternIndex) {
  if (categoryId.startsWith('custom_')) {
    const catIndex = parseInt(categoryId.replace('custom_', ''))
    customCategories.value[catIndex].patterns.splice(patternIndex, 1)
  } else {
    if (customPatterns.value[categoryId]) {
      customPatterns.value[categoryId].splice(patternIndex, 1)
    }
  }
  await saveAllPatterns()
  showToastMessage($t('patternRemoved'))
}

// Add pattern
async function addPattern(categoryId) {
  const pattern = newPatterns.value[categoryId]?.trim()

  if (!pattern) return

  if (categoryId.startsWith('custom_')) {
    // Для користувацьких категорій
    const catIndex = parseInt(categoryId.replace('custom_', ''))
    if (!customCategories.value[catIndex].patterns) {
      customCategories.value[catIndex].patterns = []
    }
    if (!customCategories.value[catIndex].patterns.includes(pattern)) {
      customCategories.value[catIndex].patterns.push(pattern)
      await saveAllPatterns()
      newPatterns.value[categoryId] = ''
      showToastMessage($t('patternAdded'))
    }
  } else {
    // Для стандартних категорій
    if (!customPatterns.value[categoryId]) {
      customPatterns.value[categoryId] = []
    }
    if (!customPatterns.value[categoryId].includes(pattern)) {
      customPatterns.value[categoryId].push(pattern)
      await saveAllPatterns()
      newPatterns.value[categoryId] = ''
      showToastMessage($t('patternAdded'))
    }
  }
}

// Remove pattern
async function removePattern(categoryId, index) {
  customPatterns.value[categoryId].splice(index, 1)
  await saveAllPatterns()
  showToastMessage($t('patternRemoved'))
}

// Toggle default patterns visibility
function toggleDefaultPatterns(categoryId) {
  showDefaultPatterns.value[categoryId] = !showDefaultPatterns.value[categoryId]
}

// Remove default pattern (приховує патерн)
async function removeDefaultPattern(categoryId, pattern) {
  if (!removedDefaultPatterns.value[categoryId]) {
    removedDefaultPatterns.value[categoryId] = []
  }

  if (!removedDefaultPatterns.value[categoryId].includes(pattern)) {
    removedDefaultPatterns.value[categoryId].push(pattern)
    await saveAllPatterns()
    showToastMessage($t('patternHidden'))
  }
}

// Add custom category
async function addCustomCategory() {
  const name = newCategoryName.value.trim()
  const icon = newCategoryIcon.value.trim() || '📌'

  if (!name) {
    showToastMessage($t('enterCategoryName'))
    return
  }

  customCategories.value.push({
    name,
    icon,
    patterns: []
  })

  await saveAllPatterns()
  await loadCategoryOrder() // Перезавантажуємо список категорій
  newCategoryName.value = ''
  newCategoryIcon.value = ''
  showToastMessage($t('categoryCreated'))
}

// Remove custom category
async function removeCustomCategory(index) {
  if (confirm($t('confirmDeleteCategory'))) {
    customCategories.value.splice(index, 1)
    await saveAllPatterns()
    showToastMessage($t('categoryDeleted'))
  }
}

// Add pattern to custom category
async function addCustomCategoryPattern(categoryIndex) {
  const pattern = newPatterns.value[`custom_${categoryIndex}`]?.trim()

  if (!pattern) return

  if (!customCategories.value[categoryIndex].patterns) {
    customCategories.value[categoryIndex].patterns = []
  }

  if (!customCategories.value[categoryIndex].patterns.includes(pattern)) {
    customCategories.value[categoryIndex].patterns.push(pattern)
    await saveAllPatterns()
    newPatterns.value[`custom_${categoryIndex}`] = ''
    showToastMessage($t('patternAdded'))
  }
}

// Remove pattern from custom category
async function removeCustomCategoryPattern(categoryIndex, patternIndex) {
  customCategories.value[categoryIndex].patterns.splice(patternIndex, 1)
  await saveAllPatterns()
  showToastMessage($t('patternRemoved'))
}

// Save all patterns and categories
async function saveAllPatterns() {
  await saveCustomPatterns({
    patterns: customPatterns.value,
    categories: customCategories.value,
    removedDefaults: removedDefaultPatterns.value,
    categoryRenames: categoryRenames.value,
    hiddenCategories: hiddenCategoryIds.value
  })
}

// Load history
async function loadHistory() {
  history.value = await getScanHistory()
  historyCount.value = history.value.length
}

// Load storage size
async function loadStorageSize() {
  storageSize.value = await getStorageSize()
}

// Clear history
async function clearHistory() {
  if (confirm($t('confirmClearHistory'))) {
    await clearScanHistory()
    await loadHistory()
    showToastMessage($t('historyCleared'))
  }
}

// Clear cache
async function clearCache() {
  if (confirm($t('confirmClearCache'))) {
    await clearStorageCache()
    await loadStorageSize()
    showToastMessage($t('cacheCleared'))
  }
}

// Format bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// Format time
function formatTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleString(currentLocale.value || 'en', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Show toast
function showToastMessage(message) {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

// Category ordering functions
async function loadCategoryOrder() {
  const order = await getCategoryOrder()

  // Створюємо список усіх категорій (стандартних + користувацьких)
  const allCategories = [
    ...categories.map(cat => ({
      ...cat,
      displayName: categoryRenames.value[cat.id] || cat.name
    })),
    ...customCategories.value.map((cat, i) => ({
      id: `custom_${i}`,
      name: cat.name,
      icon: cat.icon,
      displayName: categoryRenames.value[`custom_${i}`] || cat.name
    }))
  ]

  // Фільтруємо приховані категорії
  const visibleCategories = allCategories.filter(
    cat => !hiddenCategoryIds.value.includes(cat.id)
  )

  // Формуємо список прихованих
  hiddenCategories.value = allCategories.filter(
    cat => hiddenCategoryIds.value.includes(cat.id)
  )

  if (order && Array.isArray(order)) {
    // Якщо є збережений порядок, застосовуємо його
    const ordered = []
    for (const categoryId of order) {
      const cat = visibleCategories.find(c => c.id === categoryId)
      if (cat) ordered.push(cat)
    }

    // Додаємо категорії, яких немає у збереженому порядку
    for (const cat of visibleCategories) {
      if (!ordered.find(c => c.id === cat.id)) {
        ordered.push(cat)
      }
    }

    sortableCategories.value = ordered
  } else {
    // Інакше використовуємо порядок за замовчуванням
    sortableCategories.value = visibleCategories
  }
}

// Category rename functions
function startEditCategoryName(index) {
  editingCategoryIndex.value = index
  const category = sortableCategories.value[index]
  editingCategoryName.value = category.displayName || category.name

  // Фокус на input у наступному тіку
  setTimeout(() => {
    if (categoryNameInput.value && categoryNameInput.value[0]) {
      categoryNameInput.value[0].focus()
    }
  }, 0)
}

async function saveCategoryName(index) {
  if (!editingCategoryName.value.trim()) {
    cancelEditCategoryName()
    return
  }

  const category = sortableCategories.value[index]
  categoryRenames.value[category.id] = editingCategoryName.value.trim()

  // Оновлюємо displayName
  category.displayName = editingCategoryName.value.trim()

  editingCategoryIndex.value = null
  editingCategoryName.value = ''

  await saveAllPatterns()
  showToastMessage($t('nameChanged'))
}

function cancelEditCategoryName() {
  editingCategoryIndex.value = null
  editingCategoryName.value = ''
}

// Category visibility functions
async function toggleCategoryVisibility(categoryId) {
  if (categoryId.startsWith('custom_')) {
    // Для користувацьких категорій - видалення
    if (confirm($t('deleteCategoryConfirm'))) {
      const index = parseInt(categoryId.replace('custom_', ''))
      customCategories.value.splice(index, 1)
      await saveAllPatterns()
      await loadCategoryOrder()
      showToastMessage($t('categoryDeleted'))
    }
  } else {
    // Для дефолтних - приховування
    if (!hiddenCategoryIds.value.includes(categoryId)) {
      hiddenCategoryIds.value.push(categoryId)
    }

    await saveAllPatterns()
    await loadCategoryOrder()
    showToastMessage($t('categoryHidden'))
  }
}

async function restoreCategory(categoryId) {
  const index = hiddenCategoryIds.value.indexOf(categoryId)
  if (index > -1) {
    hiddenCategoryIds.value.splice(index, 1)
  }

  await saveAllPatterns()
  await loadCategoryOrder()
  showToastMessage($t('categoryRestored'))
}

function moveCategoryUp(index) {
  if (index === 0) return

  const items = [...sortableCategories.value]
  const temp = items[index]
  items[index] = items[index - 1]
  items[index - 1] = temp

  sortableCategories.value = items

  // Зберігаємо новий порядок
  const order = sortableCategories.value.map(c => c.id)
  saveCategoryOrder(order)
  showToastMessage($t('orderChanged'))
}

function moveCategoryDown(index) {
  if (index === sortableCategories.value.length - 1) return

  const items = [...sortableCategories.value]
  const temp = items[index]
  items[index] = items[index + 1]
  items[index + 1] = temp

  sortableCategories.value = items

  // Зберігаємо новий порядок
  const order = sortableCategories.value.map(c => c.id)
  saveCategoryOrder(order)
  showToastMessage($t('orderChanged'))
}

async function resetCategoryOrder() {
  await saveCategoryOrder(null)
  await loadCategoryOrder()
  showToastMessage($t('orderReset'))
}
</script>

<style scoped>
.options {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
}

.header {
  margin-bottom: 32px;
}

.header h1 {
  font-size: 32px;
  margin-bottom: 8px;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 16px;
}

.section {
  background-color: var(--bg-secondary);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid var(--border-color);
}

.section h2 {
  font-size: 20px;
  margin-bottom: 8px;
}

.section-description {
  color: var(--text-secondary);
  margin-bottom: 20px;
}

/* Settings */
.setting {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
}

.setting:last-child {
  border-bottom: none;
}

.setting-info {
  flex: 1;
}

.setting-label {
  font-weight: 600;
  font-size: 15px;
  display: block;
  margin-bottom: 4px;
}

.setting-description {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
}

/* Toggle Switch */
.toggle {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border-color);
  transition: 0.3s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.toggle input:checked + .toggle-slider {
  background-color: var(--accent-color);
}

.toggle input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

/* Select */
.select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
}

.input-number {
  width: 100px;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
}

/* Patterns */
.pattern-category {
  margin-bottom: 24px;
}

.pattern-category h3 {
  font-size: 16px;
  margin-bottom: 8px;
}

.pattern-examples {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
  padding: 10px;
  background-color: var(--bg-primary);
  border-radius: 6px;
  font-size: 12px;
}

.examples-label {
  font-weight: 600;
  color: var(--text-secondary);
  margin-right: 4px;
}

.example-item {
  padding: 2px 8px;
  background-color: var(--bg-hover);
  border-radius: 4px;
  color: var(--text-secondary);
  font-family: monospace;
}

.pattern-input-group {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
}

.patterns-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.patterns-section-label {
  width: 100%;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  margin-bottom: 8px;
  margin-top: 12px;
}

.pattern-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  font-size: 13px;
}

.pattern-tag-default {
  background-color: var(--bg-secondary);
  border-color: var(--border-color);
}

.pattern-tag-custom {
  background-color: var(--bg-primary);
  border: 1px solid var(--accent-color);
}

.pattern-remove {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 12px;
  padding: 0;
}

.btn-text {
  background: none;
  border: none;
  color: var(--accent-color);
  cursor: pointer;
  font-size: 13px;
  padding: 8px 0;
  text-decoration: underline;
  margin-bottom: 8px;
}

.btn-text:hover {
  opacity: 0.8;
}

/* Unified Categories & Patterns */
.unified-categories-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.unified-category-item {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
}

.unified-category-item.expanded {
  border-color: var(--accent-color);
}

.unified-category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  gap: 12px;
}

.unified-category-header:hover {
  background-color: var(--bg-hover);
}

.unified-category-main {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  cursor: pointer;
  user-select: none;
}

.unified-category-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.unified-category-name {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
}

.unified-expand-icon {
  font-size: 12px;
  color: var(--text-secondary);
  margin-left: auto;
}

.unified-category-controls {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.unified-category-content {
  padding: 0 16px 16px 16px;
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
}

/* Category Order (legacy - keeping for compatibility) */
.category-order-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-order-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.2s;
}

.category-order-item:hover {
  border-color: var(--accent-color);
  background-color: var(--bg-hover);
}

.category-order-controls {
  display: flex;
  gap: 4px;
}

.btn-arrow {
  background: none;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  color: var(--text-primary);
  font-size: 12px;
  transition: all 0.2s;
}

.btn-arrow:hover:not(:disabled) {
  background-color: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.btn-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.btn-icon {
  background: none;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-icon:hover {
  background-color: var(--bg-hover);
}

.category-order-icon {
  font-size: 20px;
}

.category-name-input {
  flex: 1;
  padding: 6px 10px;
  border: 2px solid var(--accent-color);
  border-radius: 6px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
}

.category-name-input:focus {
  outline: none;
  border-color: var(--accent-hover);
}

.hidden-categories-section {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.hidden-categories-section h3 {
  font-size: 16px;
  margin-bottom: 12px;
  color: var(--text-secondary);
}

.hidden-categories-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hidden-category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  opacity: 0.7;
}

.btn-text-small {
  background: none;
  border: none;
  color: var(--accent-color);
  cursor: pointer;
  font-size: 12px;
  text-decoration: underline;
  padding: 4px 8px;
}

.btn-text-small:hover {
  opacity: 0.8;
}

.category-order-name {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
}

/* Custom Categories & Create Category Section */
.custom-categories-section {
  margin-top: 40px;
  padding-top: 24px;
  border-top: 2px solid var(--border-color);
}

.custom-categories-section h3 {
  font-size: 18px;
  margin-bottom: 8px;
}

.create-category-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.create-category-section h3 {
  font-size: 16px;
  margin-bottom: 12px;
}

.custom-category-input {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.custom-categories-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.custom-category-item {
  padding: 16px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.custom-category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.custom-category-header h4 {
  font-size: 16px;
  margin: 0;
}

.btn-icon-danger {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.btn-icon-danger:hover {
  background-color: var(--bg-hover);
}

/* History */
.history-stats {
  display: flex;
  gap: 32px;
  margin-bottom: 20px;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--accent-color);
}

.history-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 16px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
}

.history-item:last-child {
  border-bottom: none;
}

.history-domain {
  flex: 1;
  font-weight: 500;
  font-size: 14px;
}

.history-count {
  font-size: 13px;
  color: var(--text-secondary);
}

.history-time {
  font-size: 12px;
  color: var(--text-secondary);
}

/* Buttons */
.button-group {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background-color: var(--accent-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--accent-hover);
}

.btn-danger {
  background-color: var(--danger-color);
  color: white;
}

.btn-danger:hover {
  opacity: 0.9;
}

.btn-warning {
  background-color: var(--warning-color);
  color: white;
}

.btn-warning:hover {
  opacity: 0.9;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background-color: var(--success-color);
  color: white;
  padding: 16px 24px;
  border-radius: 8px;
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
  transform: translateY(10px);
}
</style>
