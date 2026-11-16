import { createI18n } from 'vue-i18n'

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

// Each language is its own chunk: only the active one is downloaded (the other when the user switches to it).
const LOADERS = {
  es: () => import('./es'),
  en: () => import('./en')
}

const i18n = createI18n({
  legacy: false,
  locale: detectLocale(),
  fallbackLocale: 'en',
  messages: {}
})

const pending = new Map()

/** True when the messages of `locale` are already registered (no network needed). */
export function isLocaleLoaded(locale) {
  return !!i18n.global.messages.value[locale]
}

/** Downloads and registers the messages of one language (once); resolves when they can be used. */
export function loadLocale(locale) {
  if (!LOCALES.includes(locale) || isLocaleLoaded(locale)) return Promise.resolve()
  if (!pending.has(locale)) {
    pending.set(
      locale,
      LOADERS[locale]()
        .then(module => i18n.global.setLocaleMessage(locale, module.default))
        .finally(() => pending.delete(locale))
    )
  }
  return pending.get(locale)
}

/** Resolves when the language chosen at start-up is ready; main.js waits for it before mounting (no flash of keys). */
export const localeReady = loadLocale(i18n.global.locale.value).catch(() => {})

if (typeof document !== 'undefined') document.documentElement.lang = i18n.global.locale.value

function applyLocale(locale) {
  i18n.global.locale.value = locale
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    // Ignore storage errors.
  }
  if (typeof document !== 'undefined') document.documentElement.lang = locale
}

/**
 * Switches the language. When its messages are already there the change is immediate; otherwise the texts stay in the
 * current language until the chunk arrives (no flash of raw keys). Returns a promise that resolves once applied.
 */
export function setLocale(locale) {
  if (!LOCALES.includes(locale)) return Promise.resolve()
  if (isLocaleLoaded(locale)) {
    applyLocale(locale)
    return Promise.resolve()
  }
  return loadLocale(locale).then(() => applyLocale(locale), () => {})
}

export default i18n
