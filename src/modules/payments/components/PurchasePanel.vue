<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiButton, UiField, UiInput, useToast } from '@/ui'
import PaymentsService from '../services/PaymentsService'
import { formatMoney, isInvalidCode } from '../utils/money'

const props = defineProps({
  eventId: { type: [Number, String], required: true },
  /** A code typed earlier (for instance on the create-event form). */
  initialCode: { type: String, default: '' }
})

const { t, locale } = useI18n()
const { error: showError } = useToast()

const quote = ref(null)
const code = ref(props.initialCode)
const codeError = ref('')
const loading = ref(true)
const paying = ref(false)

const price = computed(() => (quote.value ? formatMoney(quote.value.amountCents, quote.value.currency, locale.value) : ''))
const listPrice = computed(() => (quote.value ? formatMoney(quote.value.listPriceCents, quote.value.currency, locale.value) : ''))
const discounted = computed(() => quote.value && quote.value.amountCents < quote.value.listPriceCents)
const isFree = computed(() => quote.value?.amountCents === 0)

async function load(withCode) {
  loading.value = true
  codeError.value = ''
  try {
    quote.value = await PaymentsService.quote(props.eventId, withCode)
  } catch (e) {
    if (isInvalidCode(e)) {
      codeError.value = t('payments.invalidCode')
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
    window.location.assign(url)
  } catch (e) {
    paying.value = false
    if (isInvalidCode(e)) codeError.value = t('payments.invalidCode')
    else showError(t('payments.checkoutFailed'))
  }
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <p v-if="quote" class="text-ink-900">
      <span class="font-heading text-4xl">{{ price }}</span>
      <span v-if="discounted" class="ml-2 text-base text-ink-500 line-through">{{ listPrice }}</span>
      <span class="ml-2 text-sm text-ink-600">{{ t('payments.note', { n: quote.maxGuests }) }}</span>
    </p>

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
    <p class="text-sm text-ink-600">{{ t('payments.refundNote') }}</p>
  </div>
</template>
