<script setup>
import { useI18n } from 'vue-i18n'
import { UiBadge } from '@/ui'

/** The delivery state of a guest as a badge (state in words, not only colour). Nothing when the roster said nothing. */
defineProps({ delivery: { type: Object, default: null } })
const { t } = useI18n()
</script>

<template>
  <UiBadge v-if="delivery" :tone="delivery.tone" size="sm" data-testid="delivery">
    <component :is="delivery.icon" class="h-3 w-3" aria-hidden="true" />
    <span class="sr-only">{{ t('app.whatsapp.stateLabel') }}:</span>
    {{ t(`app.whatsapp.state.${delivery.key}`) }}
  </UiBadge>
</template>
