/** Roles of an event, from the most to the least powerful. `owner` is never offered when inviting. */
export const ROLES = ['owner', 'editor', 'viewer']
export const INVITABLE_ROLES = ['editor', 'viewer']

const STATUSES = ['active', 'pending', 'expired', 'declined']

/**
 * One row of the list, whichever shape the API sends (camelCase or snake_case).
 * `type` is `member` (already has access) or `invite` (waiting for an answer).
 */
export function normalizeCollaborator(raw) {
  const type = raw.type === 'invite' ? 'invite' : 'member'
  const role = ROLES.includes(raw.role) ? raw.role : 'viewer'
  const email = raw.email ?? ''
  const status = STATUSES.includes(raw.status) ? raw.status : type === 'invite' ? 'pending' : 'active'
  return {
    key: `${type}-${raw.id}`,
    id: raw.id,
    type,
    userId: raw.userId ?? raw.user_id ?? null,
    name: raw.name || email,
    email,
    avatarUrl: raw.avatarUrl ?? raw.avatar_url ?? '',
    role,
    status
  }
}

const rank = row => (row.role === 'owner' ? 0 : row.type === 'member' ? 1 : 2)

/** Owner first, then people with access, then pending invitations; alphabetical inside each group. */
export function sortCollaborators(rows) {
  return [...rows].sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name))
}

/** Only the owner (and whoever holds the permission) manages access. */
export function canManage(event, hasPermission) {
  return event?.userRole === 'owner' || Boolean(hasPermission?.('manage_collaborators'))
}

/** The free plan is the one that leaves modules locked. The API enforces the real limit; this only picks the notice. */
export function isFreePlan(event) {
  return Array.isArray(event?.modules) && event.modules.some(module => module.state === 'locked')
}

/** What a manager can do with a row, as action keys. The owner's row has none. */
export function rowActions(row) {
  if (row.role === 'owner') return []
  if (row.type === 'invite') return ['resend', 'cancel']
  return [row.role === 'editor' ? 'makeViewer' : 'makeEditor', 'remove']
}

/** Status of an invitation row worth a badge (members need none). */
export function statusTone(status) {
  return { pending: 'warning', expired: 'neutral', declined: 'danger' }[status] ?? 'success'
}

export function emailError(value) {
  const email = (value ?? '').trim()
  if (!email) return 'required'
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'invalid'
}
