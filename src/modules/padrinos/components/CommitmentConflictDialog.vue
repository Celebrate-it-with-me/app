<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiModal, UiButton, UiRadioGroup } from '@/ui'
import { formatMoney } from '@/modules/budget/utils/budget'
import { RESOLUTIONS, additionalAllowed, additionalIncrease, formatPaidOn, unattributedTotal } from '../utils/padrinos'

const props = defineProps({
  open: { type: Boolean, default: false },
  padrinoName: { type: String, default: '' },
  /** `conflicts` of the 409 `commitment_item_paid`. */
  conflicts: { type: Array, default: () => [] },
  /** What the organizer is trying to save, and what the padrino already had. */
  commitments: { type: Array, default: () => [] },
  previous: { type: Array, default: () => [] },
  /** `{ budgetItemId, remaining }` of a 422 `commitment_exceeds_remaining` on the last retry. */
  exceeded: { type: Object, default: null },
  currency: { type: String, default: 'USD' },
  busy: { type: Boolean, default: false }
})
const emit = defineEmits(['confirm', 'cancel'])
const { t, locale } = useI18n()

const choices = ref({})
const money = value => formatMoney(value, props.currency, locale.value)

watch(
  () => props.conflicts,
  () => {
    choices.value = {}
  }
)
// The API refused the "additional" choice of that item: ask again there.
watch(
  () => props.exceeded,
  exceeded => {
    if (exceeded) delete choices.value[exceeded.budgetItemId]
  }
)

const sections = computed(() =>
  props.conflicts.map(conflict => {
    const allowed = additionalAllowed(conflict, props.commitments, props.previous)
    const wanted = additionalIncrease(conflict, props.commitments, props.previous)
    const remaining = Number(conflict.remaining) || 0
    const additionalHelp =
      remaining <= 0
        ? t('app.padrinos.conflict.additionalNone')
        : allowed
          ? t('app.padrinos.conflict.additionalHelp', { remaining: money(remaining) })
          : t('app.padrinos.conflict.additionalOver', { remaining: money(remaining), amount: money(wanted) })
    return {
      conflict,
      id: `conflict-${conflict.budgetItemId}`,
      family: unattributedTotal(conflict),
      error: props.exceeded?.budgetItemId === conflict.budgetItemId ? t('app.padrinos.conflict.exceeded', { remaining: money(props.exceeded.remaining) }) : '',
      options: [
        { value: RESOLUTIONS.attribute, label: t('app.padrinos.conflict.attribute'), description: t('app.padrinos.conflict.attributeHelp', { name: props.padrinoName }) },
        { value: RESOLUTIONS.additional, label: t('app.padrinos.conflict.additional'), description: additionalHelp, disabled: !allowed }
      ]
    }
  })
)

const complete = computed(() => props.conflicts.length > 0 && props.conflicts.every(c => choices.value[c.budgetItemId]))

function confirm() {
  if (complete.value && !props.busy) emit('confirm', { ...choices.value })
}
</script>

<template>
  <UiModal
    :open="open"
    :title="t('app.padrinos.conflict.title')"
    :description="t('app.padrinos.conflict.text', conflicts.length)"
    size="md"
    @update:open="value => !value && emit('cancel')"
  >
    <ul class="space-y-6">
      <li v-for="section in sections" :key="section.conflict.budgetItemId" :aria-labelledby="`${section.id}-title`" data-conflict>
        <h3 :id="`${section.id}-title`" class="font-heading text-lg text-ink-900">{{ section.conflict.itemName }}</h3>
        <p class="mt-0.5 text-sm text-ink-500">
          {{ t('app.padrinos.conflict.figures', { cost: money(section.conflict.cost), remaining: money(section.conflict.remaining) }) }}
        </p>
        <p class="mt-3 text-ink-900">{{ t('app.padrinos.conflict.question', { paid: money(section.family) }) }}</p>

        <ul class="mt-2 divide-y divide-line rounded-xl border border-line bg-cream-50 text-sm">
          <li v-for="payment in section.conflict.unattributedPayments" :key="payment.id" class="flex items-baseline gap-3 px-3 py-2">
            <span class="shrink-0 text-ink-500">{{ formatPaidOn(payment.paidOn, locale) }}</span>
            <span class="min-w-0 flex-1 truncate text-ink-700">{{ payment.note || t('app.padrinos.conflict.noNote') }}</span>
            <span class="shrink-0 font-medium tabular-nums text-ink-900">{{ money(payment.amount) }}</span>
          </li>
        </ul>

        <UiRadioGroup
          class="mt-3"
          cards
          :aria-labelledby="`${section.id}-title`"
          :model-value="choices[section.conflict.budgetItemId]"
          :options="section.options"
          @update:model-value="choices[section.conflict.budgetItemId] = $event"
        />
        <p v-if="section.error" class="mt-2 text-sm text-danger-700" role="alert">{{ section.error }}</p>
      </li>
    </ul>

    <template #footer>
      <UiButton variant="ghost" :disabled="busy" @click="emit('cancel')">{{ t('app.padrinos.cancel') }}</UiButton>
      <UiButton :disabled="!complete" :loading="busy" @click="confirm">{{ t('app.padrinos.conflict.confirm') }}</UiButton>
    </template>
  </UiModal>
</template>
