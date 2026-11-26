/**
 * Class strings the Inicio's blocks share, so the whole screen speaks the prototype's language with the existing tokens:
 * one rose (`rose-700`, AA on white and cream), `ink-900` as ink, links at 13 px.
 */

/** A text link (block headers, "Cambiar plantilla", "Ver programa"...): 13 px, 44 px tall to tap. */
export const LINK =
  'inline-flex min-h-11 items-center rounded-md text-[13px] font-semibold text-rose-700 underline-offset-4 hover:text-rose-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700'

/** The same link inside a card header: the 44 px target overflows the line instead of pushing the title down. */
export const HEADER_LINK = `${LINK} -my-3`
