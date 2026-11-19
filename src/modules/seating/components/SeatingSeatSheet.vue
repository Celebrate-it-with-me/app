<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { TriangleAlert } from 'lucide-vue-next'
import { UiBadge, UiEmptyState, UiModal } from '@/ui'
import { namesPreview, tablesForSheet } from '@/modules/seating/utils/seating'

const props = defineProps({
  /** Guests to seat (one, a selection or a family) or the one being moved. */
  guests: { type: Array, default: () => [] },
  tables: { type: Array, default: () => [] },
  /** Table the guest is leaving (moving); it is left out of the list. */
  fromTable: { type: Object, default: null },
  /** Table highlighted first (the one open in the detail panel). */
  preferredId: { type: [Number, String], default: null },
  saving: { type: Boolean, default: false }
})
const emit = defineEmits(['close', 'pick'])
const { t } = useI18n()

const need = computed(() => props.guests.length)
const rows = computed(() =>
  tablesForSheet(props.tables, { need: need.value, preferredId: props.preferredId, excludeId: props.fromTable?.id ?? null })
)
const declined = computed(() => props.guests.filter(g => g.rsvpStatus === 'not-attending'))
const names = computed(() => namesPreview(props.guests.map(g => g.name), 3, n => t('app.seating.sheet.more', { n })))

const title = computed(() => {
  if (props.fromTable) return t('app.seating.sheet.moveTitle', { name: props.guests[0]?.name ?? '' })
  if (need.value > 1) return t('app.seating.sheet.manyTitle', { count: need.value }, need.value)
  return t('app.seating.sheet.oneTitle', { name: props.guests[0]?.name ?? '' })
})
const description = computed(() => {
  if (props.fromTable) return t('app.seating.sheet.moveText', { table: props.fromTable.name })
  return need.value > 1 ? names.value : t('app.seating.sheet.oneText')
})
</script>

<template>
  <UiModal :open="guests.length > 0" :title="title" :description="description" size="md" @update:open="val => !val && emit('close')">
    <p
      v-if="declined.length"
      class="mb-3 flex items-start gap-2 rounded-lg bg-warning-50 p-3 text-sm text-warning-700"
      role="status"
    >
      <TriangleAlert class="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{{ t('app.seating.sheet.declinedWarning', { names: namesPreview(declined.map(g => g.name), 2, n => t('app.seating.sheet.more', { n })) }, declined.length) }}</span>
    </p>

    <UiEmptyState
      v-if="rows.length === 0"
      compact
      :title="t('app.seating.sheet.noTablesTitle')"
      :description="t('app.seating.sheet.noTablesText')"
    />

    <ul v-else class="space-y-2" :aria-label="t('app.seating.sheet.listLabel')">
      <li v-for="{ table, left, fits } in rows" :key="table.id">
        <button
          type="button"
          class="flex min-h-14 w-full items-center gap-3 rounded-xl border border-line bg-white px-4 py-2 text-left outline-none transition-colors hover:bg-cream-100 focus-visible:ring-2 focus-visible:ring-rose-600 disabled:cursor-not-allowed disabled:bg-cream-100 disabled:text-ink-400"
          :class="table.id === preferredId && fits ? 'border-rose-600 ring-1 ring-rose-600' : ''"
          :disabled="!fits || saving"
          @click="emit('pick', table)"
        >
          <span class="min-w-0 flex-1">
            <span class="block break-words text-base font-medium text-ink-900" :class="!fits && 'text-ink-500'">{{ table.name }}</span>
            <span class="block text-sm text-ink-500">
              <template v-if="left === 0">{{ t('app.seating.tables.full') }}</template>
              <template v-else-if="!fits">{{ t('app.seating.sheet.noRoom', { left, need }, left) }}</template>
              <template v-else>{{ t('app.seating.sheet.free', { count: left }, left) }}</template>
            </span>
          </span>
          <UiBadge v-if="table.id === preferredId && fits" size="sm" tone="rose">{{ t('app.seating.sheet.open') }}</UiBadge>
        </button>
      </li>
    </ul>
  </UiModal>
</template>
