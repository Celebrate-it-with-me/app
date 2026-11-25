/**
 * Facts the engine publishes as `data-*` attributes so a template can react to them from its own CSS.
 * The engine stays neutral: it states facts, the template decides what to do with them. Only the engine writes
 * these attributes (a package cannot declare its own `data-*`).
 *
 * Contract
 * - `.inv-root`: `data-inv-opt-<id>="<value>"` for every package option (see `optionAttrs`).
 *   `<id>` matches `^[a-z][a-z0-9._-]{0,31}$` (as validated by the API); `<value>` is a closed-list value
 *   (`[A-Za-z0-9._-]{1,32}`); a toggle (boolean) is `on` / `off`. Anything else is dropped.
 * - Cover section wrapper of a package (`coverAttrs`), same thresholds as the native cover (InvitationCover.vue):
 *   - `data-inv-name-len`: `short` (<= 28 characters of the event name) | `mid` (29-48) | `long` (> 48)
 *   - `data-inv-guest-len`: `short` | `long` (guest name > 26 characters)
 *   - `data-inv-has-photo`: `true` | `false` (a usable cover photo URL: same-origin path or https)
 */

const OPTION_ID = /^[a-z][a-z0-9._-]{0,31}$/
const OPTION_VALUE = /^[A-Za-z0-9._-]{1,32}$/
const MAX_OPTIONS = 32
const PHOTO = /^(\/(?!\/)|https?:\/\/)/

/** `{ 'data-inv-opt-<id>': value }` for the options of the package; invalid ids/values are skipped. */
export function optionAttrs(options) {
  const attrs = {}
  if (!options || typeof options !== 'object' || Array.isArray(options)) return attrs
  let count = 0
  for (const [id, raw] of Object.entries(options)) {
    if (count >= MAX_OPTIONS) break
    if (!OPTION_ID.test(id)) continue
    const value = typeof raw === 'boolean' ? (raw ? 'on' : 'off') : typeof raw === 'number' ? String(raw) : raw
    if (typeof value !== 'string' || !OPTION_VALUE.test(value)) continue
    attrs[`data-inv-opt-${id}`] = value
    count++
  }
  return attrs
}

const length = value => (typeof value === 'string' ? value.length : 0)

/** Cover facts for the wrapper of the `cover` section of a package. */
export function coverAttrs(section, invitation) {
  const name = length(section?.data?.eventName)
  const image = section?.data?.image
  return {
    'data-inv-name-len': name > 48 ? 'long' : name > 28 ? 'mid' : 'short',
    'data-inv-guest-len': length(invitation?.guest?.name) > 26 ? 'long' : 'short',
    'data-inv-has-photo': typeof image === 'string' && PHOTO.test(image) ? 'true' : 'false'
  }
}
