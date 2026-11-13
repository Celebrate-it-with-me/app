<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiModal, UiInput, UiButton } from '@/ui'
import { commitmentRows, commitmentsPayload, commitmentsValid } from '../utils/padrinos'
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
        <li v-for="row in rows" :key="row.budgetItemId" class="flex items-center gap-3 px-3 py-2">
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
