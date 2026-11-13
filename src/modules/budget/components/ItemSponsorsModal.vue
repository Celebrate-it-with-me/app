<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiModal, UiInput, UiButton } from '@/ui'

const props = defineProps({
  open: { type: Boolean, default: false },
  item: { type: Object, default: null },
  /** The event's padrinos as the padrinos API sends them, each with its commitments. */
  padrinos: { type: Array, default: () => [] },
  saving: { type: Boolean, default: false }
})
const emit = defineEmits(['update:open', 'save'])
const { t } = useI18n()

const rows = ref([])
const invalid = ref(false)

watch(
  () => props.open,
  open => {
    if (!open || !props.item) return
    rows.value = props.padrinos.map(padrino => {
      const current = padrino.commitments.find(c => c.budgetItemId === props.item.id)
      return { padrino, checked: !!current, amount: current ? String(current.amount) : '' }
    })
    invalid.value = false
  }
)

function toggle(row) {
  // Checking a row suggests what is still left to cover; the organizer adjusts it.
  if (row.checked && !row.amount) row.amount = String(props.item.remaining || props.item.owed || '')
}

function submit() {
  invalid.value = rows.value.some(r => r.checked && !(Number(r.amount) > 0))
  if (invalid.value) return
  // Only padrinos whose pledge for this item changed are sent, each with their full set of commitments.
  const changes = rows.value.flatMap(({ padrino, checked, amount }) => {
    const before = padrino.commitments.find(c => c.budgetItemId === props.item.id)
    const same = before ? checked && Number(amount) === before.amount : !checked
    if (same) return []
    const others = padrino.commitments.filter(c => c.budgetItemId !== props.item.id).map(c => ({ budgetItemId: c.budgetItemId, amount: c.amount }))
    return [{ padrinoId: padrino.id, commitments: checked ? [...others, { budgetItemId: props.item.id, amount: Number(amount) }] : others }]
  })
  emit('save', changes)
}
</script>

<template>
  <UiModal
    :open="open"
    :title="t('app.budget.sponsors.title', { name: item?.title ?? '' })"
    :description="t('app.budget.sponsors.text')"
    size="md"
    @update:open="emit('update:open', $event)"
  >
    <p v-if="!padrinos.length" class="text-ink-700">{{ t('app.budget.sponsors.empty') }}</p>
    <form v-else id="sponsors-form" novalidate @submit.prevent="submit">
      <ul class="divide-y divide-line rounded-xl border border-line">
        <li v-for="row in rows" :key="row.padrino.id" class="flex items-center gap-3 px-3 py-2">
          <label class="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
            <input v-model="row.checked" type="checkbox" class="h-5 w-5 shrink-0 rounded border-line-strong accent-rose-600" @change="toggle(row)" />
            <span class="min-w-0">
              <span class="block truncate text-ink-900">{{ row.padrino.name }}</span>
              <span v-if="row.padrino.relationship" class="block truncate text-xs text-ink-500">{{ row.padrino.relationship }}</span>
            </span>
          </label>
          <UiInput
            v-if="row.checked"
            v-model="row.amount"
            type="number"
            inputmode="decimal"
            min="0"
            step="0.01"
            :aria-label="t('app.budget.sponsors.amount', { name: row.padrino.name })"
            :invalid="invalid && !(Number(row.amount) > 0)"
            class="w-28 shrink-0"
          />
        </li>
      </ul>
      <p v-if="invalid" class="mt-2 text-sm text-danger-700" role="alert">{{ t('app.budget.sponsors.invalid') }}</p>
    </form>
    <template #footer>
      <UiButton variant="ghost" @click="emit('update:open', false)">{{ t('app.budget.cancel') }}</UiButton>
      <UiButton v-if="padrinos.length" type="submit" form="sponsors-form" :loading="saving">{{ t('app.budget.save') }}</UiButton>
    </template>
  </UiModal>
</template>
