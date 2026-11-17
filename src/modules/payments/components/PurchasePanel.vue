<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Lock } from 'lucide-vue-next'
import { UiButton, UiField, UiInput, useToast } from '@/ui'
import PaymentsService from '../services/PaymentsService'
import { isEmailNotVerified } from '@/modules/email-verification/utils/emailVerification'
import { formatMoney, isInvalidCode } from '../utils/money'
import { readPendingCode, clearPendingCode } from '../utils/pendingCode'

const props = defineProps({
  eventId: { type: [Number, String], required: true },
  /** A code typed earlier (for instance on the create-event form). */
  initialCode: { type: String, default: '' }
})

const { t, locale } = useI18n()
const { error: showError } = useToast()

const quote = ref(null)
// A code typed earlier wins; else the one that came with the landing link. Stays visible and editable.
const code = ref(props.initialCode || readPendingCode() || '')
const codeError = ref('')
const loading = ref(true)
const paying = ref(false)

const price = computed(() => (quote.value ? formatMoney(quote.value.amountCents, quote.value.currency, locale.value) : ''))
const listPrice = computed(() => (quote.value ? formatMoney(quote.value.listPriceCents, quote.value.currency, locale.value) : ''))
const discounted = computed(() => quote.value && quote.value.amountCents < quote.value.listPriceCents)
const isFree = computed(() => quote.value?.amountCents === 0)
const saving = computed(() => (discounted.value ? formatMoney(quote.value.listPriceCents - quote.value.amountCents, quote.value.currency, locale.value) : ''))

async function load(withCode) {
  loading.value = true
  codeError.value = ''
  try {
    quote.value = await PaymentsService.quote(props.eventId, withCode)
  } catch (e) {
    if (isInvalidCode(e)) {
      codeError.value = t('payments.invalidCode')
      clearPendingCode()
      quote.value = await PaymentsService.quote(props.eventId)
    } else showError(t('common.genericError'))
  } finally {
    loading.value = false
  }
}

onMounted(() => load(code.value.trim() || undefined))

const apply = () => load(code.value.trim() || undefined)

async function pay() {
  paying.value = true
  try {
    const { url } = await PaymentsService.checkout(props.eventId, quote.value.code ?? undefined)
    clearPendingCode()
    window.location.assign(url)
  } catch (e) {
    paying.value = false
    // Unverified email: the global dialog explains it; the code and quote stay as they were.
    if (isEmailNotVerified(e)) return
    if (isInvalidCode(e)) codeError.value = t('payments.invalidCode')
    else showError(t('payments.checkoutFailed'))
  }
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <dl v-if="quote" class="rounded-lg border border-line bg-cream-100 p-4 text-sm text-ink-700" data-testid="purchase-summary">
      <div class="flex items-baseline justify-between gap-3">
        <dt>{{ t('payments.summary.item') }}</dt>
        <dd :class="discounted ? 'text-ink-500 line-through' : 'text-ink-900'">{{ listPrice }}</dd>
      </div>
      <div v-if="discounted" class="mt-1 flex items-baseline justify-between gap-3 text-success-700">
        <dt>{{ t('payments.summary.code', { code: quote.code }) }}</dt>
        <dd>&minus;{{ saving }}</dd>
      </div>
      <div class="mt-3 flex items-baseline justify-between gap-3 border-t border-line pt-3 text-ink-900">
        <dt class="font-semibold">{{ t('payments.summary.total') }}</dt>
        <dd class="font-heading text-3xl" data-testid="purchase-total">{{ price }}</dd>
      </div>
      <p class="mt-1 text-right text-xs text-ink-600">{{ t('payments.note', { n: quote.maxGuests }) }}</p>
    </dl>

    <form class="flex flex-col gap-2 sm:flex-row sm:items-end" novalidate @submit.prevent="apply">
      <UiField :label="t('payments.codeLabel')" :error="codeError" id="purchase_code" class="flex-1">
        <UiInput v-model="code" :placeholder="t('payments.codePlaceholder')" autocomplete="off" />
      </UiField>
      <UiButton type="submit" variant="secondary" :loading="loading">{{ t('payments.apply') }}</UiButton>
    </form>
    <p v-if="quote?.code && !codeError" class="-mt-3 text-sm text-success-700">{{ t('payments.codeApplied', { code: quote.code }) }}</p>

    <UiButton :loading="paying" :disabled="!quote" @click="pay">
      {{ isFree ? t('payments.unlockFree') : t('payments.pay', { price }) }}
    </UiButton>
    <div class="flex flex-col gap-2 text-sm text-ink-600">
      <p v-if="!isFree" class="flex items-start gap-2" data-testid="stripe-note">
        <Lock class="mt-0.5 h-4 w-4 shrink-0 text-ink-500" aria-hidden="true" />
        <span>{{ t('payments.secure') }}</span>
      </p>
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
  </div>
</template>
