<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { MoreHorizontal, Pencil, HandHeart, MessageCircle, Trash2, Eye, EyeOff, AlertTriangle } from 'lucide-vue-next'
import { UiCard, UiBadge, UiButton, UiDropdown } from '@/ui'
import { formatMoney, percent } from '@/modules/budget/utils/budget'
import { STATUS_TONE, PROGRESS_TONE, avatarTone, conflictAnchor, initialsOf, sponsorLines } from '../utils/padrinos'

const props = defineProps({
  padrino: { type: Object, required: true },
  /** Budget items, to tell what each commitment has already received. */
  items: { type: Array, default: () => [] },
  /** Position in the list: picks the avatar color. */
  index: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  canEdit: { type: Boolean, default: false }
})
const emit = defineEmits(['edit', 'commitments', 'whatsapp', 'remove', 'review'])
const { t, locale } = useI18n()

const money = value => formatMoney(value, props.currency, locale.value)
const share = computed(() => percent(props.padrino.paid, props.padrino.committed))
const lines = computed(() => sponsorLines(props.padrino, props.items))
const hasPhone = computed(() => !!String(props.padrino.phone ?? '').trim())

const menu = computed(() => {
  const list = [{ label: t('app.padrinos.menu.whatsapp'), icon: MessageCircle, onSelect: () => emit('whatsapp', props.padrino), disabled: !hasPhone.value }]
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
  <UiCard padding="none" class="flex h-full flex-col p-3.5 md:p-[18px]">
    <div class="flex items-start gap-3">
      <div :class="['hidden h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full text-sm font-semibold min-[420px]:flex md:h-11 md:w-11 md:text-base', avatarTone(index)]" aria-hidden="true" data-avatar>
        {{ initialsOf(padrino.name) }}
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h2 class="min-w-0 break-words font-heading text-lg text-ink-900">{{ padrino.name }}</h2>
          <UiBadge :tone="STATUS_TONE[padrino.status]" size="sm" dot>{{ t(`app.padrinos.status.${padrino.status}`) }}</UiBadge>
        </div>
        <p v-if="padrino.relationship || padrino.phone" class="mt-0.5 break-words text-sm text-ink-500">
          {{ [padrino.relationship, padrino.phone].filter(Boolean).join(' · ') }}
        </p>
      </div>
      <UiDropdown :items="menu">
        <template #trigger>
          <UiButton class="relative touch-target self-start" variant="ghost" size="sm" icon :aria-label="t('app.padrinos.menu.label', { name: padrino.name })">
            <MoreHorizontal class="h-5 w-5" aria-hidden="true" />
          </UiButton>
        </template>
      </UiDropdown>
    </div>

    <div class="mt-3.5">
      <div v-if="padrino.commitments.length">
        <div class="flex flex-wrap items-baseline gap-1.5">
          <span class="font-heading text-2xl tabular-nums text-ink-900" data-paid>{{ money(padrino.paid) }}</span>
          <span class="text-sm text-ink-500">{{ t('app.padrinos.contributedOf', { total: money(padrino.committed) }) }}</span>
          <UiBadge class="ml-auto" :tone="PROGRESS_TONE[padrino.progress]" size="sm">{{ t(`app.padrinos.progress.${padrino.progress}`) }}</UiBadge>
        </div>
        <div class="mt-2 h-2 overflow-hidden rounded-full bg-cream-200" role="progressbar" :aria-valuenow="share" aria-valuemin="0" aria-valuemax="100" :aria-label="t('app.padrinos.progressOf', { name: padrino.name })">
          <div class="h-full origin-left rounded-full bg-rose-600 transition-transform duration-500 ease-out motion-reduce:transition-none" :style="{ transform: `scaleX(${share / 100})` }" />
        </div>
        <ul class="mt-2.5">
          <li v-for="line in lines" :key="line.budgetItemId" class="border-t border-black/[.06] first:border-t-0" data-line>
            <div class="flex items-center gap-2.5 py-2">
              <span class="min-w-0 flex-1 break-words text-sm text-ink-900">{{ line.title }}</span>
              <span class="shrink-0 tabular-nums text-ink-700">{{ money(line.amount) }}</span>
              <span :class="['shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold', line.status === 'paid' ? 'bg-success-50 text-success-700' : 'bg-warning-50 text-warning-700']">
                {{ t(`app.padrinos.sponsorStatus.${line.status}`) }}
              </span>
            </div>
            <div v-if="line.conflict" :id="conflictAnchor({ padrinoId: padrino.id, budgetItemId: line.budgetItemId })" class="mb-2 mt-0.5 flex gap-2 rounded-[10px] bg-warning-50 px-2.5 py-2 text-xs leading-snug text-warning-700" role="status" data-conflict>
              <AlertTriangle class="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <p class="min-w-0">
                {{ t('app.padrinos.conflict.inline', { item: line.title, paid: money(line.conflict.paid), total: money(line.conflict.total), name: padrino.name, pending: money(line.conflict.pending) }) }}
                <button type="button" class="relative touch-target ml-1 font-semibold underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600" @click="emit('review', line)">
                  {{ t('app.padrinos.conflict.review') }}
                </button>
              </p>
            </div>
          </li>
        </ul>
      </div>
      <p v-else class="text-sm text-ink-500">{{ t('app.padrinos.noCommitments') }}</p>
    </div>

    <div class="mt-auto flex flex-nowrap items-center gap-2 pt-3 md:flex-wrap">
      <UiButton v-if="canEdit" class="min-w-0 flex-1 md:flex-none" size="sm" :variant="padrino.commitments.length ? 'secondary' : 'primary'" @click="emit('commitments', padrino)">
        <HandHeart class="h-4 w-4 shrink-0" aria-hidden="true" />
        <span class="truncate">{{ t(padrino.commitments.length ? 'app.padrinos.changeCommitments' : 'app.padrinos.addCommitments') }}</span>
      </UiButton>
      <button
        v-if="hasPhone"
        type="button"
        class="relative touch-target inline-flex h-10 w-10 shrink-0 items-center justify-center gap-1.5 rounded-full border border-success-500/30 bg-success-50 text-[13px] font-semibold text-success-700 transition-colors hover:bg-success-50/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-success-700 md:h-[34px] md:w-auto md:px-3"
        :aria-label="t('app.padrinos.whatsappTo', { name: padrino.name })"
        data-whatsapp
        @click="emit('whatsapp', padrino)"
      >
        <MessageCircle class="h-4 w-4" aria-hidden="true" />
        <span class="hidden md:inline">WhatsApp</span>
      </button>
      <p class="ml-auto hidden items-center gap-1.5 text-xs text-ink-500 md:flex" data-visibility>
        <component :is="padrino.publicThanks ? Eye : EyeOff" class="h-3.5 w-3.5" aria-hidden="true" />
        {{ t(padrino.publicThanks ? 'app.padrinos.shownInInvitation' : 'app.padrinos.hiddenInInvitation') }}
      </p>
    </div>
  </UiCard>
</template>
