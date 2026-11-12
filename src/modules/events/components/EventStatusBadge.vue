<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiBadge } from '@/ui'

const props = defineProps({
  /** draft | published | archived */
  status: { type: String, required: true },
  size: { type: String, default: 'md' }
})

const { t } = useI18n()
const TONES = { draft: 'warning', published: 'success', archived: 'neutral' }
const tone = computed(() => TONES[props.status] ?? 'neutral')
</script>

<template>
  <UiBadge :tone="tone" :size="size" dot>{{ t(`events.status.${status}`) }}</UiBadge>
</template>
