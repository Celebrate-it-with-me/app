<script setup>
import { useI18n } from 'vue-i18n'
import { LayoutGrid, MapPin, Pencil, Plus, Trash2 } from 'lucide-vue-next'
import { UiBadge, UiButton, UiEmptyState, UiSkeleton } from '@/ui'
import { assignedCount, isTableFull, occupancyPercent, occupancyTone } from '@/modules/seating/utils/seating'

defineProps({
  tables: { type: Array, default: () => [] },
  selectedId: { type: [Number, String], default: null },
  loading: { type: Boolean, default: false }
})
const emit = defineEmits(['select', 'edit', 'delete', 'create'])
const { t } = useI18n()

const barClass = table => {
  const tone = occupancyTone(table)
  return tone === 'success' ? 'bg-success-600' : tone === 'warning' ? 'bg-gold-500' : 'bg-rose-600'
}
</script>

<template>
  <div v-if="loading" class="space-y-3" aria-busy="true">
    <UiSkeleton v-for="n in 3" :key="n" height="6rem" />
  </div>

  <UiEmptyState
    v-else-if="tables.length === 0"
    :title="t('app.seating.tables.emptyTitle')"
    :description="t('app.seating.tables.emptyText')"
  >
    <template #icon><LayoutGrid class="h-6 w-6" aria-hidden="true" /></template>
    <UiButton @click="emit('create')">
      <Plus class="h-4 w-4" aria-hidden="true" />
      {{ t('app.seating.newTable') }}
    </UiButton>
  </UiEmptyState>

  <ul v-else class="space-y-3">
    <li
      v-for="table in tables"
      :key="table.id"
      class="rounded-xl border bg-white transition-colors"
      :class="selectedId === table.id ? 'border-rose-600 ring-1 ring-rose-600' : 'border-line'"
    >
      <div class="flex items-start gap-1 p-2 pl-0">
        <button
          type="button"
          class="min-h-11 min-w-0 flex-1 rounded-lg px-4 py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
          :aria-pressed="selectedId === table.id"
          @click="emit('select', table)"
        >
          <span class="flex flex-wrap items-center gap-2">
            <span class="truncate text-base font-medium text-ink-900">{{ table.name }}</span>
            <UiBadge size="sm" :tone="table.type === 'vip' ? 'gold' : 'neutral'">
              {{ t(`app.seating.type.${table.type || 'general'}`) }}
            </UiBadge>
            <UiBadge v-if="isTableFull(table)" size="sm" tone="success">{{ t('app.seating.tables.full') }}</UiBadge>
          </span>
          <span v-if="table.location || table.reserved_for" class="mt-1 flex items-center gap-1 text-sm text-ink-500">
            <MapPin v-if="table.location" class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span class="truncate">
              {{ [table.location ? t(`app.seating.location.${table.location}`) : '', table.reserved_for].filter(Boolean).join(' · ') }}
            </span>
          </span>
          <span class="mt-3 flex items-center gap-3">
            <span
              class="h-2 flex-1 overflow-hidden rounded-full bg-cream-200"
              role="progressbar"
              :aria-valuenow="occupancyPercent(table)"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-label="t('app.seating.tables.occupancy')"
            >
              <span class="block h-full rounded-full" :class="barClass(table)" :style="{ width: occupancyPercent(table) + '%' }"></span>
            </span>
            <span class="text-sm font-medium text-ink-700 tabular-nums">
              {{ assignedCount(table) }}/{{ table.capacity }}
            </span>
          </span>
        </button>
        <div class="flex shrink-0">
          <UiButton variant="ghost" size="sm" icon :aria-label="t('app.seating.tables.edit', { name: table.name })" @click="emit('edit', table)">
            <Pencil class="h-4 w-4" aria-hidden="true" />
          </UiButton>
          <UiButton variant="ghost" size="sm" icon :aria-label="t('app.seating.tables.delete', { name: table.name })" @click="emit('delete', table)">
            <Trash2 class="h-4 w-4 text-danger-700" aria-hidden="true" />
          </UiButton>
        </div>
      </div>
    </li>
  </ul>
</template>
