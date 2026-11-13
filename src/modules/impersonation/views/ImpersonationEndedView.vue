<script setup>
/** Shown when a support session is over (left, expired or ended by the server). The session itself is already gone. */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { UiButton, UiEmptyState } from '@/ui'

const { t } = useI18n()
const route = useRoute()
const expired = computed(() => route.query.reason === 'expired')
// Only when the build knows where the admin lives; there is no default.
const adminUrl = import.meta.env.VITE_ADMIN_URL || ''
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-cream-100 px-4 text-ink-900">
    <UiEmptyState
      :title="t('impersonation.endedTitle')"
      :description="expired ? t('impersonation.endedExpired') : t('impersonation.endedText')"
    >
      <UiButton v-if="adminUrl" :href="adminUrl">{{ t('impersonation.backToAdmin') }}</UiButton>
    </UiEmptyState>
  </main>
</template>
