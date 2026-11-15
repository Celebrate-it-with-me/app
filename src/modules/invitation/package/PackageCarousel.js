import { defineComponent, h, ref } from 'vue'

/** `data-carousel`: a scroll-snap row with previous/next buttons. Native scrolling, keyboard reachable. */
export default defineComponent({
  name: 'PackageCarousel',
  props: { tag: { type: String, default: 'div' }, labels: { type: Object, required: true } },
  setup(props, { slots, attrs }) {
    const track = ref(null)
    const reduce = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
    const go = dir => {
      const el = track.value
      if (!el) return
      el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: reduce() ? 'auto' : 'smooth' })
    }
    return () =>
      h('div', { class: 'inv-carousel', role: 'region', 'aria-roledescription': 'carousel', 'aria-label': props.labels.carousel }, [
        h(props.tag, { ...attrs, ref: track, class: [attrs.class, 'inv-carousel__track'], tabindex: 0 }, slots.default?.()),
        h('button', { type: 'button', class: 'inv-carousel__btn inv-carousel__btn--prev', 'aria-label': props.labels.previous, onClick: () => go(-1) }, '‹'),
        h('button', { type: 'button', class: 'inv-carousel__btn inv-carousel__btn--next', 'aria-label': props.labels.next, onClick: () => go(1) }, '›')
      ])
  }
})
