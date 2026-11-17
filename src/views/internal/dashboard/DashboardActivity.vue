<script setup>
import { useI18n } from 'vue-i18n'
import { UiCard } from '@/ui'

defineProps({
  /** `[{ id, message, createdAt }]`. */
  activity: { type: Array, default: () => [] }
})

const { t } = useI18n()
</script>

<template>
  <UiCard :title="t('app.dashboard.more.activity')" heading-level="h2">
    <p v-if="!activity.length" class="text-base text-ink-600">{{ t('app.dashboard.more.activityEmpty') }}</p>
    <ul v-else class="space-y-3 text-sm">
      <li v-for="item in activity" :key="item.id">
        <p class="text-ink-900">{{ item.message }}</p>
        <p class="text-xs text-ink-500">{{ item.createdAt }}</p>
      </li>
    </ul>
  </UiCard>
</template>
