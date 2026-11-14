<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { MoreHorizontal, Pencil, MessageCircle, Link as LinkIcon, CheckCheck, Undo2, Trash2 } from 'lucide-vue-next'
import { UiCard, UiBadge, UiAvatar, UiDropdown, UiButton, UiCheckbox } from '@/ui'
import { STATUS_TONE, peopleIn } from '../utils/roster'
import { MESSAGE_VIEW, isUnknownDelivery } from '../utils/whatsapp'
import GuestLocaleSelect from './GuestLocaleSelect.vue'

const props = defineProps({
  family: { type: Object, required: true },
  canEdit: { type: Boolean, default: false },
  eventLocale: { type: String, default: 'es' },
  /** `{ key, message }` from guestWhatsappState, or null when nothing is worth saying. */
  whatsapp: { type: Object, default: null },
  selectable: { type: Boolean, default: false },
  selected: { type: Boolean, default: false }
})
const emit = defineEmits(['edit', 'confirm', 'revert', 'remove', 'whatsapp', 'copy', 'locale', 'retry', 'select'])
const { t } = useI18n()

const answered = computed(() => props.family.status !== 'pending' || props.family.companions.some(c => c.status !== 'pending'))
const wa = computed(() => (props.whatsapp ? { ...MESSAGE_VIEW[props.whatsapp.key], ...props.whatsapp } : null))
const contact = computed(() => props.family.phone || props.family.email || '')

const items = computed(() => {
  const list = [
    { label: t('app.roster.menu.whatsapp'), icon: MessageCircle, onSelect: () => emit('whatsapp', props.family), disabled: !props.family.link },
    { label: t('app.roster.menu.copy'), icon: LinkIcon, onSelect: () => emit('copy', props.family), disabled: !props.family.link }
  ]
  if (props.canEdit) {
    list.push(
      { label: t('app.roster.menu.edit'), icon: Pencil, onSelect: () => emit('edit', props.family), separator: true },
      { label: t('app.roster.menu.confirm'), icon: CheckCheck, onSelect: () => emit('confirm', props.family) }
    )
    if (answered.value) list.push({ label: t('app.roster.menu.revert'), icon: Undo2, onSelect: () => emit('revert', props.family) })
    list.push({ label: t('app.roster.menu.remove'), icon: Trash2, danger: true, separator: true, onSelect: () => emit('remove', props.family) })
  }
  return list
})
</script>

<template>
  <UiCard padding="sm">
    <div class="flex items-start gap-3">
      <UiCheckbox v-if="selectable" class="mt-2.5 shrink-0" :model-value="selected" @update:model-value="emit('select', family, $event)">
        <span class="sr-only">{{ t('app.whatsapp.selectGuest', { name: family.name }) }}</span>
      </UiCheckbox>
      <UiAvatar :name="family.name" class="shrink-0" />
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h2 class="font-heading text-lg text-ink-900">{{ family.name }}</h2>
          <UiBadge :tone="STATUS_TONE[family.status]" size="sm" dot>{{ t(`app.roster.status.${family.status}`) }}</UiBadge>
        </div>
        <p v-if="contact" class="truncate text-sm text-ink-500">{{ contact }}</p>
        <div v-if="wa" class="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          <UiBadge :tone="wa.tone" size="sm">
            <component :is="wa.icon" class="h-3 w-3" aria-hidden="true" />
            <span class="sr-only">{{ t('app.whatsapp.stateLabel') }}:</span>
            {{ t(`app.whatsapp.state.${wa.key}`) }}
          </UiBadge>
          <template v-if="wa.key === 'failed' && wa.message">
            <span class="text-xs text-danger-700">{{ isUnknownDelivery(wa.message) ? t('app.whatsapp.unknownDelivery') : wa.message.errorMessage || t('app.whatsapp.failedHelp') }}</span>
            <UiButton v-if="canEdit" size="sm" variant="link" class="h-auto text-xs" @click="emit('retry', wa.message)">{{ t('app.whatsapp.retry') }}</UiButton>
          </template>
        </div>
        <ul v-if="family.companions.length" class="mt-2 space-y-1">
          <li v-for="companion in family.companions" :key="companion.id" class="flex items-center justify-between gap-2 text-sm text-ink-700">
            <span class="truncate">{{ companion.name }}</span>
            <UiBadge :tone="STATUS_TONE[companion.status]" size="sm">{{ t(`app.roster.status.${companion.status}`) }}</UiBadge>
          </li>
        </ul>
        <p v-if="family.notes" class="mt-2 text-sm text-ink-500">{{ family.notes }}</p>
        <GuestLocaleSelect :family="family" :event-locale="eventLocale" :disabled="!canEdit" @change="emit('locale', family, $event)" />
        <p class="mt-2 text-xs text-ink-500">{{ t('app.roster.people', { n: peopleIn(family) }, peopleIn(family)) }}</p>
      </div>
      <UiDropdown :items="items">
        <template #trigger>
          <UiButton variant="ghost" size="sm" icon :aria-label="t('app.roster.menu.label', { name: family.name })">
            <MoreHorizontal class="h-5 w-5" aria-hidden="true" />
          </UiButton>
        </template>
      </UiDropdown>
    </div>
  </UiCard>
</template>
