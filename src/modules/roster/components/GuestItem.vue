<script setup>
import { useI18n } from 'vue-i18n'
import { CornerDownRight, MoreHorizontal } from 'lucide-vue-next'
import { UiAvatar, UiBadge } from '@/ui'
import { STATUS_TONE, peopleIn } from '../utils/roster'
import GuestLocaleChip from './GuestLocaleChip.vue'
import GuestDeliveryChip from './GuestDeliveryChip.vue'
import GuestDeliveryNote from './GuestDeliveryNote.vue'

/** One guest in the compact list (phones and tablets): name, state chips and "n personas"; the phone lives in the edit form. */
defineProps({
  family: { type: Object, required: true },
  canEdit: { type: Boolean, default: false },
  delivery: { type: Object, default: null }
})
const emit = defineEmits(['menu', 'edit', 'retry'])
const { t } = useI18n()
</script>

<template>
  <div class="px-3.5 py-3" data-testid="guest-item">
    <div class="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-2.5">
      <UiAvatar :name="family.name" />
      <div class="min-w-0">
        <div class="flex items-center gap-1.5">
          <span class="truncate font-heading text-[15px] text-ink-900 max-[360px]:text-sm" :title="family.name" data-testid="guest-name">{{ family.name }}</span>
          <GuestLocaleChip :family="family" />
        </div>
        <div class="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1">
          <UiBadge :tone="STATUS_TONE[family.status]" size="sm" dot>{{ t(`app.roster.status.${family.status}`) }}</UiBadge>
          <GuestDeliveryChip :delivery="delivery" />
        </div>
        <GuestDeliveryNote :family="family" :delivery="delivery" :can-edit="canEdit" @edit="emit('edit', $event)" @retry="emit('retry', $event)" />
        <p class="mt-1 text-xs text-ink-500">
          {{ t('app.roster.people', { n: peopleIn(family) }, peopleIn(family)) }}<template v-if="family.notes"> · <i>{{ family.notes }}</i></template>
        </p>
        <p v-if="family.rsvpNote" class="mt-1 line-clamp-2 text-xs text-ink-500">“{{ family.rsvpNote }}”</p>
      </div>
      <button
        type="button"
        class="touch-target relative -mr-2 -mt-1.5 flex h-9 w-9 items-center justify-center rounded-full text-ink-500 transition-colors active:bg-black/5 focus-visible:outline-2 focus-visible:outline-rose-600"
        :aria-label="t('app.roster.menu.label', { name: family.name })"
        aria-haspopup="dialog"
        @click="emit('menu', family, $event.currentTarget)"
      >
        <MoreHorizontal class="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
    <div v-for="companion in family.companions" :key="companion.id" class="mt-2 flex items-center justify-between gap-2 pl-[50px]" data-testid="companion-row">
      <span class="flex min-w-0 items-center gap-1.5 text-[13px] text-ink-700">
        <CornerDownRight class="h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden="true" />
        <span class="truncate" :title="companion.name" data-testid="companion-name">{{ companion.name }}</span>
      </span>
      <UiBadge :tone="STATUS_TONE[companion.status]" size="sm" dot class="shrink-0">{{ t(`app.roster.status.${companion.status}`) }}</UiBadge>
    </div>
  </div>
</template>
