<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { CircleCheck, CircleX, FileSearch, Hourglass, Mail, RotateCcw, Undo2 } from 'lucide-vue-next'
import { UiButton, UiCard } from '@/ui'
import { SUPPORT_EMAIL, mailtoLink } from '@/config/brand'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import PaymentsService from '../services/PaymentsService'
import { REVIEW_CODES, waitForOutcome } from '../utils/money'
import { clearTemplateReturn, pickerReturnPath, readTemplateReturn } from '@/modules/template-picker/utils/templatePicker'

const { t, te } = useI18n()
const route = useRoute()
const router = useRouter()
const eventsStore = useEventsStore()

const eventId = route.params.id
const purchase = route.query.purchase ? String(route.query.purchase) : undefined

// waiting: confirming. done: unlocked. late: not confirmed yet. cancelled: left the Stripe page. failed: the payment did not go through.
// review: we are checking it by hand (amount mismatch, duplicate payment); never shown as a failure. refunded / chargeback: money went back. A late webhook can still turn any of the first states into done.
const state = ref(route.query.cancelled ? 'cancelled' : 'waiting')
const failureCode = ref(null)
const invoiceId = ref(null)
const refreshing = ref(false)
// She left for the payment from a premium template: after paying she goes back to it.
const templateReturn = readTemplateReturn(eventId)

// Dev-only fake of the endpoints (never in the production bundle).
let api = PaymentsService
async function loadApi() {
  if (import.meta.env.DEV && route.query.mock) {
    const { mockPayments } = await import('../dev/mockPayments')
    api = mockPayments(String(route.query.mock))
  }
}

const failedKey = computed(() => (te(`payments.failed.codes.${failureCode.value}`) ? failureCode.value : 'other'))
const mailHref = computed(() => mailtoLink({ subject: t('payments.late.mailSubject') }))

async function settle() {
  const res = await waitForOutcome(() => api.status(eventId, purchase))
  failureCode.value = res?.failureCode ?? null
  invoiceId.value = res?.invoiceId ?? null
  if (!res) state.value = 'late'
  else if (REVIEW_CODES.includes(res.failureCode)) state.value = 'review'
  else if (res.status === 'chargeback') state.value = 'chargeback'
  else if (res.status === 'refunded') state.value = 'refunded'
  else if (res.status === 'failed') state.value = res.failureCode === 'cancelled' ? 'cancelled' : 'failed'
  else {
    // The payment is confirmed; refreshing the event is a courtesy and must not hide that.
    await eventsStore.fetchEvent(eventId).catch(() => {})
    state.value = 'done'
  }
}

function goBackToTemplate() {
  const path = pickerReturnPath(templateReturn.templateId, templateReturn.preset)
  clearTemplateReturn()
  router.push(path)
}

async function refresh() {
  refreshing.value = true
  state.value = 'waiting'
  try {
    await settle()
  } finally {
    refreshing.value = false
  }
}

async function cancelPurchase() {
  try {
    await api.cancel(eventId, purchase)
  } catch (e) {
    // 409 not_pending: it is no longer pending (maybe it was paid just as she came back), so ask what happened.
    if (e?.response?.status === 409) {
      state.value = 'waiting'
      await settle()
    }
    // Any other error: the screen still says nothing was charged; the session expires on its own.
  }
}

