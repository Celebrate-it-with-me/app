<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiModal, UiInput, UiButton } from '@/ui'
import { commitmentRows, commitmentsPayload, commitmentsValid, paidSelfOf } from '../utils/padrinos'
import { AlertTriangle } from 'lucide-vue-next'
import { formatMoney } from '@/modules/budget/utils/budget'

const props = defineProps({
  open: { type: Boolean, default: false },
  padrino: { type: Object, default: null },
  items: { type: Array, default: () => [] },
  currency: { type: String, default: 'USD' },
  saving: { type: Boolean, default: false }
})
const emit = defineEmits(['update:open', 'save'])
const { t, locale } = useI18n()

const rows = ref([])
const invalid = ref(false)

watch(
  () => props.open,
  open => {
    if (!open) return
    rows.value = commitmentRows(props.items, props.padrino?.commitments ?? [])
    invalid.value = false
  }
)

const cents = value => Math.round((Number(value) || 0) * 100)

/** A checked row whose amount, added to what the family already paid, goes past the cost of the expense. */
function overOf(row) {
  if (!row.checked) return null
  const item = props.items.find(i => i.id === row.budgetItemId)
  const paid = paidSelfOf(item)
  const excess = cents(paid) + cents(row.amount) - cents(row.owed)
  if (!(cents(paid) > 0) || excess <= 0) return null
  return { paid, excess: excess / 100, reduceTo: Math.max(0, cents(row.owed) - cents(paid)) / 100 }
}
const overs = computed(() => Object.fromEntries(rows.value.map(r => [r.budgetItemId, overOf(r)])))
const money = value => formatMoney(value, props.currency, locale.value)
function reduce(row) {
  row.amount = String(overs.value[row.budgetItemId].reduceTo)
}

function toggle(row) {
  // Checking a row suggests the whole item; the organizer adjusts it.
  if (row.checked && !row.amount) row.amount = String(row.owed)
}

function submit() {
  invalid.value = !commitmentsValid(rows.value)
  if (!invalid.value) emit('save', commitmentsPayload(rows.value))
}
</script>

<template>
  <UiModal
    :open="open"
    :title="t('app.padrinos.commitments.title', { name: padrino?.name ?? '' })"
    :description="t('app.padrinos.commitments.text')"
    size="md"
    @update:open="emit('update:open', $event)"
  >
    <p v-if="!items.length" class="text-ink-700">{{ t('app.padrinos.commitments.empty') }}</p>
    <form v-else id="commitments-form" novalidate @submit.prevent="submit">
      <ul class="divide-y divide-line rounded-xl border border-line">
        <li v-for="row in rows" :key="row.budgetItemId" class="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2">
          <label class="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
            <input v-model="row.checked" type="checkbox" class="h-5 w-5 shrink-0 rounded border-line-strong accent-rose-600" @change="toggle(row)" />
            <span class="min-w-0">
              <span class="block truncate text-ink-900">{{ row.title }}</span>
              <span class="block text-xs text-ink-500">{{ t('app.padrinos.commitments.costs', { amount: formatMoney(row.owed, currency, locale) }) }}</span>
            </span>
          </label>
          <UiInput
            v-if="row.checked"
            v-model="row.amount"
            type="number"
            inputmode="decimal"
            min="0"
            step="0.01"
            :aria-label="t('app.padrinos.commitments.amount', { name: row.title })"
            :invalid="invalid && !(Number(row.amount) > 0)"
            class="w-28 shrink-0"
          />
          <div v-if="overs[row.budgetItemId]" class="basis-full rounded-[10px] bg-warning-50 px-2.5 py-2 text-xs leading-snug text-warning-700" role="status" data-over>
            <p class="flex gap-2">
              <AlertTriangle class="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{{ t('app.padrinos.commitments.over', { paid: money(overs[row.budgetItemId].paid), name: padrino?.name ?? '', excess: money(overs[row.budgetItemId].excess) }) }} {{ t('app.padrinos.commitments.keep') }}</span>
            </p>
            <button v-if="overs[row.budgetItemId].reduceTo > 0" type="button" class="relative touch-target mt-1.5 font-semibold underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600" data-reduce @click="reduce(row)">
              {{ t('app.padrinos.commitments.reduce', { amount: money(overs[row.budgetItemId].reduceTo) }) }}
            </button>
          </div>
        </li>
      </ul>
      <p v-if="invalid" class="mt-2 text-sm text-danger-700" role="alert">{{ t('app.padrinos.errors.amount') }}</p>
    </form>
    <template #footer>
      <UiButton variant="ghost" @click="emit('update:open', false)">{{ t('app.padrinos.cancel') }}</UiButton>
      <UiButton v-if="items.length" type="submit" form="commitments-form" :loading="saving">{{ t('app.padrinos.save') }}</UiButton>
    </template>
  </UiModal>
</template>
