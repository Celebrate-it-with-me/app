import { computed, defineComponent, h, inject, onBeforeUnmount, onMounted, ref } from 'vue'
import { INVITATION_KEY } from '../composables/useInvitation'
import { renderAst } from './renderer'
import { startBehaviors } from './behaviors'
import './engine.css'

/**
 * One section of a package: the section's AST inside an engine-owned wrapper. The wrapper (not the
 * package) carries the type and the real position among the visible sections, so decoration that
 * depends on position follows the actual order after the organiser reorders or switches sections off.
 */
export default defineComponent({
  name: 'PackageSection',
  props: {
    ast: { type: Object, required: true },
    section: { type: Object, required: true },
    /** 1-based position among the sections that are actually drawn. */
    position: { type: Number, required: true },
    count: { type: Number, required: true },
    /** Absolute base URL of the package files (ends with '/'). */
    base: { type: String, required: true },
    strings: { type: Object, default: undefined }
  },
  setup(props) {
    const root = ref(null)
    const context = inject(INVITATION_KEY)
    let stop = () => {}
    onMounted(() => (stop = startBehaviors(root.value)))
    onBeforeUnmount(() => stop())

    const ctx = computed(() => ({
      invitation: context.invitation.value,
      sections: context.invitation.value.sections,
      section: props.section,
      position: props.position,
      count: props.count,
      locale: context.locale.value,
      tt: context.tt,
      strings: props.strings,
      changeLanguage: context.changeLanguage,
      scrollToRsvp: () => document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }))

    return () => {
      const tree = renderAst(props.ast, { ctx: ctx.value, base: props.base })
      const title = props.section.title
      const isCover = props.section.type === 'cover'
      return h(
        isCover ? 'header' : 'section',
        {
          ref: root,
          id: props.section.type,
          class: 'inv-pkg',
          'data-inv-section': props.section.type,
          'data-inv-position': props.position,
          'data-inv-parity': props.position % 2 === 0 ? 'even' : 'odd',
          'data-inv-first': props.position === 1 ? 'true' : undefined,
          'data-inv-last': props.position === props.count ? 'true' : undefined,
          'aria-label': !isCover && title ? title : undefined
        },
        tree
      )
    }
  }
})
