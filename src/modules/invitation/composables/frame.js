import { defineComponent, inject, provide } from 'vue'

/**
 * How a section component frames itself:
 *  - 'full'      native invitation: anchor id, flourish, heading, text (Clásica as built in)
 *  - 'inner'     inside a template package, `frame="full"`: the engine frame without its own anchor (the package wrapper has it)
 *  - 'no-title'  as 'inner' without the heading and text (the package writes its own)
 *  - 'bare'      only the content: the package draws heading, flourish and padding
 */
export const FRAME_KEY = Symbol('invitation-frame')
export const FRAMES = { full: 'inner', 'no-title': 'no-title', bare: 'bare' }

export const useFrame = () => inject(FRAME_KEY, 'full')

/** Sets the frame for the section component below it. */
export const FrameScope = defineComponent({
  name: 'FrameScope',
  props: { frame: { type: String, default: 'bare' } },
  setup(props, { slots }) {
    provide(FRAME_KEY, FRAMES[props.frame] ?? 'bare')
    return () => slots.default?.()
  }
})
