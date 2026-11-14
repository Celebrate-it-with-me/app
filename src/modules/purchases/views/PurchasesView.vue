<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { FileText, ReceiptText } from 'lucide-vue-next'
import { UiCard, UiBadge, UiButton, UiSkeleton, UiEmptyState, useToast } from '@/ui'
import PurchasesService from '../services/PurchasesService'
import { formatMoney } from '@/modules/payments/utils/money'
import { purchaseState, shortDate } from '../utils/purchases'

const { t, locale } = useI18n()
const { error } = useToast()

const purchases = ref([])
const loading = ref(true)
const failed = ref(false)
const downloading = ref('')

async function load() {
  loading.value = true
  failed.value = false
  try {
    purchases.value = await PurchasesService.list()
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
}

async function download(kind, id, number) {
  downloading.value = `${kind}-${id}`
  try {
    await PurchasesService.download(kind, id, `${number}.pdf`)
  } catch {
    error(t('purchases.downloadError'))
  } finally {
    downloading.value = ''
  }
}

onMounted(load)
</script>

<template>
  <section :aria-busy="loading">
    <UiCard :title="t('purchases.title')" :subtitle="t('purchases.text')" heading-level="h2">
      <div v-if="loading" class="mt-5 flex flex-col gap-4">
        <UiSkeleton :lines="3" />
        <UiSkeleton :lines="3" />
      </div>

      <div v-else-if="failed" class="mt-5 flex flex-col items-start gap-3" role="alert">
        <p class="text-base text-danger-700">{{ t('purchases.loadError') }}</p>
        <UiButton variant="secondary" @click="load">{{ t('purchases.retry') }}</UiButton>
      </div>

      <UiEmptyState v-else-if="!purchases.length" compact :title="t('purchases.emptyTitle')" :description="t('purchases.emptyText')">
        <template #icon><ReceiptText class="h-6 w-6" aria-hidden="true" /></template>
      </UiEmptyState>

      <ul v-else class="mt-5 flex flex-col divide-y divide-line">
        <li v-for="p in purchases" :key="p.id" class="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="break-words font-heading text-lg text-ink-900">{{ p.event?.name ?? t('purchases.deletedEvent') }}</p>
              <p class="text-sm text-ink-500">{{ shortDate(p.paidAt, locale) }}</p>
            </div>
            <div class="flex shrink-0 flex-col items-end gap-1">
              <span class="text-lg font-semibold text-ink-900">{{ formatMoney(p.amountCents, p.currency, locale) }}</span>
              <UiBadge :tone="purchaseState(p).tone" size="sm" dot>{{ t(`purchases.status.${purchaseState(p).key}`) }}</UiBadge>
            </div>
          </div>

          <ul v-if="p.invoices.length" class="flex flex-col gap-2">
            <li v-for="inv in p.invoices" :key="inv.id" class="flex flex-col gap-2 rounded-lg bg-cream-100 p-3">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <span class="text-base font-medium text-ink-900">{{ t('purchases.invoice') }} {{ inv.number }}</span>
                <UiButton size="sm" variant="secondary" :loading="downloading === `invoice-${inv.id}`" @click="download('invoice', inv.id, inv.number)">
                  <FileText class="h-4 w-4" aria-hidden="true" />
                  {{ t('purchases.download') }}
                </UiButton>
              </div>
              <div v-for="note in inv.creditNotes" :key="note.id" class="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-2">
                <span class="text-sm text-ink-700">{{ t('purchases.creditNote') }} {{ note.number }} · −{{ formatMoney(note.amountCents, p.currency, locale) }}</span>
                <UiButton size="sm" variant="ghost" :loading="downloading === `credit-note-${note.id}`" @click="download('credit-note', note.id, note.number)">
                  <FileText class="h-4 w-4" aria-hidden="true" />
                  {{ t('purchases.download') }}
                </UiButton>
              </div>
            </li>
          </ul>
          <p v-else class="text-sm text-ink-500">{{ t('purchases.noInvoice') }}</p>
        </li>
      </ul>
    </UiCard>
  </section>
</template>
