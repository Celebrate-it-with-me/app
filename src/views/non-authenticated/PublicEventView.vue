<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

import TemplateRenderer from '@/modules/public-rendering/components/TemplateRenderer.vue'
import { usePublicRenderingStore } from '@/modules/public-rendering/stores/usePublicRenderingStore'

const route = useRoute()
const store = usePublicRenderingStore()

onMounted(async () => {
  const slug = route.params.slug

  await store.fetchEvent(slug)
})
</script>

<template>
  <TemplateRenderer />
</template>
