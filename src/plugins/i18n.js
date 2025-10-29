import { reactive } from 'vue';
import { messages as i18nMessages, getSupportedLocales, getCurrentLocale, setLocale as setI18nLocale } from '../utils/i18n.js';

const i18n = reactive({
  locale: getCurrentLocale(),
  messages: i18nMessages
});

export function t(key, substitutions) {
    let message = i18n.messages[key] || key;
    if (substitutions) {
        if (Array.isArray(substitutions)) {
            substitutions.forEach((sub, i) => {
                message = message.replace(`${i+1}`, sub);
            });
        } else {
            message = message.replace('', substitutions);
        }
    }
    return message;
}

export async function setLocale(locale) {
  await setI18nLocale(locale);
  i18n.locale = locale;
}

export default {
  install(app) {
    app.config.globalProperties.$i18n = i18n;
    app.config.globalProperties.$t = t;
    app.config.globalProperties.$locales = getSupportedLocales();
  }
};