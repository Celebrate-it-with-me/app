/** Joins class fragments, skipping falsy values. */
export function cx(...parts) {
  return parts.flat().filter(Boolean).join(' ')
}

let uid = 0
/** Stable unique id for form controls. */
export function useId(prefix = 'ui') {
  uid += 1
  return `${prefix}-${uid}`
}

/** Initials for an avatar: "María Fernández" -> "MF". */
export function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('')
}

const AVATAR_TONES = [
  'bg-rose-100 text-rose-700',
  'bg-gold-100 text-gold-700',
  'bg-success-50 text-success-700',
  'bg-info-50 text-info-700',
  'bg-cream-300 text-ink-700'
]

/** Deterministic warm tone for a name, so the same person always gets the same color. */
export function avatarTone(name = '') {
  let hash = 0
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) % 997
  return AVATAR_TONES[hash % AVATAR_TONES.length]
}
