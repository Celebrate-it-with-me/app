/**
 * `meta.requiredPermission` of a route, applied: the EVENT permissions (owner / editor / viewer of the active event) the
 * route needs. Someone without one of them goes back to the Inicio (with a notice, see `authGuard`) instead of opening a
 * screen whose data the API will refuse (a viewer typing `/dashboard/budget`).
 *
 * Rules
 * - `[]` or no list: open to every role.
 * - No active event: nothing event-scoped to check (account pages, creating the first event): the route opens.
 * - Owners hold every permission: no wait for the list.
 * - The list belongs to one event (`permissionsEventId`); after a switch it is read again before deciding, so the
 *   permissions of event A never open a screen of event B.
 * - A route about ANOTHER event (`meta.eventParam` names the param with its id, e.g. `edit-event`) is not judged with the
 *   active event's permissions: the screen and the API decide there.
 * - If the list cannot be read (network), the route opens: the API still refuses what is not allowed. Blocking on a
 *   failed read would lock people out of their own event.
 */

/** The permissions a route asks for, as a list (`meta.requiredPermission` may be a list or a single name). */
export function requiredPermissions(route) {
  const value = route?.meta?.requiredPermission
  const list = Array.isArray(value) ? value : value ? [value] : []
  return list.filter(name => typeof name === 'string' && name.trim() !== '')
}

/**
 * @param {object} to the target route
 * @param {object} eventsStore `useEventsStore()` (activeEvent, eventPermissions, permissionsEventId, hasPermission, loadEventPermissions)
 * @returns {Promise<object|null>} the redirect, or null to let the navigation continue
 */
export async function permissionRedirect(to, eventsStore) {
  const required = requiredPermissions(to)
  if (!required.length) return null

  const event = eventsStore?.activeEvent
  if (!event?.id) return null

  const param = to.meta?.eventParam
  if (param && to.params?.[param] !== undefined && String(to.params[param]) !== String(event.id)) return null

  if (event.userRole === 'owner') return null

  if (String(eventsStore.permissionsEventId) !== String(event.id) || !Array.isArray(eventsStore.eventPermissions)) {
    await eventsStore.loadEventPermissions(event.id)
  }
  // Still not the list of this event (the read failed, or another switch happened meanwhile): no decision here.
  if (String(eventsStore.permissionsEventId) !== String(event.id) || !Array.isArray(eventsStore.eventPermissions)) return null

  return required.every(name => eventsStore.hasPermission(name)) ? null : { name: 'dashboard' }
}
