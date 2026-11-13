<script setup>
import { useI18n } from 'vue-i18n'
import { ArrowRight } from 'lucide-vue-next'

defineProps({
  done: { type: Number, required: true },
  total: { type: Number, default: 4 }
})
const { t } = useI18n()
</script>

<template>
  <router-link
    to="/dashboard/start"
    class="mt-3 flex min-h-11 items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-2.5 hover:border-rose-400 focus-visible:outline-2 focus-visible:outline-rose-600"
  >
    <span class="min-w-0">
      <span class="block text-base font-medium text-ink-900">{{ t('app.start.dashboardLink', { done, total }) }}</span>
      <span class="block text-sm text-ink-500">{{ t('app.start.dashboardLinkText') }}</span>
    </span>
    <ArrowRight class="h-4 w-4 shrink-0 text-ink-500" aria-hidden="true" />
  </router-link>
</template>
