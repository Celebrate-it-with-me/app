<script setup>
import { useI18n } from 'vue-i18n'
import { UserPlus, Users, X } from 'lucide-vue-next'
import { UiAvatar, UiBadge, UiButton, UiEmptyState } from '@/ui'
import { assignedCount, isTableFull, rsvpTone } from '@/modules/seating/utils/seating'

defineProps({
  table: { type: Object, default: null },
  /** Show the "seat guests" shortcut (used on phones, where the lists are tabs). */
  showAssign: { type: Boolean, default: false }
})
const emit = defineEmits(['remove-guest', 'assign'])
const { t } = useI18n()
</script>

<template>
  <UiEmptyState
    v-if="!table"
    compact
    :title="t('app.seating.details.noneTitle')"
    :description="t('app.seating.details.noneText')"
  >
    <template #icon><Users class="h-6 w-6" aria-hidden="true" /></template>
  </UiEmptyState>

  <div v-else>
    <div class="flex items-center justify-between gap-3">
      <p class="text-sm text-ink-500">
        {{ t('app.seating.details.seated', { taken: assignedCount(table), capacity: table.capacity }) }}
      </p>
      <UiBadge v-if="isTableFull(table)" size="sm" tone="success">{{ t('app.seating.tables.full') }}</UiBadge>
    </div>

    <UiEmptyState
      v-if="!table.assigned_guests?.length"
      compact
      class="mt-3"
      :title="t('app.seating.details.emptyTitle')"
      :description="t('app.seating.details.emptyText')"
    >
      <template #icon><Users class="h-6 w-6" aria-hidden="true" /></template>
    </UiEmptyState>

    <ul v-else class="mt-3 divide-y divide-line rounded-lg border border-line">
      <li v-for="guest in table.assigned_guests" :key="guest.id" class="flex items-center gap-3 p-3">
        <UiAvatar :name="guest.name" size="sm" />
        <div class="min-w-0 flex-1">
          <p class="truncate text-base font-medium text-ink-900">{{ guest.name }}</p>
          <div class="mt-1 flex flex-wrap items-center gap-2">
            <UiBadge size="sm" :tone="rsvpTone(guest.rsvpStatus)">{{ t(`app.seating.rsvp.${guest.rsvpStatus || 'pending'}`) }}</UiBadge>
          </div>
        </div>
        <UiButton
          variant="ghost"
          size="sm"
          icon
          :aria-label="t('app.seating.details.remove', { name: guest.name })"
          @click="emit('remove-guest', guest)"
        >
          <X class="h-4 w-4" aria-hidden="true" />
        </UiButton>
      </li>
    </ul>

    <UiButton v-if="showAssign && !isTableFull(table)" class="mt-4" block variant="secondary" @click="emit('assign')">
      <UserPlus class="h-4 w-4" aria-hidden="true" />
      {{ t('app.seating.details.assignGuests') }}
    </UiButton>
  </div>
</template>
