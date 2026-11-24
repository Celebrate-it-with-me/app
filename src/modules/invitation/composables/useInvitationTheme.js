/**
 * Theme → CSS variables. The renderer's components only use `inv-*` utilities (see the
 * `@theme inline` block in src/style.css), so a theme is just a set of variables on a wrapper.
 * Values come from the API (and, for premium, from the organizer): only accept plain hex colors
 * and simple font names so nothing else can reach the stylesheet.
 */
const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i
const FONT = /^[\w -]{1,40}$/

export function isHex(value) {
  return typeof value === 'string' && HEX.test(value)
}

function luminance(hex) {
  let h = hex.slice(1, 7)
  if (hex.length <= 5) h = [...hex.slice(1, 4)].map(c => c + c).join('')
  const [r, g, b] = [0, 2, 4].map(i => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG contrast ratio between two hex colors (1 to 21). */
export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const toHex = n => Math.round(n).toString(16).padStart(2, '0')

/**
 * The primary color is used both as a button fill (text on top) and as text on the paper and on the alternate band
 * (`surfaceAlt`, optional). When it misses WCAG AA (4.5:1) on any of them, it is darkened toward black in small steps (at most 35%) until it passes, so the hue stays the same.
 * Colors that already pass, and anything that is not a 6-digit hex, are returned untouched.
 */
export function readablePrimary(primary, surface, surfaceAlt = null) {
  if (!/^#[0-9a-f]{6}$/i.test(primary) || !isHex(surface)) return primary
  const onSurfaces = c => contrast(c, surface) >= 4.5 && (!isHex(surfaceAlt) || contrast(c, surfaceAlt) >= 4.5)
  const passes = c => onSurfaces(c) && contrast(c, onColor(c)) >= 4.5
  if (passes(primary)) return primary
  const [r, g, b] = [1, 3, 5].map(i => parseInt(primary.slice(i, i + 2), 16))
  for (let step = 1; step <= 35; step++) {
    const k = 1 - step / 100
    const candidate = `#${toHex(r * k)}${toHex(g * k)}${toHex(b * k)}`
    if (passes(candidate)) return candidate
  }
  return primary
}

/** Readable text color for a given background (WCAG relative luminance). */
export function onColor(hex, light = '#ffffff', dark = '#2b2420') {
  if (!isHex(hex)) return light
  let h = hex.slice(1, 7)
  if (hex.length <= 5) h = [...hex.slice(1, 4)].map(c => c + c).join('')
  const [r, g, b] = [0, 2, 4].map(i => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  // Contrast against white vs against the dark ink (luminance ≈ 0.019): pick the higher.
  return 1.05 / (luminance + 0.05) >= (luminance + 0.05) / 0.069 ? light : dark
}

const mixHex = (a, b, t) => {
  const p = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
  const [x, y] = [p(a), p(b)]
  return `#${x.map((v, i) => toHex(v * t + y[i] * (1 - t))).join('')}`
}

/**
 * Text-safe version of the primary color for small copy on the paper and on the alternate band. It starts at the
 * historical 78% primary / 22% ink mix and darkens toward the ink until it keeps at least 5:1 on every surface given
 * (a margin over AA 4.5:1), so a pale custom palette cannot make small text unreadable.
 */
export function readableInk(primary, surfaces, ink = '#2b2420') {
  if (!/^#[0-9a-f]{6}$/i.test(primary) || !/^#[0-9a-f]{6}$/i.test(ink)) return null
  const valid = surfaces.filter(isHex)
  for (let share = 78; share >= 0; share -= 2) {
    const candidate = mixHex(primary, ink, share / 100)
    if (valid.every(surface => contrast(candidate, surface) >= 5)) return candidate
  }
  return ink
}

const COLOR_VARS = {
  surface: '--inv-surface',
  surfaceAlt: '--inv-surface-alt',
  ink: '--inv-ink',
  inkSoft: '--inv-ink-soft',
  primary: '--inv-primary',
  accent: '--inv-accent'
}

const DEFAULTS = {
  surface: '#fbf7f2',
  surfaceAlt: '#f4ede4',
  ink: '#2b2420',
  inkSoft: '#5b524c',
  primary: '#b04a62',
  accent: '#c9a24e'
}

/** @param {{ colors?: Record<string,string>, fonts?: Record<string,string> } | null} theme */
export function themeVars(theme) {
  const colors = { ...DEFAULTS }
  for (const [key, value] of Object.entries(theme?.colors ?? {})) {
    if (key in COLOR_VARS && isHex(value)) colors[key] = value
  }

  colors.primary = readablePrimary(colors.primary, colors.surface, colors.surfaceAlt)

  const vars = {}
  for (const [key, cssVar] of Object.entries(COLOR_VARS)) vars[cssVar] = colors[key]
  vars['--inv-on-primary'] = onColor(colors.primary)
  const ink = readableInk(colors.primary, [colors.surface, colors.surfaceAlt])
  if (ink) vars['--inv-primary-ink'] = ink

  const font = (name, fallback) =>
    typeof name === 'string' && FONT.test(name) ? `'${name}', ${fallback}` : null
  const heading = font(theme?.fonts?.heading, 'Georgia, serif')
  const body = font(theme?.fonts?.body, 'system-ui, sans-serif')
  const script = font(theme?.fonts?.script, 'cursive')
  if (heading) vars['--inv-font-heading'] = heading
  if (body) vars['--inv-font-body'] = body
  if (script) vars['--inv-font-script'] = script
  return vars
}
