import { onBeforeUnmount, onMounted, ref } from 'vue'

export function useMediaQuery(query) {
  const matches = ref(typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false)
  let mql = null
  const update = e => (matches.value = e.matches)

  onMounted(() => {
    if (!window.matchMedia) return
    mql = window.matchMedia(query)
    matches.value = mql.matches
    mql.addEventListener('change', update)
  })
  onBeforeUnmount(() => mql?.removeEventListener('change', update))

  return matches
}
