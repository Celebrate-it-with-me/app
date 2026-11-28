<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { MoreHorizontal, Pencil, Trash2, WalletCards, HandHeart, Link2, ListChecks } from 'lucide-vue-next'
import { UiBadge, UiButton, UiDropdown } from '@/ui'
import { STATUS_TONE, formatMoney, barOf, statusOf } from '../utils/budget'
import { formatEventDate } from '@/utils/eventDateTime'

const props = defineProps({
  item: { type: Object, required: true },
  currency: { type: String, default: 'USD' },
  canEdit: { type: Boolean, default: false },
  /** Whether the event has padrinos at all: only then does "assign padrino" make sense to offer. */
  hasPadrinos: { type: Boolean, default: false }
})
const emit = defineEmits(['pay', 'edit', 'remove', 'edit-payment', 'remove-payment', 'sponsors'])
const { t, locale } = useI18n()

const open = ref(false)
const money = value => formatMoney(value, props.currency, locale.value)
const date = value => formatEventDate(value, 'dateShort', locale.value)

const bar = computed(() => barOf(props.item))
const status = computed(() => statusOf(props.item))
const FILL = { complete: 'bg-success-500', partial: 'bg-rose-600', over: 'bg-danger-500' }
const sponsorNames = computed(() => props.item.padrinos.map(p => p.name).filter(Boolean).join(', '))
const showPay = computed(() => props.canEdit && bar.value.remaining > 0)
const payCount = computed(() => props.item.payments.length)
const hasEstimate = computed(() => props.item.agreedCost !== null && props.item.agreedCost !== undefined && props.item.agreedCost !== props.item.estimatedCost)

const detail = computed(() => {
  const b = bar.value
  const main = b.tone === 'over' ? t('app.budget.item.overBy', { amount: money(b.overpaid) }) : b.tone === 'complete' ? t('app.budget.item.complete') : t('app.budget.item.left', { amount: money(b.remaining) })
  const parts = [main]
  if (hasEstimate.value) parts.push(t('app.budget.item.estimated', { amount: money(props.item.estimatedCost) }))
  if (payCount.value) parts.push(t('app.budget.item.payments', { n: payCount.value }, payCount.value))
  return parts.join(' · ')
})

const menu = computed(() => {
  const list = []
  if (props.canEdit) list.push({ label: t('app.budget.item.pay'), icon: WalletCards, onSelect: () => emit('pay', props.item) })
  if (payCount.value) list.push({ label: t('app.budget.item.viewPayments', { n: payCount.value }), icon: ListChecks, onSelect: () => (open.value = !open.value) })
  if (props.canEdit) {
    if (props.hasPadrinos || props.item.padrinos.length) {
      list.push({ label: t(props.item.padrinos.length ? 'app.budget.item.changeSponsor' : 'app.budget.item.addSponsor'), icon: HandHeart, onSelect: () => emit('sponsors', props.item) })
    }
    list.push({ label: t('app.budget.item.edit'), icon: Pencil, onSelect: () => emit('edit', props.item) })
    list.push({ label: t('app.budget.item.remove'), icon: Trash2, danger: true, separator: true, onSelect: () => emit('remove', props.item) })
  }
  return list
})
</script>

