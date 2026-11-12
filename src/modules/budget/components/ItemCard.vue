<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { MoreHorizontal, Pencil, Trash2, WalletCards, ChevronDown, Phone } from 'lucide-vue-next'
import { UiCard, UiBadge, UiButton, UiDropdown } from '@/ui'
import { STATUS_TONE, formatMoney, percent } from '../utils/budget'

const props = defineProps({
  item: { type: Object, required: true },
  currency: { type: String, default: 'USD' },
  canEdit: { type: Boolean, default: false }
})
const emit = defineEmits(['pay', 'edit', 'remove', 'edit-payment', 'remove-payment'])
const { t, locale } = useI18n()

const open = ref(false)
const money = value => formatMoney(value, props.currency, locale.value)
const share = computed(() => percent(props.item.paid, props.item.owed))
const date = value => (value ? new Intl.DateTimeFormat(locale.value === 'es' ? 'es-US' : 'en-US', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`)) : '')

const menu = computed(() => [
  { label: t('app.budget.item.edit'), icon: Pencil, onSelect: () => emit('edit', props.item) },
  { label: t('app.budget.item.remove'), icon: Trash2, danger: true, separator: true, onSelect: () => emit('remove', props.item) }
])
</script>

<template>
  <UiCard padding="sm">
    <div class="flex items-start gap-3">
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 class="font-heading text-lg text-ink-900">{{ item.title }}</h3>
          <UiBadge :tone="STATUS_TONE[item.status]" size="sm" dot>{{ t(`app.budget.status.${item.status}`) }}</UiBadge>
        </div>
        <p v-if="item.vendorName || item.vendorPhone" class="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-ink-500">
          <span v-if="item.vendorName">{{ item.vendorName }}</span>
          <a v-if="item.vendorPhone" :href="`tel:${item.vendorPhone}`" class="inline-flex items-center gap-1 text-rose-700 underline-offset-4 hover:underline">
            <Phone class="h-3.5 w-3.5" aria-hidden="true" />{{ item.vendorPhone }}
          </a>
        </p>
        <p v-if="item.dueDate" class="mt-0.5 text-sm" :class="item.status === 'overdue' ? 'font-medium text-danger-700' : 'text-ink-500'">
          {{ t('app.budget.item.due', { date: date(item.dueDate) }) }}
        </p>
      </div>
      <UiDropdown v-if="canEdit" :items="menu">
        <template #trigger>
          <UiButton variant="ghost" size="sm" icon :aria-label="t('app.budget.item.menu', { name: item.title })">
            <MoreHorizontal class="h-5 w-5" aria-hidden="true" />
          </UiButton>
        </template>
      </UiDropdown>
    </div>

    <div class="mt-3">
      <div class="flex items-baseline justify-between gap-3 text-sm">
        <span class="tabular-nums text-ink-900">{{ money(item.paid) }} <span class="text-ink-500">/ {{ money(item.owed) }}</span></span>
        <span v-if="item.remaining > 0" class="tabular-nums text-ink-500">{{ t('app.budget.item.left', { amount: money(item.remaining) }) }}</span>
      </div>
      <div class="mt-1.5 h-2 overflow-hidden rounded-full bg-cream-100" role="progressbar" :aria-valuenow="share" aria-valuemin="0" aria-valuemax="100" :aria-label="t('app.budget.item.progress', { name: item.title })">
        <div class="h-full origin-left rounded-full bg-rose-600 transition-transform duration-500 ease-out" :style="{ transform: `scaleX(${share / 100})` }" />
      </div>
      <p v-if="item.agreedCost !== null && item.agreedCost !== item.estimatedCost" class="mt-1 text-xs text-ink-500">
        {{ t('app.budget.item.estimatedWas', { amount: money(item.estimatedCost) }) }}
      </p>
    </div>

    <div class="mt-3 flex flex-wrap items-center gap-2">
      <UiButton v-if="canEdit && item.remaining > 0" size="sm" @click="emit('pay', item)">
        <WalletCards class="h-4 w-4" aria-hidden="true" />
        {{ t('app.budget.item.pay') }}
      </UiButton>
      <UiButton v-if="item.payments.length" variant="ghost" size="sm" :aria-expanded="open" @click="open = !open">
        {{ t('app.budget.item.payments', { n: item.payments.length }, item.payments.length) }}
        <ChevronDown class="h-4 w-4 transition-transform duration-200" :class="open ? 'rotate-180' : ''" aria-hidden="true" />
      </UiButton>
    </div>

    <ul v-if="open" class="mt-3 divide-y divide-line rounded-xl border border-line">
      <li v-for="payment in item.payments" :key="payment.id" class="flex items-center justify-between gap-3 px-3 py-2 text-sm">
        <div class="min-w-0">
          <p class="tabular-nums font-medium text-ink-900">{{ money(payment.amount) }}</p>
          <p class="truncate text-ink-500">{{ date(payment.paidOn) }}<template v-if="payment.note"> · {{ payment.note }}</template></p>
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
  </UiCard>
</template>
