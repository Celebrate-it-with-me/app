/** Pure helpers behind the guest import modal: file checks, preview rows, selection and payload. */

export const ACCEPT = '.csv,.xlsx,.xls'
export const MAX_BYTES = 2 * 1024 * 1024
const EXTENSIONS = ['csv', 'xlsx', 'xls']

/** `null` when the file can be sent, else the i18n error code (`fileType` | `fileSize`). */
export function fileProblem(file) {
  if (!file) return 'generic'
  const extension = String(file.name ?? '').split('.').pop().toLowerCase()
  if (!EXTENSIONS.includes(extension)) return 'fileType'
  if (file.size > MAX_BYTES) return 'fileSize'
  return null
}

const FILE_CODES = ['missing_name_column', 'empty_file', 'too_many_rows', 'unreadable_file']

/** The code of a failed preview request (422 `{ errors: { file: [code] } }`), else `generic`. */
export function previewErrorCode(error) {
  const codes = error?.response?.data?.errors?.file
  const code = Array.isArray(codes) ? codes[0] : codes
  if (FILE_CODES.includes(code)) return code
  if (error?.response?.status === 413) return 'fileSize'
  return 'generic'
}

export const errorKey = code => `app.guestImport.errors.${code}`

/** Local copy of the server rules, so a fixed row is accepted without another round trip. */
export function phoneCheck(raw) {
  const value = String(raw ?? '').trim()
  if (!value) return { valid: true, note: null }
  if (!/^\+?[0-9][0-9 ().-]*$/.test(value)) return { valid: false, note: 'invalid' }
  const digits = value.replace(/\D/g, '')
  if (value.startsWith('+')) return { valid: digits.length >= 8 && digits.length <= 15, note: digits.length >= 8 && digits.length <= 15 ? null : 'invalid' }
  if (digits.length === 10) return { valid: true, note: 'assumed_us' }
  if (digits.length === 11 && digits.startsWith('1')) return { valid: true, note: null }
  return { valid: false, note: 'invalid' }
}

const emailOk = value => !value || /^\S+@\S+\.\S+$/.test(String(value).trim())

/** Problems of a row from its current values. */
export function rowProblems(row) {
  const problems = []
  if (!String(row.name ?? '').trim()) problems.push('name_missing')
  if (!phoneCheck(row.phoneInput).valid) problems.push('phone_invalid')
  if (!emailOk(row.email)) problems.push('email_invalid')
  return problems
}

/** Preview rows from the API, ready to edit: `phoneInput` is what the input shows, `include` the checkbox. */
export function editableRows(rows) {
  return (rows ?? []).map(row => ({
    ...row,
    phoneInput: row.phone ?? row.phoneRaw ?? '',
    include: !row.duplicate && !(row.problems ?? []).length
  }))
}

/** The row after the organizer fixed its name or phone: problems and the +1 note are recomputed. */
export function withEdit(row, patch) {
  const next = { ...row, ...patch }
  const check = phoneCheck(next.phoneInput)
  next.problems = rowProblems(next)
  next.phoneNote = !check.valid ? 'invalid' : check.note
  // A row that just became clean is worth importing; one that broke cannot be.
  if (!next.problems.length && row.problems.length && !next.duplicate) next.include = true
  if (next.problems.length) next.include = false
  return next
}

export const FILTERS = ['all', 'ready', 'problems', 'duplicates']

export function filterRows(rows, filter) {
  switch (filter) {
    case 'ready': return rows.filter(r => !r.problems.length && !r.duplicate)
    case 'problems': return rows.filter(r => r.problems.length)
    case 'duplicates': return rows.filter(r => r.duplicate)
    default: return rows
  }
}

/** Live counters for the chips (they follow the edits, not the first answer of the server). */
export function summarize(rows) {
  return {
    all: rows.length,
    ready: rows.filter(r => !r.problems.length && !r.duplicate).length,
    problems: rows.filter(r => r.problems.length).length,
    duplicates: rows.filter(r => r.duplicate).length,
    assumedUs: rows.filter(r => r.phoneNote === 'assumed_us').length,
    selected: rows.filter(r => r.include).length
  }
}

const familyKey = row => String(row.family ?? '').trim().toLowerCase()

/** Rows grouped by family value, in file order. Rows without family are not grouped. */
export function groupFamilies(rows) {
  const groups = new Map()
  for (const row of rows) {
    const key = familyKey(row)
    if (!key) continue
    groups.set(key, [...(groups.get(key) ?? []), row])
  }
  return [...groups.values()]
}

/** True when some family value repeats: the preview then explains how families are built. */
export const hasFamilies = rows => groupFamilies(rows).some(group => group.length > 1)

/** Body of `POST roster/import`: only the rows kept, without empty optionals. */
export function importPayload(rows) {
  return {
    rows: rows
      .filter(r => r.include)
      .map(r => {
        const out = { name: r.name.trim() }
        if (String(r.phoneInput ?? '').trim()) out.phone = r.phoneInput.trim()
        if (String(r.email ?? '').trim()) out.email = r.email.trim()
        if (String(r.family ?? '').trim()) out.family = r.family.trim()
        return out
      })
  }
}
