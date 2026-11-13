export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
export const MAX_BYTES = 5 * 1024 * 1024
export const MAX_TITLE = 100
export const MAX_DESCRIPTION = 500
export const MIN_YEAR = 1900
export const MAX_YEAR = 2100
/** UiSelect cannot hold an empty-string option, so "all years" travels as this sentinel. */
export const ALL_YEARS = 'all'
export const SORTS = ['newest', 'oldest']

/** Returns null when the file is fine, otherwise an error code: 'type' | 'size'. */
export function validateFile(file) {
  if (!file || !ALLOWED_TYPES.includes(file.type)) return 'type'
  if (file.size > MAX_BYTES) return 'size'
  return null
}

export function formatSize(bytes) {
  const n = Number(bytes) || 0
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

export function emptyMemoryForm() {
  return { title: '', description: '', year: '', visible: true }
}

export function memoryToForm(memory) {
  return {
    title: memory?.title ?? '',
    description: memory?.description ?? '',
    year: memory?.year ? String(memory.year) : '',
    visible: memory?.visible === undefined || memory?.visible === null ? true : !!memory.visible
  }
}

/** Returns { field: errorCode } for invalid fields; empty object when valid. */
export function validateMemoryForm(form, { hasImage }) {
  const errors = {}
  const title = String(form.title ?? '').trim()
  if (!title) errors.title = 'required'
  else if (title.length > MAX_TITLE) errors.title = 'max'
  if (String(form.description ?? '').length > MAX_DESCRIPTION) errors.description = 'max'
  const year = String(form.year ?? '').trim()
  if (year) {
    const n = Number(year)
    if (!/^\d+$/.test(year) || n < MIN_YEAR || n > MAX_YEAR) errors.year = 'range'
  }
  if (!hasImage) errors.image = 'required'
  return errors
}

/** Plain payload for the API; `file` is optional on edit (details-only update). */
export function formToPayload(form, file = null, order = null) {
  const payload = {
    title: String(form.title ?? '').trim(),
    description: String(form.description ?? '').trim(),
    year: String(form.year ?? '').trim(),
    visible: form.visible ? 1 : 0
  }
  if (order !== null && order !== undefined) payload.order = order
  if (file) payload.file = file
  return payload
}

export function buildMemoryFormData(payload) {
  const formData = new FormData()
  if (payload.file) {
    formData.append('files[0]', payload.file)
    formData.append('metadata[0][name]', payload.file.name)
    formData.append('metadata[0][size]', payload.file.size)
  }
  formData.append('title', payload.title)
  formData.append('description', payload.description)
  formData.append('year', payload.year)
  formData.append('visible', payload.visible)
  if (payload.order !== undefined) formData.append('order', payload.order)
  return formData
}

export function availableYears(memories) {
  const years = new Set(memories.map(m => m.year).filter(Boolean).map(Number))
  return [...years].sort((a, b) => b - a)
}

export function filterMemories(memories, { search = '', year = ALL_YEARS } = {}) {
  const q = String(search).trim().toLowerCase()
  return memories.filter(m => {
    if (year !== ALL_YEARS && String(m.year) !== String(year)) return false
    if (!q) return true
    return (
      String(m.title ?? '').toLowerCase().includes(q) ||
      String(m.description ?? '').toLowerCase().includes(q)
    )
  })
}

/** Stable sort by year; memories without a year go last in both directions. */
export function sortMemories(memories, order = 'newest') {
  const list = [...memories]
  const dir = order === 'oldest' ? 1 : -1
  return list
    .map((m, i) => ({ m, i }))
    .sort((a, b) => {
      const ay = Number(a.m.year) || 0
      const by = Number(b.m.year) || 0
      if (!ay && by) return 1
      if (ay && !by) return -1
      if (ay !== by) return (ay - by) * dir
      return a.i - b.i
    })
    .map(x => x.m)
}

export function memoryStats(memories) {
  const total = memories.length
  const visible = memories.filter(m => !!m.visible).length
  return { total, visible, hidden: total - visible }
}

/** Maps an axios error to 'validation' | 'generic' plus the failing field names. */
export function errorInfo(error) {
  const status = error?.response?.status
  const errors = error?.response?.data?.errors || {}
  if (status === 422) {
    return { kind: 'validation', fields: Object.keys(errors), hasFileError: Object.keys(errors).some(k => k.startsWith('files')) }
  }
  return { kind: 'generic', fields: [], hasFileError: false }
}
