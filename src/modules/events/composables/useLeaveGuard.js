import { ref, onMounted, onBeforeUnmount } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

/**
 * Warns before leaving a form with unsaved changes: in-app navigation opens a confirmation (`open`, `stay`, `leave`),
 * and closing or reloading the tab shows the browser's own prompt.
 * `dirty` is a ref/computed boolean.
 */
export function useLeaveGuard(dirty) {
  const open = ref(false)
  let resolver = null

  function settle(allow) {
    open.value = false
    resolver?.(allow)
    resolver = null
  }

  onBeforeRouteLeave(() => {
    if (!dirty.value) return true
    open.value = true
    return new Promise(resolve => {
      resolver = resolve
    })
  })

  function onBeforeUnload(event) {
    if (!dirty.value) return
    event.preventDefault()
    event.returnValue = ''
  }
  onMounted(() => window.addEventListener('beforeunload', onBeforeUnload))
  onBeforeUnmount(() => window.removeEventListener('beforeunload', onBeforeUnload))

  return { open, stay: () => settle(false), leave: () => settle(true) }
}
