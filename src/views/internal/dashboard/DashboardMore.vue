<script setup>
/** What is left of "Más sobre tu evento": the day's program (its own block arrives with the next round of the Inicio). */
import { useI18n } from 'vue-i18n'
import { UiCard } from '@/ui'

defineProps({
  /** Next moments of the day, already sorted: `[{ id, title, time }]`. */
  program: { type: Array, default: () => [] }
})

const { t } = useI18n()
</script>

<template>
  <section aria-labelledby="more-title" class="pt-10">
    <h2 id="more-title" class="font-heading text-2xl text-ink-900">{{ t('app.dashboard.more.title') }}</h2>
    <p class="mt-1 text-sm text-ink-500">{{ t('app.dashboard.more.subtitle') }}</p>

    <div class="mt-4">
      <UiCard :title="t('app.dashboard.more.program')" heading-level="h3" padding="sm" flat>
        <p v-if="!program.length" class="text-sm text-ink-500">{{ t('app.dashboard.more.programEmpty') }}</p>
        <ul v-else class="space-y-2 text-sm">
          <li v-for="item in program" :key="item.id" class="flex gap-3">
            <span class="w-[4.5rem] shrink-0 whitespace-nowrap tabular-nums text-ink-500">{{ item.time }}</span>
            <span class="min-w-0 text-ink-900">{{ item.title }}</span>
          </li>
        </ul>
        <router-link to="/dashboard/timeline" class="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-rose-700 underline-offset-4 hover:underline">{{ t('app.dashboard.more.programOpen') }}</router-link>
      </UiCard>
    </div>
  </section>
</template>
