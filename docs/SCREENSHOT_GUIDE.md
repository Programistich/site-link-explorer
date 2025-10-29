# Screenshot Guide for Chrome Web Store

Я создал несколько скриншотов с помощью MCP Browser, но для полного набора скриншотов рекомендую создать их вручную. Вот подробная инструкция.

## ✅ Уже созданные скриншоты (через MCP Browser)

1. **Settings Page - General** - Страница настроек с общими настройками
2. **Categories Management** - Управление категориями (все категории видны)
3. **Create New Category** - Секция создания новой категории

## 📋 Скриншоты, которые нужно создать вручную

### Требования Chrome Web Store:
- **Размер:** 1280x800px или 640x400px
- **Формат:** PNG или JPEG
- **Минимум:** 1 скриншот (обязательно)
- **Рекомендуется:** 5 скриншотов
- **Максимум:** 5 скриншотов

---

## 🎯 Рекомендуемые скриншоты

### Screenshot 1: Main Popup with Scan Results (ПРИОРИТЕТ!)
**Описание для Store:** "Scan and categorize links instantly - see all discovered pages organized by type"

**Как создать:**
1. Установите расширение в Chrome (Load unpacked from `dist/`)
2. Откройте сайт с sitemap.xml (например: https://www.wikipedia.org или https://github.com)
3. Кликните на иконку расширения в тулбаре
4. Дождитесь завершения сканирования
5. Сделайте скриншот popup окна (400x600px примерно)
6. Откройте скриншот в редакторе и добавьте белый фон вокруг
7. Resize до 1280x800px (можно добавить поясняющий текст по бокам)

**Что должно быть видно:**
- Заголовок "Site Link Explorer"
- Поисковая строка
- Категории с количеством ссылок (например: "💰 Conversion Pages (5)")
- Несколько раскрытых категорий с реальными ссылками
- Кнопки экспорта (CSV, JSON)
- Кнопка Refresh

---

### Screenshot 2: Settings Page - Categories Management
**Описание для Store:** "Customize categories, add your own patterns, and organize links your way"

**Как создать:**
1. Правой кнопкой на иконку расширения → Options
2. Прокрутите до секции "Categories & Patterns"
3. Раскройте 1-2 категории (кликните на стрелку ▶)
4. Показать паттерны внутри категории
5. Сделайте скриншот всего окна
6. Crop и resize до 1280x800px

**Что должно быть видно:**
- Список всех категорий с иконками
- Кнопки управления (✏️ Rename, 👁️ Hide, ▲▼ Reorder)
- Раскрытая категория с паттернами внутри
- Секция "Create New Category" внизу

---

### Screenshot 3: Dark Theme
**Описание для Store:** "Beautiful dark theme for comfortable work at any time of day"

**Как создать:**
1. Откройте Options
2. В секции "General Settings" → Theme → выберите "Dark"
3. Подождите применения темы
4. Сделайте скриншот
5. Resize до 1280x800px

**Что должно быть видно:**
- Темная тема применена ко всему интерфейсу
- Все элементы хорошо читаемы
- Категории с иконками

---

### Screenshot 4: Export Options
**Описание для Store:** "Export discovered links to CSV or JSON format for further analysis"

**Как создать:**
**Вариант A (если popup работает):**
1. Откройте popup с результатами сканирования
2. Наведите на кнопку CSV или JSON (чтобы показать hover state)
3. Сделайте скриншот

**Вариант B (создать в редакторе):**
1. Возьмите скриншот popup с результатами
2. В Photoshop/Figma добавьте стрелку к кнопкам экспорта
3. Добавьте текст "Export to CSV or JSON"

---

### Screenshot 5: Multi-language Support
**Описание для Store:** "Available in 5 languages: English, Spanish, Russian, German, and French"

**Как создать:**
1. Откройте Options
2. В секции Language покажите dropdown с языками
3. Или сделайте 2 скриншота на разных языках и объедините в один
4. Resize до 1280x800px

**Альтернатива:** Покажите секцию "Scan History" с реальными данными

---

## 🛠️ Инструменты для создания скриншотов

### Метод 1: Chrome DevTools (Рекомендуется)
```
1. Откройте страницу расширения
2. F12 → Console
3. Выполните: document.body.style.width = '1280px'
4. Cmd+Shift+P (Mac) или Ctrl+Shift+P (Win)
5. Найдите "Capture screenshot"
6. Выберите "Capture full size screenshot"
```

### Метод 2: macOS Screenshot
```
Cmd + Shift + 4 → Space → Click на окно
```

### Метод 3: Расширение для скриншотов
- Awesome Screenshot
- FireShot
- GoFullPage

### Метод 4: Puppeteer Script (автоматизация)
Создайте файл `take-screenshots.js`:

```javascript
const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${path.join(__dirname, 'dist')}`,
      `--load-extension=${path.join(__dirname, 'dist')}`
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Screenshot 1: Options page
  await page.goto('chrome-extension://[YOUR_EXTENSION_ID]/src/options/index.html');
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: 'screenshots/screenshot-1-settings.png',
    fullPage: true
  });

  // Screenshot 2: Dark theme
  await page.evaluate(() => {
    const themeSelect = document.querySelector('select');
    themeSelect.value = 'dark';
    themeSelect.dispatchEvent(new Event('change'));
  });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: 'screenshots/screenshot-2-dark-theme.png',
    fullPage: true
  });

  await browser.close();
})();
```

Запустить:
```bash
node take-screenshots.js
```

---

## 📐 Пост-обработка скриншотов

### Resize в нужный размер:
```bash
# Используя ImageMagick
convert input.png -resize 1280x800! output.png

