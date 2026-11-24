import { CWM_API } from '@/services/axios'

/** Address of the .ics file: the API serves it under the same invitation address (`icsPath` is relative). */
export function icsUrl(slug, code, calendar) {
  const base = String(CWM_API.defaults.baseURL ?? '').replace(/\/$/, '')
  const path = String(calendar?.icsPath ?? 'calendar.ics').replace(/^\/+/, '')
  return `${base}/invitation/${encodeURIComponent(slug)}/${encodeURIComponent(code)}/${path}`
}
