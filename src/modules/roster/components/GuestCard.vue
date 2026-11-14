<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { MoreHorizontal, Pencil, MessageCircle, Link as LinkIcon, CheckCheck, Undo2, Trash2 } from 'lucide-vue-next'
import { UiCard, UiBadge, UiAvatar, UiDropdown, UiButton } from '@/ui'
import { STATUS_TONE, peopleIn } from '../utils/roster'
import GuestLocaleSelect from './GuestLocaleSelect.vue'

const props = defineProps({
  family: { type: Object, required: true },
  canEdit: { type: Boolean, default: false },
  eventLocale: { type: String, default: 'es' }
})
const emit = defineEmits(['edit', 'confirm', 'revert', 'remove', 'whatsapp', 'copy', 'locale'])
const { t } = useI18n()

const answered = computed(() => props.family.status !== 'pending' || props.family.companions.some(c => c.status !== 'pending'))
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
      <UiAvatar :name="family.name" class="shrink-0" />
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h2 class="font-heading text-lg text-ink-900">{{ family.name }}</h2>
          <UiBadge :tone="STATUS_TONE[family.status]" size="sm" dot>{{ t(`app.roster.status.${family.status}`) }}</UiBadge>
        </div>
        <p v-if="contact" class="truncate text-sm text-ink-500">{{ contact }}</p>
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
