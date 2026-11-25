<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Lock, Tag, TriangleAlert } from 'lucide-vue-next'
import { UiButton, UiField, UiInput, useToast } from '@/ui'
import PaymentsService from '../services/PaymentsService'
import { isEmailNotVerified } from '@/modules/email-verification/utils/emailVerification'
import { formatMoney, isAlreadyUnlocked, isInvalidCode } from '../utils/money'
import { checkoutProblem, holdMinutesOf, offerApplies, offerNotice, slotsLeftOf } from '../utils/launchOffer'
import { readPendingCode, clearPendingCode } from '../utils/pendingCode'
import { safeCheckoutUrl } from '../utils/checkoutUrl'

const props = defineProps({
  eventId: { type: [Number, String], required: true },
  /** A code typed earlier (for instance on the create-event form). */
  initialCode: { type: String, default: '' }
})
// The event turned out to be unlocked already (the quote says so): the parent shows that instead of a payment.
const emit = defineEmits(['already-unlocked'])

const { t, locale } = useI18n()
const router = useRouter()
const { error: showError } = useToast()

const quote = ref(null)
// A code typed earlier wins; else the one that came with the landing link. Stays visible and editable.
const code = ref(props.initialCode || readPendingCode() || '')
const codeError = ref('')
// The code field hides behind "¿Tienes un código?" unless there is already a code to show.
const codeOpen = ref(Boolean(code.value))
// What happened on the last try that she must read: { kind: 'price_changed'|'exhausted'|'previous_session_open'|'payment_in_progress', price? }
const problem = ref(null)
const loading = ref(true)
const paying = ref(false)

const money = cents => formatMoney(cents, quote.value?.currency, locale.value)
const price = computed(() => (quote.value ? money(quote.value.amountCents) : ''))
const listPrice = computed(() => (quote.value ? money(quote.value.listPriceCents) : ''))
const discounted = computed(() => quote.value && quote.value.amountCents < quote.value.listPriceCents)
const isFree = computed(() => quote.value?.amountCents === 0)
const saving = computed(() => (discounted.value ? money(quote.value.listPriceCents - quote.value.amountCents) : ''))
const onOffer = computed(() => offerApplies(quote.value))
const slotsLeft = computed(() => slotsLeftOf(quote.value))
const notice = computed(() => offerNotice(quote.value))
const holdMinutes = computed(() => holdMinutesOf(quote.value))
const discountLabel = computed(() => (quote.value?.source === 'offer' ? t('payments.summary.offer') : t('payments.summary.code', { code: quote.value?.code })))
// Another payment of this event is open: the only way forward is to look at it, never to pay again.
const blocked = computed(() => ['previous_session_open', 'payment_in_progress'].includes(problem.value?.kind))
const payLabel = computed(() => {
  if (isFree.value) return t('payments.unlockFree')
  // "Apply" only makes sense when she applied a code; the automatic launch offer is just "Pay".
  return quote.value?.code ? t('payments.payOffer', { price: price.value }) : t('payments.pay', { price: price.value })
})

function notifyUnlocked() {
  if (quote.value?.unlocked) emit('already-unlocked')
}

/** The code tied to the offer arrived after it ended: drop it and show the list price with a clear explanation. */
async function dropExhaustedCode() {
  code.value = ''
  codeError.value = ''
  clearPendingCode()
  quote.value = await PaymentsService.quote(props.eventId)
  problem.value = { kind: 'exhausted', price: price.value }
  notifyUnlocked()
}

async function load(withCode) {
  loading.value = true
  codeError.value = ''
  try {
    quote.value = await PaymentsService.quote(props.eventId, withCode)
    notifyUnlocked()
  } catch (e) {
    if (checkoutProblem(e)?.kind === 'exhausted') {
      try {
        await dropExhaustedCode()
      } catch {
        showError(t('common.genericError'))
      }
    } else if (isInvalidCode(e)) {
      codeError.value = t('payments.invalidCode')
      codeOpen.value = true
      clearPendingCode()
      quote.value = await PaymentsService.quote(props.eventId)
      notifyUnlocked()
    } else showError(t('common.genericError'))
  } finally {
    loading.value = false
  }
}

