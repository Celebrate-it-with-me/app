import { unlockPath } from '@/components/internal/shell/navModules'

/**
 * Where to send someone who opens a module's address, given the modules of the active event
 * (`event.modules`, from the API). Returns the redirect, or null to let the navigation continue.
 *
 * - locked: the plan does not include it -> the "pass to premium" screen (the padlock is not only a
 *   menu detail: typing the address gets the same answer).
 * - missing: the admin switched the module off -> back to home.
 * - no modules at all (old data or no event): no decision, the API will answer for itself.
 */
export function moduleRedirect(event, key) {
  if (!key || !Array.isArray(event?.modules)) return null
  const module = event.modules.find(m => m.key === key)
  if (!module) return '/dashboard'
  if (module.state === 'locked') return unlockPath(key)
  return null
}
