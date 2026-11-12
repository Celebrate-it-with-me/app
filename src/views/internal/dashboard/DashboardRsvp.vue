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
      <router-link to="/dashboard/rsvp" class="inline-flex min-h-11 items-center text-sm font-semibold text-rose-700 underline-offset-4 hover:underline">{{ t('app.dashboard.rsvp.viewAll') }}</router-link>
    </template>

    <p v-if="!rsvp.people" class="text-base text-ink-600">{{ t('app.dashboard.rsvp.empty') }}</p>

    <template v-else>
      <dl class="grid grid-cols-3 gap-3">
        <div v-for="row in rows" :key="row.key" class="min-w-0">
          <dt class="flex items-start gap-1.5 text-sm text-ink-600">
            <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full" :class="row.dot" aria-hidden="true"></span>
            <span>{{ t(`app.dashboard.rsvp.${row.key}`) }}</span>
          </dt>
          <dd class="font-heading text-3xl leading-tight text-ink-900 tabular-nums">{{ row.value }}</dd>
        </div>
      </dl>

      <div
        class="mt-4 flex h-2 overflow-hidden rounded-full bg-cream-300"
        role="img"
        :aria-label="`${t('app.dashboard.rsvp.bar')}: ${shares.attending} %, ${shares.pending} %, ${shares.declined} %`"
      >
        <div class="bg-success-500" :style="{ width: shares.attending + '%' }"></div>
        <div class="bg-gold-500" :style="{ width: shares.pending + '%' }"></div>
        <div class="bg-ink-400" :style="{ width: shares.declined + '%' }"></div>
      </div>
      <p class="mt-2 text-sm text-ink-600">{{ rsvp.people }} {{ t('app.dashboard.rsvp.people') }}</p>
    </template>
  </UiCard>
</template>
