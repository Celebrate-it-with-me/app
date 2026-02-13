import { getCurrentInstance, onMounted } from 'vue'

/**
 * Logs a deprecation warning for a component.
 *
 * - Only runs in development.
 * - Shows component name automatically if not provided.
 * - Prevents duplicate logs per session.
 */
const warnedComponents = new Set()

export function useDeprecationWarning(componentName, message) {
  // Only run in development
  if (import.meta.env.PROD) return

  onMounted(() => {
    const instance = getCurrentInstance()

    const name = componentName || instance?.type?.name || 'AnonymousComponent'

    if (warnedComponents.has(name)) return

    warnedComponents.add(name)

    console.warn(
      `%c[DEPRECATED COMPONENT] ${name}`,
      'background:#f59e0b;color:white;padding:2px 6px;border-radius:4px',
      message
    )
  })
}