<template>
  <div
    class="grid grid-cols-[minmax(0,1fr)_auto] gap-x-2.5 gap-y-2 py-3.5 pl-3.5 md:pl-4 xl:pr-4 fab-safe xl:grid-cols-[minmax(0,1fr)_110px_190px_160px_40px] xl:items-center xl:gap-4 xl:py-3.5"
    :data-item="item.id"
  >
    <div class="min-w-0">
      <h3 class="font-heading text-base leading-tight text-ink-900">{{ item.title }}</h3>
      <p v-if="item.vendorName || item.dueDate || item.vendorPhone" class="mt-0.5 text-xs text-ink-500">
        <span v-if="item.vendorName">{{ item.vendorName }}</span>
        <span v-if="item.vendorName && item.dueDate"> · </span>
        <span v-if="item.dueDate" :class="status === 'overdue' && 'font-medium text-danger-700'">{{ t('app.budget.item.dueShort', { date: date(item.dueDate) }) }}</span>
        <a v-if="item.vendorPhone" :href="`tel:${item.vendorPhone}`" class="ml-1 text-rose-700 underline-offset-4 hover:underline">{{ item.vendorPhone }}</a>
      </p>
      <span v-if="item.padrinos.length" class="mt-1.5 inline-flex max-w-full items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs text-rose-700" data-testid="sponsor-chip">
        <Link2 class="h-3 w-3 shrink-0" aria-hidden="true" />
        <span class="truncate">{{ t('app.budget.item.sponsoredBy', { names: sponsorNames }) }}</span>
      </span>
    </div>

    <UiDropdown v-if="menu.length" :items="menu">
      <template #trigger>
        <UiButton
          variant="ghost"
          size="sm"
          icon
          class="col-start-2 row-start-1 -mt-1.5 -mr-1.5 h-9 w-9 self-start xl:col-start-auto xl:row-start-auto xl:m-0 xl:self-center xl:order-last"
          :aria-label="t('app.budget.item.menu', { name: item.title })"
        >
          <MoreHorizontal class="h-5 w-5" aria-hidden="true" />
        </UiButton>
      </template>
    </UiDropdown>
    <div v-else class="hidden xl:order-last xl:block"></div>

    <div class="col-span-2 xl:col-span-1">
      <UiBadge :tone="STATUS_TONE[status]" size="sm" dot data-testid="status-chip">{{ t(`app.budget.status.${status}`) }}</UiBadge>
    </div>

    <div class="col-span-2 min-w-0 xl:col-span-1">
      <p class="text-[13px] tabular-nums text-ink-500"><b class="font-semibold text-ink-900">{{ money(bar.paid) }}</b> {{ t('app.budget.item.paidOf', { total: money(bar.total) }) }}</p>
      <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-cream-200" role="progressbar" :aria-valuenow="Math.round(bar.fill)" aria-valuemin="0" aria-valuemax="100" :aria-label="t('app.budget.item.progress', { name: item.title })">
        <div class="h-full rounded-full" :class="FILL[bar.tone]" :style="{ width: `${bar.fill}%` }" data-testid="item-fill" :data-tone="bar.tone"></div>
      </div>
      <p class="mt-1 text-[11px] leading-tight" :class="bar.tone === 'over' ? 'font-medium text-danger-700' : 'text-ink-500'" data-testid="item-detail">{{ detail }}</p>
    </div>

    <div class="col-span-2 xl:col-span-1">
      <UiButton v-if="showPay" size="sm" class="h-10 w-full text-[13px] md:w-auto md:px-5 xl:h-[34px] xl:px-3.5" data-testid="pay-button" @click="emit('pay', item)">
        {{ t('app.budget.item.pay') }}
      </UiButton>
    </div>

    <ul v-if="open" class="col-span-2 divide-y divide-line rounded-xl border border-line xl:col-span-5" data-testid="payments-list">
      <li v-for="payment in item.payments" :key="payment.id" class="flex items-center justify-between gap-3 px-3 py-2 text-sm">
        <div class="min-w-0">
          <p class="tabular-nums font-medium text-ink-900">{{ money(payment.amount) }}</p>
          <p class="truncate text-ink-500">{{ date(payment.paidOn) }}<template v-if="payment.padrinoName"> · {{ t('app.budget.payment.paidByName', { name: payment.padrinoName }) }}</template><template v-if="payment.note"> · {{ payment.note }}</template></p>
        </div>
        <div v-if="canEdit" class="flex shrink-0">
          <UiButton variant="ghost" size="sm" icon :aria-label="t('app.budget.item.editPayment')" @click="emit('edit-payment', { item, payment })">
            <Pencil class="h-4 w-4" aria-hidden="true" />
          </UiButton>
          <UiButton variant="ghost" size="sm" icon :aria-label="t('app.budget.item.removePayment')" @click="emit('remove-payment', { item, payment })">
            <Trash2 class="h-4 w-4" aria-hidden="true" />
          </UiButton>
        </div>
      </li>
    </ul>
  </div>
</template>
