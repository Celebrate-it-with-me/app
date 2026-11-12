<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiModal, UiField, UiInput, UiSelect, UiButton } from '@/ui'
import { emptyPayment, paymentErrors, formatMoney } from '../utils/budget'

const props = defineProps({
  open: { type: Boolean, default: false },
  item: { type: Object, default: null },
  payment: { type: Object, default: null },
  currency: { type: String, default: 'USD' },
  /** `[{ id, name }]`: who can have paid besides the family. */
  padrinos: { type: Array, default: () => [] },
  saving: { type: Boolean, default: false }
})
const emit = defineEmits(['update:open', 'save'])
const { t, locale } = useI18n()

const form = ref(emptyPayment())
const errors = ref({})

watch(
  () => props.open,
  open => {
    if (!open) return
    errors.value = {}
    if (props.payment) form.value = { amount: String(props.payment.amount), paidOn: props.payment.paidOn, note: props.payment.note ?? '', padrinoId: props.payment.padrinoId ?? '' }
    // A new payment starts at what is still owed: the usual case is paying the balance.
    else form.value = { ...emptyPayment(), amount: props.item?.remaining ? String(props.item.remaining) : '', padrinoId: '' }
  }
)

const payers = computed(() => [
  { value: '', label: t('app.budget.payment.family') },
  ...props.padrinos.map(p => ({ value: p.id, label: t('app.budget.payment.padrino', { name: p.name }) }))
])
const err = key => (errors.value[key] ? t(errors.value[key]) : '')

function submit() {
  errors.value = paymentErrors(form.value)
  if (!Object.keys(errors.value).length) emit('save', { ...form.value })
}
</script>

<template>
  <UiModal
    :open="open"
    :title="t(payment ? 'app.budget.payment.editTitle' : 'app.budget.payment.addTitle')"
    :description="item ? t('app.budget.payment.for', { name: item.title, left: formatMoney(item.remaining, currency, locale) }) : ''"
    size="sm"
    @update:open="emit('update:open', $event)"
  >
    <form id="budget-payment-form" class="space-y-4" novalidate @submit.prevent="submit">
      <UiField :label="t('app.budget.payment.amount')" :error="err('amount')" required>
        <UiInput v-model="form.amount" type="number" inputmode="decimal" min="0" step="0.01" :invalid="!!errors.amount" />
      </UiField>
      <UiField :label="t('app.budget.payment.date')" :error="err('paidOn')" required>
        <UiInput v-model="form.paidOn" type="date" :invalid="!!errors.paidOn" />
      </UiField>
      <UiField v-if="padrinos.length" :label="t('app.budget.payment.paidBy')">
        <UiSelect v-model="form.padrinoId" :options="payers" />
      </UiField>
      <UiField :label="t('app.budget.payment.note')" :hint="t('app.budget.payment.noteHint')">
        <UiInput v-model="form.note" maxlength="160" autocomplete="off" />
      </UiField>
    </form>
    <template #footer>
      <UiButton variant="ghost" @click="emit('update:open', false)">{{ t('app.budget.cancel') }}</UiButton>
      <UiButton type="submit" form="budget-payment-form" :loading="saving">{{ t('app.budget.payment.save') }}</UiButton>
    </template>
  </UiModal>
</template>
