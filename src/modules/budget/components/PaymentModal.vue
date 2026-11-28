<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiModal, UiField, UiInput, UiSelect, UiButton, UiDateTimeField } from '@/ui'
import { AlertTriangle } from 'lucide-vue-next'
import { NONE, emptyPayment, paymentErrors, formatMoney, coverageOf } from '../utils/budget'

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
    if (props.payment) form.value = { amount: String(props.payment.amount), paidOn: props.payment.paidOn, note: props.payment.note ?? '', padrinoId: props.payment.padrinoId ?? NONE }
    // A new payment starts at what is still owed: the usual case is paying the balance.
    else form.value = { ...emptyPayment(), amount: props.item?.remaining ? String(props.item.remaining) : '', padrinoId: NONE }
  }
)

const payers = computed(() => [
  { value: NONE, label: t('app.budget.payment.family') },
  ...props.padrinos.map(p => ({ value: p.id, label: t('app.budget.payment.padrino', { name: p.name }) }))
])
const err = key => (errors.value[key] ? t(errors.value[key]) : '')

const cents = value => Math.round((Number(value) || 0) * 100)

/**
 * What the payment would leave over the cost: the amount typed against what is still pending (the pending of the item
 * plus, when editing, the payment being edited). Nothing blocks it: the person chooses to raise the cost or to record it.
 */
const over = computed(() => {
  if (!props.item) return null
  const c = coverageOf(props.item)
  const others = cents(c.paid) - (props.payment ? cents(props.payment.amount) : 0)
  const paidAfter = others + cents(form.value.amount)
  const excess = paidAfter - Math.max(cents(c.total), others)
  return excess > 0 ? { excess: excess / 100, cost: c.total, newCost: paidAfter / 100 } : null
})
const money = value => formatMoney(value, props.currency, locale.value)

/** `raise` also raises the cost of the expense to what is paid (the same call as editing the expense). */
function submit(raise = false) {
  errors.value = paymentErrors(form.value)
  if (!Object.keys(errors.value).length) emit('save', { ...form.value }, raise && over.value ? over.value.newCost : null)
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
    <form id="budget-payment-form" class="space-y-4" novalidate @submit.prevent="submit(false)">
      <UiField :label="t('app.budget.payment.amount')" :error="err('amount')" required>
        <UiInput v-model="form.amount" type="number" inputmode="decimal" min="0" step="0.01" :invalid="!!errors.amount" />
      </UiField>
      <UiField :label="t('app.budget.payment.date')" :error="err('paidOn')" required>
        <UiDateTimeField v-model="form.paidOn" mode="date" :invalid="!!errors.paidOn" />
      </UiField>
      <UiField v-if="padrinos.length" :label="t('app.budget.payment.paidBy')">
        <UiSelect v-model="form.padrinoId" :options="payers" />
      </UiField>
      <UiField :label="t('app.budget.payment.note')" :hint="t('app.budget.payment.noteHint')">
        <UiInput v-model="form.note" maxlength="160" autocomplete="off" />
      </UiField>
      <div v-if="over" class="flex gap-2.5 rounded-xl bg-danger-50 p-3 text-sm text-danger-700" role="status" data-testid="over-warning">
        <AlertTriangle class="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <div>
          <p class="font-semibold">{{ t('app.budget.payment.overTitle', { amount: money(over.excess) }) }}</p>
          <p class="mt-0.5">{{ t('app.budget.payment.overText', { cost: money(over.cost), newCost: money(over.newCost) }) }}</p>
        </div>
      </div>
    </form>
    <template #footer>
      <UiButton variant="ghost" @click="emit('update:open', false)">{{ t('app.budget.cancel') }}</UiButton>
      <template v-if="over">
        <UiButton variant="secondary" :loading="saving" data-testid="raise-cost" @click="submit(true)">{{ t('app.budget.payment.raise') }}</UiButton>
        <UiButton type="submit" form="budget-payment-form" :loading="saving" data-testid="pay-anyway">{{ t('app.budget.payment.anyway') }}</UiButton>
      </template>
      <UiButton v-else type="submit" form="budget-payment-form" :loading="saving">{{ t('app.budget.payment.save') }}</UiButton>
    </template>
  </UiModal>
</template>
