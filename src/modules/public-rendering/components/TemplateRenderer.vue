<script setup>
import { computed } from 'vue'
import { usePublicRenderingStore } from '@/modules/public-rendering/stores/usePublicRenderingStore'
import { useThemeConfig } from '../composables/useThemeConfig'
import { resolveTemplateComponent } from '../registry/templateRegistry'

const store = usePublicRenderingStore()
const { slug, config, ready } = useThemeConfig()

const currentComponent = computed(() => resolveTemplateComponent(slug.value))
</script>

<template>
  <div v-if="store.isLoading" class="w-full min-h-screen flex items-center justify-center">
    <div class="text-sm text-gray-500">Loading event...</div>
  </div>

  <div v-else-if="store.error" class="w-full min-h-screen flex items-center justify-center px-6">
    <div class="max-w-md w-full text-center">
      <h2 class="text-lg font-semibold">Couldn’t load event</h2>
      <p class="text-sm text-gray-500 mt-2">{{ store.error }}</p>
    </div>
  </div>

  <component v-else-if="ready" :is="currentComponent" :config="config" />
</template>
