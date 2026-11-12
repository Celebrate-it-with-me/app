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
