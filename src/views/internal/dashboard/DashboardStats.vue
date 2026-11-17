<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UserPlus } from 'lucide-vue-next'
import { UiButton } from '@/ui'
import { statsFigures } from './dashboardLogic'

const props = defineProps({
  /** Result of `summarizeRsvp`. */
  rsvp: { type: Object, required: true },
  /** Viewers cannot add guests: the empty state then just says there is no one yet. */
  canEdit: { type: Boolean, default: false }
})

const { t } = useI18n()
const figures = computed(() => statsFigures(props.rsvp))
const TONES = { success: 'bg-success-500', gold: 'bg-gold-100/500', ink: 'bg-ink-400', rose: 'bg-rose-500' }
</script>

<template>
  <section aria-labelledby="stats-title" data-testid="dashboard-stats">
    <h2 id="stats-title" class="sr-only">{{ t('app.dashboard.stats.title') }}</h2>

    <div v-if="figures.empty" class="flex flex-col items-start gap-3 rounded-xl border border-dashed border-gold-300 bg-gold-100/50 p-5 sm:flex-row sm:items-center sm:justify-between" data-testid="stats-empty">
      <div class="min-w-0">
        <p class="font-heading text-xl text-ink-900">{{ t('app.dashboard.stats.emptyTitle') }}</p>
        <p class="mt-1 text-base text-ink-600">{{ t('app.dashboard.stats.emptyText') }}</p>
      </div>
      <UiButton v-if="canEdit" to="/dashboard/guests" class="w-full sm:w-auto sm:shrink-0">
        <UserPlus class="h-4 w-4" aria-hidden="true" />
        {{ t('app.dashboard.stats.emptyCta') }}
      </UiButton>
    </div>

    <dl v-else class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div v-for="item in figures.items" :key="item.key" class="min-w-0 rounded-xl border border-line bg-white p-4 shadow-soft" :data-stat="item.key">
        <dt class="flex items-start gap-2 text-sm text-ink-600">
          <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full" :class="TONES[item.tone]" aria-hidden="true"></span>
          <span>{{ t(`app.dashboard.stats.${item.key}`) }}</span>
        </dt>
        <dd class="mt-1 font-heading text-4xl leading-none text-ink-900 tabular-nums">{{ item.value }}</dd>
      </div>
    </dl>
  </section>
</template>
