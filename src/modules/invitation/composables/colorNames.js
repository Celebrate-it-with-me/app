/**
 * Swatches for the reserved colors of the dress code. Organizers write names ("Rojo", "Dorado")
 * or hex codes; names are matched in Spanish and English. Unknown names simply get no swatch.
 */
import { isHex } from './useInvitationTheme'

const NAMES = {
  blanco: '#ffffff', white: '#ffffff',
  negro: '#1f1a17', black: '#1f1a17',
  rojo: '#c0242f', red: '#c0242f',
  rosa: '#f0a6bb', rosado: '#f0a6bb', pink: '#f0a6bb',
  fucsia: '#c2185b', fuchsia: '#c2185b', magenta: '#c2185b',
  dorado: '#c9a24e', oro: '#c9a24e', gold: '#c9a24e',
  plateado: '#c4c7cc', plata: '#c4c7cc', silver: '#c4c7cc',
  azul: '#2f5fa8', blue: '#2f5fa8',
  celeste: '#8ec5e8', 'azul claro': '#8ec5e8',
  marino: '#1b2a4e', navy: '#1b2a4e',
  verde: '#3f8a5a', green: '#3f8a5a',
  esmeralda: '#0f7a5a', emerald: '#0f7a5a',
  morado: '#6b3fa0', purple: '#6b3fa0', lila: '#b79adf', lavanda: '#b79adf',
  amarillo: '#f2c94c', yellow: '#f2c94c',
  naranja: '#ee8a2d', orange: '#ee8a2d',
  coral: '#f26b5b',
  beige: '#e8d8bf', crema: '#f3ead7', cream: '#f3ead7', champagne: '#ead9b8', champán: '#ead9b8',
  vino: '#6d1f35', burgundy: '#6d1f35', borgoña: '#6d1f35',
  turquesa: '#26a6a6', turquoise: '#26a6a6'
}

/** A CSS color for a swatch, or null when the name is unknown. */
export function swatchFor(value) {
  if (typeof value !== 'string') return null
  if (isHex(value.trim())) return value.trim()
  return NAMES[value.trim().toLowerCase()] ?? null
}

/** Names to show for hex codes, by language. Each swatch is [hex, es, en]. */
const DISPLAY = [
  ['#ffffff', 'Blanco', 'White'], ['#1f1a17', 'Negro', 'Black'], ['#c0242f', 'Rojo', 'Red'],
  ['#f0a6bb', 'Rosa', 'Pink'], ['#c2185b', 'Fucsia', 'Fuchsia'], ['#c9a24e', 'Dorado', 'Gold'],
  ['#c4c7cc', 'Plateado', 'Silver'], ['#2f5fa8', 'Azul', 'Blue'], ['#8ec5e8', 'Celeste', 'Light blue'],
  ['#1b2a4e', 'Azul marino', 'Navy'], ['#3f8a5a', 'Verde', 'Green'], ['#0f7a5a', 'Esmeralda', 'Emerald'],
  ['#6b3fa0', 'Morado', 'Purple'], ['#b79adf', 'Lila', 'Lilac'], ['#f2c94c', 'Amarillo', 'Yellow'],
  ['#ee8a2d', 'Naranja', 'Orange'], ['#f26b5b', 'Coral', 'Coral'], ['#e8d8bf', 'Beige', 'Beige'],
  ['#f3ead7', 'Crema', 'Cream'], ['#ead9b8', 'Champán', 'Champagne'], ['#6d1f35', 'Vino', 'Burgundy'],
  ['#26a6a6', 'Turquesa', 'Turquoise']
]
/** Largest RGB distance (0-441) at which a hex code still gets a name: beyond it a name would mislead. */
const NEAR = 70

const rgb = hex => {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? [...h].map(c => c + c).join('') : h
  return [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16))
}

/** Readable name for a reserved/suggested color: the text as the organizer wrote it, or, for a hex code, the nearest known name (null when none is close enough). */
export function colorLabel(value, locale = 'es') {
  if (typeof value !== 'string') return null
  const text = value.trim()
  if (!isHex(text)) return text || null
  const target = rgb(text)
  let best = null
  for (const [hex, es, en] of DISPLAY) {
    const c = rgb(hex)
    const d = Math.hypot(c[0] - target[0], c[1] - target[1], c[2] - target[2])
    if (!best || d < best.d) best = { d, name: locale === 'en' ? en : es }
  }
  return best && best.d <= NEAR ? best.name : null
}
