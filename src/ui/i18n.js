import i18n from '@/locales/i18n'

/**
 * Default labels for the UI kit. Resolved from the global i18n instance so components keep
 * working (and tests keep passing) even when a consumer overrides nothing and no plugin is
 * installed on the local app instance.
 */
export function uiText(key) {
  return i18n.global.t(key)
}
