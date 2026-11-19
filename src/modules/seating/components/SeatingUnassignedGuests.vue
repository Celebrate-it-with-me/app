<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Search, UserCheck, Users } from 'lucide-vue-next'
import { UiAvatar, UiBadge, UiButton, UiCheckbox, UiEmptyState, UiInput } from '@/ui'
import { RSVP_FILTERS, rsvpTone } from '@/modules/seating/utils/seating'

const props = defineProps({
  /** The rows to show (already filtered and paged). */
  guests: { type: Array, default: () => [] },
  total: { type: Number, default: 0 },
  hiddenCount: { type: Number, default: 0 },
  counts: { type: Object, default: () => ({ all: 0, attending: 0, pending: 0, 'not-attending': 0 }) },
  search: { type: String, default: '' },
  status: { type: String, default: 'all' },
  selectedIds: { type: Array, default: () => [] },
  allSelected: { type: Boolean, default: false },
  hasTables: { type: Boolean, default: true },
  /** (guest) => name of the guest they come with, or ''. */
  companionName: { type: Function, default: () => '' },
  /** (guest) => number of unseated people in their group (1 when alone). */
  groupSize: { type: Function, default: () => 1 },
  busy: { type: Boolean, default: false }
})
const emit = defineEmits([
  'update:search',
  'update:status',
  'seat',
  'toggle',
  'toggle-group',
  'toggle-all',
  'seat-selected',
  'clear-selection',
  'show-more'
])
const { t } = useI18n()

const filters = computed(() =>
  RSVP_FILTERS.map(value => ({ value, label: t(`app.seating.rsvp.${value}`), count: props.counts[value] ?? 0 }))
)
const selectedCount = computed(() => props.selectedIds.length)
const isSelected = guest => props.selectedIds.includes(guest.id)
</script>

<template>
  <div>
    <p class="text-sm text-ink-500">{{ t('app.seating.unassigned.help') }}</p>

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

    <div class="mt-3 flex flex-wrap gap-2" role="group" :aria-label="t('app.seating.unassigned.statusLabel')">
      <button
        v-for="f in filters"
        :key="f.value"
        type="button"
        class="min-h-9 rounded-full border px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-rose-600"
        :class="status === f.value ? 'border-rose-600 bg-rose-50 font-medium text-rose-800' : 'border-line bg-white text-ink-700 hover:bg-cream-100'"
        :aria-pressed="status === f.value"
        @click="emit('update:status', f.value)"
      >
        {{ f.label }} <span class="tabular-nums text-ink-500">{{ f.count }}</span>
      </button>
    </div>
    <p v-if="counts['not-attending'] > 0" class="mt-2 text-xs text-ink-500">{{ t('app.seating.unassigned.declinedNote') }}</p>

    <div
      v-if="selectedCount > 0"
      class="sticky top-16 z-10 mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-2 pl-3 shadow-soft lg:top-0"
      role="region"
      :aria-label="t('app.seating.unassigned.selectionLabel')"
    >
      <span class="mr-auto text-sm font-medium text-rose-800">{{ t('app.seating.unassigned.selected', { count: selectedCount }, selectedCount) }}</span>
      <UiButton size="sm" variant="ghost" @click="emit('clear-selection')">{{ t('app.seating.unassigned.clear') }}</UiButton>
      <UiButton size="sm" :disabled="busy || !hasTables" @click="emit('seat-selected')">{{ t('app.seating.unassigned.seatSelected') }}</UiButton>
    </div>

    <UiEmptyState
      v-if="guests.length === 0"
      class="mt-4"
      compact
      :title="t('app.seating.unassigned.emptyTitle')"
      :description="total === 0 ? t('app.seating.unassigned.emptyAll') : t('app.seating.unassigned.emptyFiltered')"
    >
      <template #icon><UserCheck class="h-6 w-6" aria-hidden="true" /></template>
    </UiEmptyState>

    <template v-else>
      <div class="mt-3 px-1">
        <UiCheckbox :model-value="allSelected" :label="t('app.seating.unassigned.selectAll')" @update:model-value="emit('toggle-all')" />
      </div>
      <ul class="mt-2 divide-y divide-line rounded-lg border border-line bg-white">
        <li v-for="guest in guests" :key="guest.id" class="flex items-center gap-2 p-3" :class="isSelected(guest) && 'bg-rose-50/60'">
          <UiCheckbox :model-value="isSelected(guest)" @update:model-value="emit('toggle', guest)">
            <span class="sr-only">{{ t('app.seating.unassigned.pick', { name: guest.name }) }}</span>
          </UiCheckbox>
          <button
            type="button"
            class="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
            :disabled="busy || !hasTables"
            @click="emit('seat', guest)"
          >
            <UiAvatar :name="guest.name" size="sm" />
            <span class="min-w-0 flex-1">
              <span class="block break-words text-base font-medium text-ink-900">{{ guest.name }}</span>
              <span class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                <UiBadge size="sm" :tone="rsvpTone(guest.rsvpStatus)">{{ t(`app.seating.rsvp.${guest.rsvpStatus || 'pending'}`) }}</UiBadge>
                <span v-if="companionName(guest)" class="text-xs text-ink-500">
                  {{ t('app.seating.guest.companionOf', { name: companionName(guest) }) }}
                </span>
              </span>
            </span>
          </button>
          <UiButton
            v-if="groupSize(guest) > 1"
            size="sm"
            variant="ghost"
            icon
            :aria-label="t('app.seating.unassigned.pickGroup', { count: groupSize(guest) }, groupSize(guest))"
            :title="t('app.seating.unassigned.pickGroup', { count: groupSize(guest) }, groupSize(guest))"
            @click="emit('toggle-group', guest)"
          >
            <Users class="h-4 w-4" aria-hidden="true" />
          </UiButton>
          <UiButton size="sm" variant="secondary" :disabled="busy || !hasTables" @click="emit('seat', guest)">
            {{ t('app.seating.unassigned.assign') }}
          </UiButton>
        </li>
      </ul>
      <UiButton v-if="hiddenCount > 0" class="mt-3" block variant="ghost" @click="emit('show-more')">
        {{ t('app.seating.unassigned.showMore', { count: hiddenCount }, hiddenCount) }}
      </UiButton>
    </template>
  </div>
</template>
