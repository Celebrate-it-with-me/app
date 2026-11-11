import { createI18n } from 'vue-i18n'
import es from './es'
import en from './en'

export const LOCALES = ['es', 'en']
export const LOCALE_STORAGE_KEY = 'quinvite.locale'

/** Saved choice first, then the browser language, Spanish by default. */
export function detectLocale() {
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (LOCALES.includes(saved)) return saved
  } catch {
    // Storage can be unavailable (private mode); fall through.
  }
  const browser = (typeof navigator !== 'undefined' && navigator.language) || 'es'
  return browser.toLowerCase().startsWith('en') ? 'en' : 'es'
}

const i18n = createI18n({
  legacy: false,
  locale: detectLocale(),
  fallbackLocale: 'en',
  messages: { es, en }
})

export function setLocale(locale) {
  if (!LOCALES.includes(locale)) return
  i18n.global.locale.value = locale
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    // Ignore storage errors.
  }
  if (typeof document !== 'undefined') document.documentElement.lang = locale
}

export default i18n
