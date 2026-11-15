/**
 * Background music of the invitation: one file per event (mp3, m4a/aac or ogg, 10 MB at most).
 * The API validates by content; here we only catch the obvious cases before uploading.
 */
export const MUSIC_MAX_BYTES = 10 * 1024 * 1024
export const MUSIC_EXTENSIONS = ['mp3', 'm4a', 'aac', 'ogg']
export const MUSIC_MIME_TYPES = ['audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/ogg', 'application/ogg']
/** Value for the file input's `accept`. */
export const MUSIC_ACCEPT = [...MUSIC_EXTENSIONS.map(ext => `.${ext}`), ...MUSIC_MIME_TYPES].join(',')

/** Codes the API answers in `errors.songFile[0]` (and the same ones found on the client). */
const SONG_CODES = ['required', 'invalid_type', 'too_large']

const extensionOf = name => String(name ?? '').split('.').pop().toLowerCase()

/** The error code for a file we can already tell is wrong, or null when it may go up. */
export function validateMusicFile(file) {
  if (!file) return 'required'
  const ext = extensionOf(file.name)
  const typeOk = !file.type || MUSIC_MIME_TYPES.includes(file.type)
  if (!MUSIC_EXTENSIONS.includes(ext) || !typeOk) return 'invalid_type'
  if (file.size > MUSIC_MAX_BYTES) return 'too_large'
  return null
}

/** Field errors from a 422: `{ songFile?: code, title?: code }`, keeping only codes we know. */
export function musicErrorCodes(error) {
  const errors = error?.response?.data?.errors ?? {}
  const first = field => (Array.isArray(errors[field]) ? errors[field][0] : errors[field])
  const song = first('songFile')
  const title = first('title')
  return {
    ...(song ? { songFile: SONG_CODES.includes(song) ? song : 'invalid_type' } : {}),
    ...(title ? { title: title === 'too_long' ? 'too_long' : 'invalid' } : {})
  }
}

/** "3.2 MB" / "480 KB". */
export function formatBytes(bytes) {
  const n = Number(bytes) || 0
  if (n >= 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`
  return `${Math.max(1, Math.round(n / 1024))} KB`
}
