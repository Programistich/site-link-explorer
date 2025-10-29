/**
 * Утилита для работы с i18n в Chrome Extensions
 */

let currentLocale = 'en';
export const messages = {};

const supportedLocales = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
];

async function loadLocaleMessages(locale) {
  try {
    const response = await fetch(`/_locales/${locale}/messages.json`);
    if (!response.ok) {
      throw new Error(`Failed to load messages for locale: ${locale}`);
    }
    const json = await response.json();
    Object.keys(messages).forEach(key => delete messages[key]);
    Object.assign(messages, Object.entries(json).reduce((acc, [key, { message }]) => {
      acc[key] = message;
      return acc;
    }, {}));
    currentLocale = locale;
  } catch (error) {
    console.error(error);
    if (locale !== 'en') {
      await loadLocaleMessages('en'); // Fallback to English
    }
  }
}

export function t(key, substitutions) {
  let message = messages[key] || key;
  if (substitutions) {
    if (Array.isArray(substitutions)) {
      substitutions.forEach((sub, i) => {
        message = message.replace(`$${i+1}`, sub);
      });
    } else {
      message = message.replace('$1', substitutions);
    }
  }
  return message;
}

export async function setLocale(locale) {
  if (currentLocale !== locale) {
    await loadLocaleMessages(locale);
    localStorage.setItem('user_locale', locale);
  }
}

export function getSupportedLocales() {
  return supportedLocales;
}

export function getCurrentLocale() {
    return currentLocale;
}

export function getInitialLocale() {
    const savedLocale = localStorage.getItem('user_locale');
    if (savedLocale) {
        return savedLocale;
    }
    if (typeof chrome !== 'undefined' && chrome.i18n) {
        const uiLang = chrome.i18n.getUILanguage();
        const lang = uiLang.split('-')[0].toLowerCase();
        if (supportedLocales.some(l => l.code === lang)) {
            return lang;
        }
    }
    return 'en';
}

export async function initI18n() {
    const initialLocale = getInitialLocale();
    await loadLocaleMessages(initialLocale);
}

export function getCategoryNames() {
  return {
    conversion: t('categoryConversion'),
    partner: t('categoryPartner'),
    admin: t('categoryAdmin'),
    api: t('categoryApi'),
    disallowed: t('categoryDisallowed'),
    user: t('categoryUser'),
    contact: t('categoryContact'),
    legal: t('categoryLegal'),
    content: t('categoryContent'),
    files: t('categoryFiles'),
    service: t('categoryService'),
    other: t('categoryOther')
  }
}

// Экспортируем как глобальную функцию для использования в шаблонах
if (typeof window !== 'undefined') {
  window.$t = t
}

export default {
  t,
  getCurrentLocale,
  getSupportedLocales,
  getCategoryNames,
  setLocale,
  initI18n
}