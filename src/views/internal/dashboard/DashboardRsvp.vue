<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiCard } from '@/ui'
import { rsvpShares } from './dashboardLogic'

const props = defineProps({
  /** Result of `summarizeRsvp`. */
  rsvp: { type: Object, required: true }
})

const { t } = useI18n()
const shares = computed(() => rsvpShares(props.rsvp))
const rows = computed(() => [
  { key: 'attending', value: props.rsvp.attending, dot: 'bg-success-500' },
  { key: 'pending', value: props.rsvp.pending, dot: 'bg-gold-500' },
  { key: 'declined', value: props.rsvp.declined, dot: 'bg-ink-400' }
])
</script>

<template>
  <UiCard :title="t('app.dashboard.rsvp.title')" heading-level="h2">
    <template #actions>
      <router-link to="/dashboard/guests" class="inline-flex min-h-11 items-center text-sm font-semibold text-rose-700 underline-offset-4 hover:underline">{{ t('app.dashboard.rsvp.viewAll') }}</router-link>
    </template>

    <p v-if="!rsvp.people" class="text-base text-ink-600">{{ t('app.dashboard.rsvp.empty') }}</p>

    <template v-else>
      <div
        class="flex h-3 overflow-hidden rounded-full bg-cream-300"
        role="img"
        :aria-label="`${t('app.dashboard.rsvp.bar')}: ${shares.attending} %, ${shares.pending} %, ${shares.declined} %`"
      >
        <div class="bg-success-500" :style="{ width: shares.attending + '%' }"></div>
        <div class="bg-gold-500" :style="{ width: shares.pending + '%' }"></div>
        <div class="bg-ink-400" :style="{ width: shares.declined + '%' }"></div>
      </div>
      <ul class="mt-4 space-y-2 text-base">
        <li v-for="row in rows" :key="row.key" class="flex items-center justify-between gap-3">
          <span class="flex items-center gap-2 text-ink-700">
            <span class="h-2 w-2 shrink-0 rounded-full" :class="row.dot" aria-hidden="true"></span>
            {{ t(`app.dashboard.rsvp.${row.key}`) }}
          </span>
          <span class="tabular-nums text-ink-900">{{ shares[row.key] }} %</span>
        </li>
      </ul>
      <p class="mt-3 text-sm text-ink-600">{{ rsvp.people }} {{ t('app.dashboard.rsvp.people') }}</p>
    </template>
  </UiCard>
</template>
