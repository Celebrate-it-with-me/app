<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { MoreHorizontal, Pencil, HandHeart, MessageCircle, Trash2, Eye } from 'lucide-vue-next'
import { UiCard, UiBadge, UiButton, UiDropdown } from '@/ui'
import { formatMoney, percent } from '@/modules/budget/utils/budget'
import { STATUS_TONE, PROGRESS_TONE } from '../utils/padrinos'

const props = defineProps({
  padrino: { type: Object, required: true },
  currency: { type: String, default: 'USD' },
  canEdit: { type: Boolean, default: false }
})
const emit = defineEmits(['edit', 'commitments', 'whatsapp', 'remove'])
const { t, locale } = useI18n()

const money = value => formatMoney(value, props.currency, locale.value)
const share = computed(() => percent(props.padrino.paid, props.padrino.committed))

const menu = computed(() => {
  const list = [{ label: t('app.padrinos.menu.whatsapp'), icon: MessageCircle, onSelect: () => emit('whatsapp', props.padrino), disabled: !props.padrino.phone }]
  if (props.canEdit) {
    list.push(
      { label: t('app.padrinos.menu.commitments'), icon: HandHeart, onSelect: () => emit('commitments', props.padrino), separator: true },
      { label: t('app.padrinos.menu.edit'), icon: Pencil, onSelect: () => emit('edit', props.padrino) },
      { label: t('app.padrinos.menu.remove'), icon: Trash2, danger: true, separator: true, onSelect: () => emit('remove', props.padrino) }
    )
  }
  return list
})
</script>

<template>
  <UiCard padding="sm">
    <div class="flex items-start gap-3">
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h2 class="font-heading text-lg text-ink-900">{{ padrino.name }}</h2>
          <UiBadge :tone="STATUS_TONE[padrino.status]" size="sm" dot>{{ t(`app.padrinos.status.${padrino.status}`) }}</UiBadge>
        </div>
        <p v-if="padrino.relationship || padrino.phone" class="mt-0.5 text-sm text-ink-500">
          {{ [padrino.relationship, padrino.phone].filter(Boolean).join(' · ') }}
        </p>
      </div>
      <UiDropdown :items="menu">
        <template #trigger>
          <UiButton variant="ghost" size="sm" icon :aria-label="t('app.padrinos.menu.label', { name: padrino.name })">
            <MoreHorizontal class="h-5 w-5" aria-hidden="true" />
          </UiButton>
        </template>
      </UiDropdown>
    </div>

    <div class="mt-3">
      <div v-if="padrino.commitments.length" class="space-y-2">
        <div class="flex items-center justify-between gap-3 text-sm">
          <UiBadge :tone="PROGRESS_TONE[padrino.progress]" size="sm">{{ t(`app.padrinos.progress.${padrino.progress}`) }}</UiBadge>
          <span class="tabular-nums text-ink-900">{{ money(padrino.paid) }} <span class="text-ink-500">/ {{ money(padrino.committed) }}</span></span>
        </div>
        <div class="h-2 overflow-hidden rounded-full bg-cream-100" role="progressbar" :aria-valuenow="share" aria-valuemin="0" aria-valuemax="100" :aria-label="t('app.padrinos.progressOf', { name: padrino.name })">
          <div class="h-full origin-left rounded-full bg-rose-600 transition-transform duration-500 ease-out" :style="{ transform: `scaleX(${share / 100})` }" />
        </div>
        <ul class="space-y-1 pt-1 text-sm text-ink-700">
          <li v-for="commitment in padrino.commitments" :key="commitment.budgetItemId" class="flex justify-between gap-3">
            <span class="min-w-0 truncate">{{ commitment.itemTitle }}</span>
            <span class="shrink-0 tabular-nums text-ink-500">{{ money(commitment.amount) }}</span>
          </li>
        </ul>
      </div>
      <p v-else class="text-sm text-ink-500">{{ t('app.padrinos.noCommitments') }}</p>
    </div>

    <div class="mt-3 flex flex-wrap items-center gap-2">
      <UiButton v-if="canEdit" size="sm" :variant="padrino.commitments.length ? 'secondary' : 'primary'" @click="emit('commitments', padrino)">
        <HandHeart class="h-4 w-4" aria-hidden="true" />
        {{ t(padrino.commitments.length ? 'app.padrinos.changeCommitments' : 'app.padrinos.addCommitments') }}
      </UiButton>
      <p v-if="padrino.publicThanks" class="flex items-center gap-1.5 text-sm text-ink-500">
        <Eye class="h-4 w-4" aria-hidden="true" />
        {{ t('app.padrinos.shownInInvitation') }}
      </p>
    </div>
  </UiCard>
</template>
