<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMinWidth } from '@/composables/useMinWidth'
import { GUEST_GRID } from '../utils/roster'
import GuestRow from './GuestRow.vue'
import GuestItem from './GuestItem.vue'
import GuestActionSheet from './GuestActionSheet.vue'

/**
 * The guests of the page. From lg (1024px) a table (one row per guest, the companions beneath); below it a compact list
 * with the actions in a bottom sheet. Both take the same array and raise the same events.
 */
defineProps({
  families: { type: Array, required: true },
  canEdit: { type: Boolean, default: false },
  eventLocale: { type: String, default: 'es' },
  loading: { type: Boolean, default: false },
  /** (family) => `{ key, tone, icon, message }` from deliveryOf, or null. */
  deliveryOf: { type: Function, default: () => null }
})
const emit = defineEmits(['edit', 'confirm', 'revert', 'remove', 'send', 'copy', 'locale', 'retry'])
const { t } = useI18n()

const table = useMinWidth(1024)

const sheetOpen = ref(false)
const sheetFamily = ref(null)
function openSheet(family) {
  sheetFamily.value = family
  sheetOpen.value = true
}
const act = (key, family) => emit(key, family)
</script>

<template>
  <div
    v-if="table"
    role="table"
    :aria-label="t('app.roster.title')"
    :aria-busy="loading"
    class="mt-5 overflow-hidden rounded-xl border border-line bg-white shadow-card transition-opacity duration-150"
    :class="loading && 'opacity-50'"
    data-testid="guest-table"
  >
    <div role="row" :class="[GUEST_GRID, 'border-b border-black/[.07] py-2.5 text-[11px] font-semibold uppercase tracking-[.06em] text-ink-500']">
      <div role="columnheader">{{ t('app.roster.columns.guest') }}</div>
      <div role="columnheader">{{ t('app.roster.columns.attendance') }}</div>
      <div role="columnheader">{{ t('app.roster.columns.delivery') }}</div>
      <div role="columnheader" class="text-right">{{ t('app.roster.columns.people') }}</div>
      <div role="columnheader"><span class="sr-only">{{ t('app.roster.columns.actions') }}</span></div>
    </div>
    <GuestRow
      v-for="family in families"
      :key="family.id"
      :family="family"
      :can-edit="canEdit"
      :event-locale="eventLocale"
      :delivery="deliveryOf(family)"
      @edit="emit('edit', $event)"
      @confirm="emit('confirm', $event)"
      @revert="emit('revert', $event)"
      @remove="emit('remove', $event)"
      @send="emit('send', $event)"
      @copy="emit('copy', $event)"
      @locale="(family, next) => emit('locale', family, next)"
      @retry="emit('retry', $event)"
    />
  </div>
  <template v-else>
    <ul
      class="mt-4 overflow-hidden rounded-xl border border-line bg-white shadow-card transition-opacity duration-150"
      :class="loading && 'opacity-50'"
      :aria-busy="loading"
      data-testid="guest-list"
    >
      <li v-for="family in families" :key="family.id" class="border-t border-black/[.06] first:border-t-0">
        <GuestItem :family="family" :can-edit="canEdit" :delivery="deliveryOf(family)" @menu="openSheet" @edit="emit('edit', $event)" @retry="emit('retry', $event)" />
      </li>
    </ul>
    <GuestActionSheet v-model:open="sheetOpen" :family="sheetFamily" :can-edit="canEdit" :event-locale="eventLocale" @act="act" @locale="(family, next) => emit('locale', family, next)" />
  </template>
</template>
