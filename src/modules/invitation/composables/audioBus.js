/** One sound at a time: whoever starts playing announces itself and the others pause. */
export const AUDIO_EVENT = 'inv:audio-play'

export function announceAudio(source) {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(AUDIO_EVENT, { detail: { source } }))
}
