import { defineAsyncComponent } from 'vue'

export const templateRegistry = {
  'habana-nights': defineAsyncComponent(
    () => import('@/views/non-authenticated/templates/habana-nights-v2/HNMainLayout.vue')
  ),
  'ocean-vibe': defineAsyncComponent(
    () => import('@/views/non-authenticated/templates/ocean-vibe-v2/OVMainLayout.vue')
  ),
  basic: defineAsyncComponent(
    () => import('@/views/non-authenticated/templates/basic/MainLayout.vue')
  )
}

export function resolveTemplateComponent(slug) {
  return templateRegistry[slug] || templateRegistry.basic
}
