/**
 * The API answers 403 `{ code: 'module_locked', module }` when the event's plan does not include a module
 * (or the admin switched it off). It is an upgrade prompt, not a "forbidden" page.
 */

export const MODULE_LOCKED = 'module_locked'

/** Requests made by guests (public invitation, legacy `template/event/...`): they cannot upgrade, so nothing is shown to them. */
const GUEST_URL = /^\/?(invitation|template)\//

export function isModuleLocked(error) {
  return error?.response?.status === 403 && error?.response?.data?.code === MODULE_LOCKED
}

/** True when the failed request was made from a public (guest) page. */
export function isGuestRequest(error) {
  return GUEST_URL.test(String(error?.config?.url || ''))
}

/**
 * Shows the "go premium" notice for a locked module to the organizer. Guests get nothing: the section is simply
 * not there for them. `toast` is the function from `useToast()`, `t` the i18n translator.
 */
export function notifyModuleLocked(error, { toast, t }) {
  if (isGuestRequest(error)) return
  const module = error.response.data.module
  const name = module && t(`moduleLocked.names.${module}`) !== `moduleLocked.names.${module}` ? t(`moduleLocked.names.${module}`) : null
  toast({
    title: t('moduleLocked.title'),
    description: name ? t('moduleLocked.textNamed', { name }) : t('moduleLocked.text'),
    tone: 'warning',
    duration: 6000
  })
}
