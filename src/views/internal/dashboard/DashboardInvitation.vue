<script setup>
import { useI18n } from 'vue-i18n'
import { UiCard, UiBadge, UiButton } from '@/ui'

defineProps({
  published: { type: Boolean, default: false },
  /** Route to the event form, where the status is changed. */
  editTo: { type: [String, Object], default: null }
})

const { t } = useI18n()
</script>

<template>
  <UiCard :title="t('app.dashboard.invitation.title')" heading-level="h2">
    <template #actions>
      <UiBadge :tone="published ? 'success' : 'warning'" dot>
        {{ t(published ? 'app.dashboard.invitation.published' : 'app.dashboard.invitation.draft') }}
      </UiBadge>
    </template>
    <p class="text-base text-ink-600">
      {{ t(published ? 'app.dashboard.invitation.publishedText' : 'app.dashboard.invitation.draftText') }}
    </p>
    <UiButton v-if="editTo" :to="editTo" variant="secondary" size="sm" class="mt-4">
      {{ t('app.dashboard.invitation.manage') }}
    </UiButton>
  </UiCard>
</template>