# Или sips (macOS)
sips -z 800 1280 input.png --out output.png
```

### Добавить padding/border:
```bash
convert input.png -bordercolor white -border 50x50 output.png
```

### Оптимизация размера:
```bash
# PNG optimization
pngquant input.png --output output.png

# Или используйте TinyPNG
# https://tinypng.com/
```

---

## 📝 Captions для Chrome Web Store

После загрузки скриншотов, добавьте эти подписи:

**Screenshot 1:**
"Scan and categorize links instantly - discover conversion pages, APIs, admin panels, and more from sitemap.xml and robots.txt"

**Screenshot 2:**
"Customize categories and patterns - create your own categories, add custom URL patterns, and organize links your way"

**Screenshot 3:**
"Beautiful dark theme - comfortable interface for work at any time of day with automatic theme switching"

**Screenshot 4:**
"Export to CSV or JSON - save discovered links for further analysis, reporting, or integration with other tools"

**Screenshot 5:**
"Available in 5 languages - English, Spanish, Russian, German, and French with instant language switching"

---

## ✅ Чеклист финальной проверки

Перед загрузкой в Chrome Web Store убедитесь:

- [ ] Все скриншоты 1280x800px или 640x400px
- [ ] Формат PNG (рекомендуется) или JPEG
- [ ] Качество изображения высокое (без размытия)
- [ ] Нет личной информации (email, API keys и т.д.)
- [ ] Нет копирайтных изображений
- [ ] Интерфейс на английском языке (primary audience)
- [ ] Показаны ключевые функции расширения
- [ ] Скриншоты выглядят профессионально
- [ ] Размер файлов < 500 KB каждый
- [ ] Названия файлов: screenshot-1.png, screenshot-2.png, и т.д.

---

## 🎨 Бонус: Promotional Tile (440x280px)

Создайте в Figma/Canva/Photoshop:

**Содержание:**
- Иконка расширения (128x128px) в центре или слева
- Название: "Site Link Explorer"
- Tagline: "Discover Hidden Website Links"
- Цветовой градиент фон (синий → фиолетовый)
- 2-3 ключевые feature иконки (🔍 Scan, 📊 Categorize, 💾 Export)

**Пример структуры:**
```
┌─────────────────────────────────────────┐
│  [Icon]   Site Link Explorer            │
│           Discover Hidden Website Links │
│                                          │
│  🔍 Scan    📊 Categorize   💾 Export   │
└─────────────────────────────────────────┘
```

**Template Figma:** (создайте свой или используйте шаблоны)
- https://www.figma.com/community/search?model_type=files&q=chrome%20extension

---

## 📂 Сохранение скриншотов

Структура папки:
```
screenshots/
├── screenshot-1-popup-with-results.png    (1280x800px)
├── screenshot-2-categories-management.png (1280x800px)
├── screenshot-3-dark-theme.png            (1280x800px)
├── screenshot-4-export-options.png        (1280x800px)
├── screenshot-5-multilanguage.png         (1280x800px)
├── promotional-tile-small.png             (440x280px)
└── promotional-tile-large.png             (920x680px - optional)
```

---

**Удачи с созданием скриншотов! 🚀**

Если нужна помощь с редактированием или созданием promotional tile, дайте знать!
