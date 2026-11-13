<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { CircleCheck, Hourglass } from 'lucide-vue-next'
import { UiButton, UiCard } from '@/ui'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import PaymentsService from '../services/PaymentsService'
import { waitForUnlock } from '../utils/money'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const eventsStore = useEventsStore()

// waiting: the payment is being confirmed. done: unlocked. late: still not confirmed (it can take a moment). cancelled: left the payment page.
const state = ref(route.query.cancelled ? 'cancelled' : 'waiting')

onMounted(async () => {
  if (state.value === 'cancelled') return
  const eventId = route.params.id
  const unlocked = await waitForUnlock(() => PaymentsService.status(eventId))
  if (unlocked) {
    await eventsStore.fetchEvent(eventId)
    state.value = 'done'
  } else state.value = 'late'
})
</script>

<template>
  <div class="mx-auto w-full max-w-xl">
    <UiCard padding="lg" class="text-center">
      <div v-if="state === 'waiting'" role="status">
        <Hourglass class="mx-auto h-8 w-8 text-gold-700" aria-hidden="true" />
        <h1 class="mt-4 font-heading text-3xl text-ink-900">{{ t('payments.waiting.title') }}</h1>
        <p class="mt-2 text-ink-600">{{ t('payments.waiting.text') }}</p>
      </div>

      <div v-else-if="state === 'done'" role="status">
        <CircleCheck class="mx-auto h-8 w-8 text-success-600" aria-hidden="true" />
        <h1 class="mt-4 font-heading text-3xl text-ink-900">{{ t('payments.done.title') }}</h1>
        <p class="mt-2 text-ink-600">{{ t('payments.done.text') }}</p>
        <UiButton class="mt-6" @click="router.push('/dashboard')">{{ t('payments.done.cta') }}</UiButton>
      </div>

      <div v-else role="status">
        <h1 class="font-heading text-3xl text-ink-900">{{ t(`payments.${state}.title`) }}</h1>
        <p class="mt-2 text-ink-600">{{ t(`payments.${state}.text`) }}</p>
        <div class="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <UiButton v-if="state === 'cancelled'" to="/dashboard/unlock/guests-limit">{{ t('payments.cancelled.cta') }}</UiButton>
          <UiButton variant="ghost" to="/dashboard">{{ t('unlock.back') }}</UiButton>
        </div>
      </div>
    </UiCard>
  </div>
</template>
