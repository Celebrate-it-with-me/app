<script setup>
/** Catch-all 404. Public: never redirects, so it cannot loop with the auth guard. */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Heart } from 'lucide-vue-next'
import { UiButton, UiEmptyState } from '@/ui'
import { useUserStore } from '@/stores/useUserStore'

const { t } = useI18n()
const userStore = useUserStore()
// Signed in: the dashboard. Otherwise the public home page.
const homeTo = computed(() => (userStore.isAuthenticated ? '/dashboard' : '/'))
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-cream-100 px-4 text-ink-900">
    <UiEmptyState :title="t('notFound.title')" :description="t('notFound.text')">
      <template #icon><Heart class="h-6 w-6" aria-hidden="true" /></template>
      <UiButton :to="homeTo">{{ t('notFound.backHome') }}</UiButton>
    </UiEmptyState>
  </main>
</template>
