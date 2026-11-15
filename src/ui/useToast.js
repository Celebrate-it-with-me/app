import { reactive, readonly } from 'vue'

const state = reactive({ toasts: [] })
let counter = 0
/** Most toasts on screen at once: the oldest goes when a new one would pass it. */
const MAX_VISIBLE = 3

/**
 * Global toast queue. `UiToaster` (mounted once in App.vue) renders it.
 * toast({ title, description?, tone?: 'neutral'|'success'|'danger'|'warning', duration? })
 */
export function useToast() {
  function toast(options) {
    const next = {
      tone: 'neutral',
      duration: 4000,
      ...(typeof options === 'string' ? { title: options } : options)
    }
    // The same message already on screen (a double click, a repeated failure) is not stacked again.
    const twin = state.toasts.find(t => t.title === next.title && t.description === next.description && t.tone === next.tone)
    if (twin) return twin.id
    const id = ++counter
    state.toasts.push({ id, ...next })
    if (state.toasts.length > MAX_VISIBLE) state.toasts.splice(0, state.toasts.length - MAX_VISIBLE)
    return id
  }

  function dismiss(id) {
    const index = state.toasts.findIndex(t => t.id === id)
    if (index !== -1) state.toasts.splice(index, 1)
  }

  return {
    toasts: readonly(state).toasts,
    toast,
    dismiss,
    success: (title, description) => toast({ title, description, tone: 'success' }),
    error: (title, description) => toast({ title, description, tone: 'danger', duration: 6000 })
  }
}
