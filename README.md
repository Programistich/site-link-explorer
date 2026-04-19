# Site Link Explorer

Site Link Explorer is a cross-browser WebExtension for Chrome and Firefox that discovers useful public links on a website. It scans sources such as `sitemap.xml`, `robots.txt`, and common sitemap variations, then groups results in a simple popup UI.

## Features

- Automatic link discovery on page load
- Link grouping by category
- Search and filtering
- CSV and JSON export
- Custom patterns and user-defined categories
- Scan history
- Light and dark themes

## Common Categories

- Conversion pages
- Affiliate and partner pages
- Admin and login pages
- API and docs pages
- User account pages
- Contact and legal pages
- Blog, content, and downloadable files

## Development

Requirements:

- Node.js 18+
- pnpm

Install and run:

```bash
pnpm install
pnpm dev:chrome
# or
pnpm dev:firefox
```

Load the extension manually:

- Chrome: open `chrome://extensions`, enable Developer mode, and load `dist/chrome`
- Firefox: open `about:debugging#/runtime/this-firefox` and load `dist/firefox/manifest.json`

## Build

```bash
pnpm build:chrome
pnpm build:firefox
```

Default build output:

- `dist/chrome`
- `dist/firefox`

You can override the Firefox add-on ID if needed:

```bash
FIREFOX_EXTENSION_ID=my-extension@example.com pnpm build:firefox
```

## Usage

Open any website, let the extension scan public sources, then open the popup to review, search, filter, and export discovered links. Settings allow you to enable or disable auto-scan, change theme, manage custom patterns, and clear history or cache.

## Tech Stack

- Vue 3
- Vite
- Pinia
- `@crxjs/vite-plugin`
- Manifest V3