onMounted(async () => {
  await loadApi()
  if (state.value === 'cancelled') {
    if (purchase) await cancelPurchase()
    return
  }
  await settle()
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
        <div class="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <UiButton v-if="templateReturn" @click="goBackToTemplate">{{ t('templatePicker.useAfterPayment') }}</UiButton>
          <UiButton v-else @click="router.push('/dashboard')">{{ t('payments.done.cta') }}</UiButton>
          <UiButton v-if="templateReturn" variant="ghost" @click="router.push('/dashboard')">{{ t('payments.done.cta') }}</UiButton>
          <UiButton v-if="invoiceId" variant="secondary" to="/settings/purchases">{{ t('payments.done.invoice') }}</UiButton>
        </div>
      </div>

      <div v-else-if="state === 'late'" role="status">
        <Hourglass class="mx-auto h-8 w-8 text-gold-700" aria-hidden="true" />
        <h1 class="mt-4 font-heading text-3xl text-ink-900">{{ t('payments.late.title') }}</h1>
        <p class="mt-2 text-ink-600">{{ t('payments.late.text') }}</p>
        <p class="mt-2 text-sm text-ink-500">{{ t('payments.late.noRepay') }}</p>
        <div class="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <UiButton :loading="refreshing" @click="refresh">
            <RotateCcw class="h-4 w-4" aria-hidden="true" />
            {{ t('payments.late.refresh') }}
          </UiButton>
          <UiButton variant="secondary" :href="mailHref">
            <Mail class="h-4 w-4" aria-hidden="true" />
            {{ SUPPORT_EMAIL }}
          </UiButton>
          <UiButton variant="ghost" to="/dashboard">{{ t('unlock.back') }}</UiButton>
        </div>
      </div>

      <div v-else-if="state === 'failed'" role="alert">
        <CircleX class="mx-auto h-8 w-8 text-rose-600" aria-hidden="true" />
        <h1 class="mt-4 font-heading text-3xl text-ink-900">{{ t('payments.failed.title') }}</h1>
        <p class="mt-2 text-ink-600">{{ t(`payments.failed.codes.${failedKey}`) }}</p>
        <div class="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <UiButton to="/dashboard/unlock/guests-limit">{{ t('payments.failed.cta') }}</UiButton>
          <UiButton variant="ghost" to="/dashboard">{{ t('unlock.back') }}</UiButton>
        </div>
      </div>

      <div v-else-if="state === 'review'" role="status" data-testid="payment-review">
        <FileSearch class="mx-auto h-8 w-8 text-gold-700" aria-hidden="true" />
        <h1 class="mt-4 font-heading text-3xl text-ink-900">{{ t('payments.review.title') }}</h1>
        <p class="mt-2 text-ink-600">{{ t(`payments.review.codes.${failureCode}`) }}</p>
        <p class="mt-2 text-ink-600">{{ t('payments.review.text') }}</p>
        <div class="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <UiButton variant="secondary" :href="mailHref">
            <Mail class="h-4 w-4" aria-hidden="true" />
            {{ SUPPORT_EMAIL }}
          </UiButton>
          <UiButton variant="ghost" to="/dashboard">{{ t('unlock.back') }}</UiButton>
        </div>
      </div>

      <div v-else-if="state === 'refunded' || state === 'chargeback'" role="status">
        <Undo2 class="mx-auto h-8 w-8 text-gold-700" aria-hidden="true" />
        <h1 class="mt-4 font-heading text-3xl text-ink-900">{{ t(`payments.${state}.title`) }}</h1>
        <p class="mt-2 text-ink-600">{{ t(`payments.${state}.text`) }}</p>
        <div class="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <UiButton variant="secondary" :href="mailHref">
            <Mail class="h-4 w-4" aria-hidden="true" />
            {{ SUPPORT_EMAIL }}
          </UiButton>
          <UiButton variant="ghost" to="/dashboard">{{ t('unlock.back') }}</UiButton>
        </div>
      </div>

      <div v-else role="status">
        <h1 class="font-heading text-3xl text-ink-900">{{ t('payments.cancelled.title') }}</h1>
        <p class="mt-2 text-ink-600">{{ t('payments.cancelled.text') }}</p>
        <div class="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <UiButton to="/dashboard/unlock/guests-limit">{{ t('payments.cancelled.cta') }}</UiButton>
          <UiButton variant="ghost" to="/dashboard">{{ t('unlock.back') }}</UiButton>
        </div>
      </div>
    </UiCard>
  </div>
</template>
