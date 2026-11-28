<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { CornerDownRight, MoreHorizontal } from 'lucide-vue-next'
import { UiAvatar, UiBadge, UiDropdown } from '@/ui'
import { GUEST_GRID, STATUS_TONE, peopleIn } from '../utils/roster'
import { dropdownItems } from '../utils/guestMenu'
import GuestLocaleChip from './GuestLocaleChip.vue'
import GuestDeliveryChip from './GuestDeliveryChip.vue'
import GuestDeliveryNote from './GuestDeliveryNote.vue'

/** One guest in the desktop table: the main row, then one row per companion, all on the same grid as the header. */
const props = defineProps({
  family: { type: Object, required: true },
  canEdit: { type: Boolean, default: false },
  eventLocale: { type: String, default: 'es' },
  delivery: { type: Object, default: null }
})
const emit = defineEmits(['edit', 'confirm', 'revert', 'remove', 'send', 'copy', 'locale', 'retry'])
const { t } = useI18n()

const contact = computed(() => props.family.phone || props.family.email || '')
const items = computed(() =>
  dropdownItems(props.family, { canEdit: props.canEdit, t, eventLocale: props.eventLocale, act: (key, family) => emit(key, family), onLocale: (family, next) => emit('locale', family, next) })
)
const open = () => props.canEdit && emit('edit', props.family)
</script>

<template>
  <div
    role="rowgroup"
    class="border-t border-black/[.06] transition-colors duration-[120ms] first:border-t-0 hover:bg-[rgba(155,58,85,.035)]"
    :class="canEdit && 'cursor-pointer'"
    data-testid="guest-row"
    @click="open"
  >
    <div
      role="row"
      :class="[GUEST_GRID, 'min-h-[60px] py-2.5 outline-none focus-visible:bg-[rgba(155,58,85,.06)]']"
      :tabindex="canEdit ? 0 : undefined"
      @keydown.enter.self="open"
    >
      <div role="cell" class="flex min-w-0 items-center gap-3">
        <UiAvatar :name="family.name" class="h-[34px] w-[34px] text-xs" />
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="truncate font-heading text-[15px] leading-tight text-ink-900" :title="family.name" data-testid="guest-name">{{ family.name }}</span>
            <GuestLocaleChip :family="family" />
          </div>
          <p v-if="contact" class="mt-0.5 truncate text-xs text-ink-500">{{ contact }}</p>
          <p v-if="family.notes" class="truncate text-xs italic text-ink-500" :title="family.notes">{{ family.notes }}</p>
          <p v-if="family.rsvpNote" class="truncate text-xs text-ink-500" :title="family.rsvpNote">“{{ family.rsvpNote }}”</p>
          <GuestDeliveryNote :family="family" :delivery="delivery" :can-edit="canEdit" @edit="emit('edit', $event)" @retry="emit('retry', $event)" />
        </div>
      </div>
      <div role="cell" class="flex items-center">
        <UiBadge :tone="STATUS_TONE[family.status]" size="sm" dot>{{ t(`app.roster.status.${family.status}`) }}</UiBadge>
      </div>
      <div role="cell" class="flex items-center"><GuestDeliveryChip :delivery="delivery" /></div>
      <div role="cell" class="text-right text-sm tabular-nums text-ink-700">{{ peopleIn(family) }}</div>
      <div role="cell" class="flex justify-center">
        <UiDropdown :items="items">
          <template #trigger>
            <button
              type="button"
              class="touch-target relative flex h-[34px] w-[34px] items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-rose-600"
              :aria-label="t('app.roster.menu.label', { name: family.name })"
              @click.stop
            >
              <MoreHorizontal class="h-5 w-5" aria-hidden="true" />
            </button>
          </template>
        </UiDropdown>
      </div>
    </div>
    <div v-for="companion in family.companions" :key="companion.id" role="row" :class="[GUEST_GRID, 'min-h-[30px] -mt-1 pb-2']" data-testid="companion-row">
      <div role="cell" class="flex min-w-0 items-center gap-1.5 pl-[46px] text-sm text-ink-700">
        <CornerDownRight class="h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden="true" />
        <span class="truncate" :title="companion.name" data-testid="companion-name">{{ companion.name }}</span>
      </div>
      <div role="cell" class="flex items-center">
        <UiBadge :tone="STATUS_TONE[companion.status]" size="sm" dot>{{ t(`app.roster.status.${companion.status}`) }}</UiBadge>
      </div>
      <div role="cell" /><div role="cell" /><div role="cell" />
    </div>
  </div>
</template>
