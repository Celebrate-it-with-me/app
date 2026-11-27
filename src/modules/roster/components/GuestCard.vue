<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { MoreHorizontal, Pencil, MessageCircle, Link as LinkIcon, CheckCheck, Undo2, Trash2 } from 'lucide-vue-next'
import { UiCard, UiBadge, UiAvatar, UiDropdown, UiButton } from '@/ui'
import { STATUS_TONE, peopleIn } from '../utils/roster'
import { isUnknownDelivery } from '../utils/whatsapp'
import GuestLocaleSelect from './GuestLocaleSelect.vue'

const props = defineProps({
  family: { type: Object, required: true },
  canEdit: { type: Boolean, default: false },
  eventLocale: { type: String, default: 'es' },
  /** `{ key, tone, icon, message }` from deliveryOf, or null when the roster said nothing about delivery. */
  delivery: { type: Object, default: null }
})
const emit = defineEmits(['edit', 'confirm', 'revert', 'remove', 'send', 'copy', 'locale', 'retry'])
const { t } = useI18n()

const answered = computed(() => props.family.status !== 'pending' || props.family.companions.some(c => c.status !== 'pending'))
const contact = computed(() => props.family.phone || props.family.email || '')

const items = computed(() => {
  const list = [
    { label: t('app.roster.menu.send'), icon: MessageCircle, onSelect: () => emit('send', props.family), disabled: !props.family.link },
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
          <h2 class="font-heading text-lg text-ink-900 max-[360px]:text-base">{{ family.name }}</h2>
          <UiBadge :tone="STATUS_TONE[family.status]" size="sm" dot>{{ t(`app.roster.status.${family.status}`) }}</UiBadge>
        </div>
        <p v-if="contact" class="truncate text-sm text-ink-500">{{ contact }}</p>
        <div v-if="delivery" class="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1" data-testid="delivery">
          <UiBadge :tone="delivery.tone" size="sm">
            <component :is="delivery.icon" class="h-3 w-3" aria-hidden="true" />
            <span class="sr-only">{{ t('app.whatsapp.stateLabel') }}:</span>
            {{ t(`app.whatsapp.state.${delivery.key}`) }}
          </UiBadge>
          <template v-if="delivery.key === 'failed'">
            <span class="text-xs text-danger-700">{{ isUnknownDelivery(delivery.message) ? t('app.whatsapp.unknownDelivery') : delivery.message.errorMessage || t('app.whatsapp.failedHelp') }}</span>
            <UiButton v-if="canEdit" size="sm" variant="link" class="h-auto text-xs" @click="emit('retry', delivery.message)">{{ t('app.whatsapp.retry') }}</UiButton>
          </template>
          <UiButton v-else-if="delivery.key === 'no_phone' && canEdit" size="sm" variant="link" class="h-auto text-xs" @click="emit('edit', family)">{{ t('app.roster.addPhone') }}</UiButton>
        </div>
        <ul v-if="family.companions.length" class="mt-2 space-y-1">
          <li v-for="companion in family.companions" :key="companion.id" class="flex items-start justify-between gap-2 text-sm text-ink-700">
            <span class="min-w-0 flex-1 break-words" data-testid="companion-name">{{ companion.name }}</span>
            <UiBadge :tone="STATUS_TONE[companion.status]" size="sm" class="shrink-0">{{ t(`app.roster.status.${companion.status}`) }}</UiBadge>
          </li>
        </ul>
        <p v-if="family.notes" class="mt-2 text-sm text-ink-500">{{ family.notes }}</p>
        <figure v-if="family.rsvpNote" class="mt-2 rounded-xl bg-cream-100 px-3 py-2">
          <figcaption class="text-xs font-medium text-ink-500">{{ t('app.roster.rsvpNote') }}</figcaption>
          <blockquote class="mt-0.5 whitespace-pre-line break-words text-sm text-ink-700">{{ family.rsvpNote }}</blockquote>
        </figure>
      </div>
      <UiDropdown :items="items">
        <template #trigger>
          <UiButton variant="ghost" size="sm" icon :aria-label="t('app.roster.menu.label', { name: family.name })">
            <MoreHorizontal class="h-5 w-5" aria-hidden="true" />
          </UiButton>
        </template>
      </UiDropdown>
    </div>
    <!-- Below the name column on phones, so the language select gets the whole card width (it was cut to ~150px
         between the avatar and the menu); from sm up it lines up with the name column again (avatar 2.5rem + gap 0.75rem). -->
    <div class="sm:ml-13" data-testid="guest-card-foot">
      <GuestLocaleSelect :family="family" :event-locale="eventLocale" :disabled="!canEdit" @change="emit('locale', family, $event)" />
      <p class="mt-2 text-xs text-ink-500">{{ t('app.roster.people', { n: peopleIn(family) }, peopleIn(family)) }}</p>
    </div>
  </UiCard>
</template>
