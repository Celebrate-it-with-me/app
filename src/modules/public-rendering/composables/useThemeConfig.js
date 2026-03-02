import { computed } from 'vue'
import { usePublicRenderingStore } from '@/modules/public-rendering/stores/usePublicRenderingStore'

export function useThemeConfig() {
  const store = usePublicRenderingStore()

  const slug = computed(() => store.themeSlug)
  const config = computed(() => store.themeConfig)
  const version = computed(() => store.themeVersion)
  const ready = computed(() => store.ready)

  return { slug, config, version, ready }
}
