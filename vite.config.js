import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { crx } from '@crxjs/vite-plugin'
import manifest from './src/manifest.json'

const TARGET_BROWSER = process.env.TARGET_BROWSER || 'chrome'
const BROWSER = TARGET_BROWSER === 'firefox' ? 'firefox' : 'chrome'
const OUT_DIR = TARGET_BROWSER === 'firefox' ? 'dist/firefox' : 'dist/chrome'

function getManifest() {
  const browserManifest = structuredClone(manifest)

  if (TARGET_BROWSER === 'firefox') {
    const backgroundScript = browserManifest.background?.service_worker

    browserManifest.background = {
      scripts: backgroundScript ? [backgroundScript] : ['src/background/service-worker.js'],
      type: 'module'
    }

    browserManifest.browser_specific_settings = {
      gecko: {
        id: process.env.FIREFOX_EXTENSION_ID || 'site-link-explorer@programistich.dev',
        strict_min_version: '121.0'
      }
    }
  }

  return browserManifest
}

export default defineConfig({
  plugins: [
    vue(),
    crx({ manifest: getManifest(), browser: BROWSER })
  ],
  build: {
    outDir: OUT_DIR,
    rollupOptions: {
      input: {
        popup: 'src/popup/index.html',
        options: 'src/options/index.html'
      }
    }
  }
})
