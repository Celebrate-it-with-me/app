import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

/*
 * Locks the security headers in vercel.json (the file is the deployed config, so it is parsed, not mocked).
 *
 * Moving the CSP from Report-Only to enforcing: deploy with the Report-Only header, collect violation reports
 * (DevTools console / a report endpoint) over a few real sessions (sign-in with hCaptcha, event with a map,
 * invitation with music, template picker, Stripe return), add every legitimate origin that shows up, then change
 * the key "Content-Security-Policy-Report-Only" to "Content-Security-Policy" and append "frame-ancestors 'none'"
 * to that value (the standalone frame-ancestors header can then be removed).
 */
const config = JSON.parse(readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8'))
const rule = source => config.headers.find(h => h.source === source)
const header = (r, key) => r.headers.find(h => h.key === key)?.value
const directives = value => Object.fromEntries(value.split(';').map(d => d.trim().split(/\s+/)).map(([k, ...v]) => [k, v]))

describe('vercel.json headers', () => {
  const preview = rule('/preview/invitation')
  const rest = config.headers.find(h => h.source !== '/preview/invitation')

  it('lets the preview route be framed by the app itself and the admin panel only', () => {
    expect(header(preview, 'Content-Security-Policy')).toBe("frame-ancestors 'self' https://admin.quinvite.com")
    expect(header(preview, 'X-Robots-Tag')).toBe('noindex')
  })

  it('keeps every other route unframable', () => {
    expect(rest.source).toContain('preview/invitation')
    expect(header(rest, 'Content-Security-Policy')).toBe("frame-ancestors 'none'")
    expect(header(rest, 'X-Content-Type-Options')).toBe('nosniff')
    expect(header(rest, 'Strict-Transport-Security')).toContain('max-age=')
  })

  it('ships a report-only script CSP for the other routes, not blocking yet', () => {
    expect(header(rest, 'Content-Security-Policy-Report-Only')).toBeTruthy()
    expect(header(preview, 'Content-Security-Policy-Report-Only')).toBeUndefined()
    const csp = directives(header(rest, 'Content-Security-Policy-Report-Only'))
    expect(csp['script-src']).toEqual(expect.arrayContaining(["'self'", 'https://maps.googleapis.com', 'https://js.hcaptcha.com']))
    expect(csp['script-src']).not.toContain("'unsafe-inline'")
    expect(csp['script-src']).not.toContain("'unsafe-eval'")
    expect(csp['object-src']).toEqual(["'none'"])
    expect(csp['base-uri']).toEqual(["'self'"])
    expect(csp['form-action']).toEqual(["'self'"])
    expect(csp['connect-src']).toContain('https://api.quinvite.com')
    expect(csp['img-src']).toEqual(expect.arrayContaining(['https://cdn.quinvite.com', 'data:', 'blob:']))
  })

  it('keeps the crawler rewrite to /og and the SPA fallback', () => {
    expect(config.rewrites[0].destination).toBe('https://api.quinvite.com/og/:slug/:code')
    expect(config.rewrites.at(-1).destination).toBe('/index.html')
  })
})
