import { reactive, readonly } from 'vue'

const state = reactive({ toasts: [] })
let counter = 0

/**
 * Global toast queue. `UiToaster` (mounted once in App.vue) renders it.
 * toast({ title, description?, tone?: 'neutral'|'success'|'danger'|'warning', duration? })
 */
export function useToast() {
  function toast(options) {
    const id = ++counter
    state.toasts.push({
      id,
      tone: 'neutral',
      duration: 4000,
      ...(typeof options === 'string' ? { title: options } : options)
    })
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
