import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import PublicEventService from '@/modules/public-rendering/services/PublicEventService'

export const usePublicRenderingStore = defineStore('publicRendering', () => {
  const event = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  const themeSlug = computed(
    () => event.value?.active_theme?.slug ?? event.value?.theme_slug ?? 'basic'
  )
  const themeConfig = computed(() => event.value?.theme_config ?? {})
  const themeVersion = computed(() => Number(event.value?.theme_version ?? 1))
  const ready = computed(() => !!event.value && !isLoading.value && !error.value)

  function setEvent(payload) {
    event.value = payload
  }

  async function fetchEvent(slug) {
    isLoading.value = true
    error.value = null

    try {
      event.value = await PublicEventService.getPublicEventBySlug(slug)
    } catch (e) {
      error.value = e?.message || 'Failed to fetch event'
    } finally {
      isLoading.value = false
    }
  }

  return {
    event,
    isLoading,
    error,
    themeSlug,
    themeConfig,
    themeVersion,
    ready,
    setEvent,
    fetchEvent
  }
})
