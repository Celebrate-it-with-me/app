import { computed, defineComponent, h, inject } from 'vue'
import { INVITATION_KEY } from '../composables/useInvitation'
import { renderAst } from './renderer'

/** True when the layout has exactly one `<q-sections>` and it is not under a condition (it could hide the invitation). */
export function layoutIsValid(ast) {
  let count = 0
  let hidden = false
  const walk = (node, underIf, depth) => {
    if (!node || typeof node !== 'object' || depth > 30) return
    if (node.t === 'q' && String(node.name).replace(/^q-/, '') === 'sections') {
      count++
      if (underIf) hidden = true
    }
    const next = underIf || node.t === 'if'
    for (const child of Array.isArray(node.children) ? node.children : Array.isArray(node.nodes) ? node.nodes : []) walk(child, next, depth + 1)
  }
  walk(ast, false, 0)
  return count === 1 && !hidden
}

/**
 * `layout.html`: the frame of the page (header, background, footer). The sections are not placed in
 * slots: the one `<q-sections>` draws the default slot, i.e. every visible section in the organiser's order.
 */
export default defineComponent({
  name: 'PackageLayout',
  props: {
    ast: { type: Object, required: true },
    base: { type: String, required: true },
    strings: { type: Object, default: undefined }
  },
  setup(props, { slots }) {
    const context = inject(INVITATION_KEY)
    const ctx = computed(() => ({
      invitation: context.invitation.value,
      sections: context.invitation.value.sections,
      section: {},
      position: 0,
      locale: context.locale.value,
      tt: context.tt,
      strings: props.strings,
      changeLanguage: context.changeLanguage,
      scrollToRsvp: () => document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      renderSections: () => slots.default?.()
    }))
    return () => h('div', { class: 'inv-pkg-layout', 'data-inv-layout': 'true' }, renderAst(props.ast, { ctx: ctx.value, base: props.base }))
  }
})