onMounted(() => load(code.value.trim() || undefined))

function apply() {
  problem.value = null
  return load(code.value.trim() || undefined)
}

/** The price moved under her feet: read the real one again and make her confirm it. */
async function reconfirmPrice(fallbackCents, offer) {
  try {
    quote.value = await PaymentsService.quote(props.eventId, quote.value?.code ?? undefined)
    notifyUnlocked()
  } catch {
    if (quote.value && Number.isInteger(fallbackCents)) {
      quote.value = { ...quote.value, amountCents: fallbackCents, source: 'list', offer: offer ? { ...quote.value.offer, ...offer, active: false } : quote.value.offer }
    }
  }
  // The offer's own reason says why the price moved: sold out, or her other open payments hold the slots.
  const reason = offerNotice(quote.value)
  problem.value = { kind: reason ?? 'price_changed', price: price.value }
}

const toPayment = () => router.push(`/dashboard/events/${props.eventId}/unlock`)

async function pay() {
  paying.value = true
  problem.value = null
  try {
    const { url } = await PaymentsService.checkout(props.eventId, quote.value.code ?? undefined, quote.value.amountCents)
    // Never follow a URL that is not Stripe Checkout (or our own success page): same generic error as a failed checkout.
    const target = safeCheckoutUrl(url)
    if (!target) {
      paying.value = false
      showError(t('payments.checkoutFailed'))
      return
    }
    clearPendingCode()
    window.location.assign(target)
  } catch (e) {
    paying.value = false
    // Unverified email: the global dialog explains it; the code and quote stay as they were.
    if (isEmailNotVerified(e)) return
    const known = checkoutProblem(e)
    if (known?.kind === 'price_changed') await reconfirmPrice(known.amountCents, known.offer)
    else if (known?.kind === 'exhausted') await dropExhaustedCode().catch(() => showError(t('payments.checkoutFailed')))
    else if (known) problem.value = { kind: known.kind }
    else if (isInvalidCode(e)) {
      codeError.value = t('payments.invalidCode')
      codeOpen.value = true
    } else if (isAlreadyUnlocked(e)) emit('already-unlocked')
    else if (e?.response?.status === 429) showError(t('payments.tooManyAttempts'))
    else if (e?.response?.status === 502 || e?.response?.data?.code === 'gateway_error') showError(t('payments.gatewayError'))
    else showError(t('payments.checkoutFailed'))
  }
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <div v-if="onOffer" class="flex flex-col gap-1 rounded-lg bg-gold-100 p-3 text-sm text-ink-800" data-testid="offer-banner">
      <p class="flex items-center gap-2 font-semibold text-ink-900">
        <Tag class="h-4 w-4 shrink-0 text-gold-700" aria-hidden="true" />
        {{ t('payments.offer.title') }}
      </p>
      <p v-if="slotsLeft" data-testid="offer-slots">{{ t('payments.offer.slots', { n: slotsLeft, total: quote.offer.totalSlots }, slotsLeft) }}</p>
      <p class="text-ink-600">{{ t('payments.offer.hold', { n: holdMinutes }) }}</p>
    </div>
    <p v-else-if="notice && !problem" class="rounded-lg bg-cream-100 p-3 text-sm text-ink-700" role="status" :data-testid="notice === 'holds_full' ? 'offer-holds' : 'offer-ended'">
      {{ notice === 'holds_full' ? t('payments.offer.holdsFull') : t('payments.offer.ended') }}
    </p>

    <div
      v-if="problem"
      class="flex flex-col gap-3 rounded-lg border border-warning-500 bg-warning-50 p-3 text-sm text-ink-800"
      role="alert"
      aria-live="assertive"
      :data-problem="problem.kind"
      data-testid="purchase-problem"
    >
      <p class="flex items-start gap-2">
        <TriangleAlert class="mt-0.5 h-4 w-4 shrink-0 text-warning-700" aria-hidden="true" />
        <span>{{ t(`payments.problems.${problem.kind}`, { price: problem.price ?? price }) }}</span>
      </p>
      <UiButton v-if="blocked" block data-testid="problem-continue" @click="toPayment">
        {{ t('payments.problems.viewPayment') }}
      </UiButton>
    </div>

    <dl v-if="quote" class="rounded-lg border border-line bg-cream-100 p-4 text-sm text-ink-700" data-testid="purchase-summary">
      <div class="flex items-baseline justify-between gap-3">
        <dt>{{ t('payments.summary.item') }}</dt>
        <dd :class="discounted ? 'text-ink-500 line-through' : 'text-ink-900'">{{ listPrice }}</dd>
      </div>
      <div v-if="discounted" class="mt-1 flex items-baseline justify-between gap-3 text-success-700">
        <dt>{{ discountLabel }}</dt>
        <dd>&minus;{{ saving }}</dd>
      </div>
      <div class="mt-3 flex items-baseline justify-between gap-3 border-t border-line pt-3 text-ink-900">
        <dt class="font-semibold">{{ t('payments.summary.total') }}</dt>
        <dd class="font-heading text-3xl" data-testid="purchase-total">{{ price }}</dd>
      </div>
      <p class="mt-1 text-right text-xs text-ink-600">{{ t('payments.note') }}</p>
    </dl>

    <UiButton v-if="!blocked" :loading="paying" :disabled="!quote || quote.unlocked" block data-testid="pay" @click="pay">{{ payLabel }}</UiButton>

    <div class="flex flex-col gap-2 text-sm text-ink-600">
      <p v-if="!isFree" class="flex items-start gap-2" data-testid="trust">
        <Lock class="mt-0.5 h-4 w-4 shrink-0 text-ink-500" aria-hidden="true" />
        <span>{{ t('payments.trust') }}</span>
      </p>
      <details class="group" data-testid="details">
        <summary class="flex min-h-11 cursor-pointer items-center font-medium text-rose-700 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-rose-600">
          {{ t('payments.details') }}
        </summary>
        <div class="flex flex-col gap-2 pb-2">
          <p v-if="!isFree">{{ t('payments.secure') }}</p>
          <p>{{ t('payments.refundNote') }}</p>
          <p v-if="!isFree">{{ t('payments.stripeFee') }}</p>
          <p data-testid="legal-links">
            <i18n-t keypath="payments.legal" tag="span">
              <template #terms>
                <a href="/terms" target="_blank" rel="noopener" class="text-rose-600 underline underline-offset-2">{{ t('payments.termsLink') }}</a>
              </template>
              <template #refunds>
                <a href="/terms#refunds" target="_blank" rel="noopener" class="text-rose-600 underline underline-offset-2">{{ t('payments.refundLink') }}</a>
              </template>
            </i18n-t>
          </p>
        </div>
      </details>
    </div>

    <div class="border-t border-line pt-1">
      <button
        type="button"
        class="flex min-h-11 w-full items-center text-left text-sm font-medium text-rose-700 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-rose-600"
        :aria-expanded="codeOpen"
        aria-controls="purchase-code-form"
        data-testid="code-toggle"
        @click="codeOpen = !codeOpen"
      >
        {{ t('payments.codeLabel') }}
      </button>
      <form v-show="codeOpen" id="purchase-code-form" class="flex flex-col gap-2 sm:flex-row sm:items-end" novalidate @submit.prevent="apply">
        <UiField :label="t('payments.codeFieldLabel')" :error="codeError" id="purchase_code" class="flex-1">
          <UiInput v-model="code" :placeholder="t('payments.codePlaceholder')" autocomplete="off" />
        </UiField>
        <UiButton type="submit" variant="secondary" :loading="loading">{{ t('payments.apply') }}</UiButton>
      </form>
      <p v-if="quote?.code && !codeError" class="mt-2 text-sm text-success-700">{{ t('payments.codeApplied', { code: quote.code }) }}</p>
    </div>
  </div>
</template>
