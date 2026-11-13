<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Search, UserCheck } from 'lucide-vue-next'
import { UiAvatar, UiBadge, UiButton, UiEmptyState, UiInput, UiSelect } from '@/ui'
import { RSVP_FILTERS, isTableFull, rsvpTone } from '@/modules/seating/utils/seating'

const props = defineProps({
  guests: { type: Array, default: () => [] },
  total: { type: Number, default: 0 },
  search: { type: String, default: '' },
  status: { type: String, default: 'all' },
  table: { type: Object, default: null },
  busy: { type: Boolean, default: false }
})
const emit = defineEmits(['update:search', 'update:status', 'assign', 'go-tables'])
const { t } = useI18n()

const statusOptions = computed(() =>
  RSVP_FILTERS.map(value => ({ value, label: t(`app.seating.rsvp.${value}`) }))
)
const canAssign = computed(() => !!props.table && !isTableFull(props.table))
</script>

<template>
  <div>
    <div class="rounded-lg bg-cream-100 p-3 text-sm text-ink-700">
      <template v-if="table">
        {{ t('app.seating.unassigned.seatingAt', { name: table.name }) }}
        <span v-if="isTableFull(table)" class="font-medium text-ink-900"> · {{ t('app.seating.tables.full') }}</span>
      </template>
      <template v-else>
        {{ t('app.seating.unassigned.pickTable') }}
        <button type="button" class="ml-1 min-h-11 font-medium text-rose-700 underline lg:hidden" @click="emit('go-tables')">
          {{ t('app.seating.unassigned.goTables') }}
        </button>
      </template>
    </div>

    <UiInput
      class="mt-3"
      type="search"
      :model-value="search"
      :aria-label="t('app.seating.unassigned.searchLabel')"
      :placeholder="t('app.seating.unassigned.search')"
      @update:model-value="val => emit('update:search', val)"
    >
      <template #leading><Search class="h-4 w-4" aria-hidden="true" /></template>
    </UiInput>

    <UiSelect
      class="mt-3"
      :model-value="status"
      :options="statusOptions"
      :aria-label="t('app.seating.unassigned.statusLabel')"
      @update:model-value="val => emit('update:status', val)"
    />

    <UiEmptyState
      v-if="guests.length === 0"
      class="mt-4"
      compact
      :title="t('app.seating.unassigned.emptyTitle')"
      :description="total === 0 ? t('app.seating.unassigned.emptyAll') : t('app.seating.unassigned.emptyFiltered')"
    >
      <template #icon><UserCheck class="h-6 w-6" aria-hidden="true" /></template>
    </UiEmptyState>

    <ul v-else class="mt-4 divide-y divide-line rounded-lg border border-line">
      <li v-for="guest in guests" :key="guest.id" class="flex items-center gap-3 p-3">
        <UiAvatar :name="guest.name" size="sm" />
        <div class="min-w-0 flex-1">
          <p class="truncate text-base font-medium text-ink-900">{{ guest.name }}</p>
          <UiBadge class="mt-1" size="sm" :tone="rsvpTone(guest.rsvpStatus)">
            {{ t(`app.seating.rsvp.${guest.rsvpStatus || 'pending'}`) }}
          </UiBadge>
        </div>
        <UiButton size="sm" variant="secondary" :disabled="!canAssign || busy" @click="emit('assign', guest)">
          {{ t('app.seating.unassigned.assign') }}
        </UiButton>
      </li>
    </ul>
  </div>
</template>
