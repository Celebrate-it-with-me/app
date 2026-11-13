<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Download, Plus, Search } from 'lucide-vue-next'
import { UiPageHeader, UiButton, UiTabs, UiSkeleton, UiEmptyState, UiModal, useToast } from '@/ui'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import BudgetService from '../services/BudgetService'
import PadrinosService from '@/modules/padrinos/services/PadrinosService'
import { useBudgetStore } from '../stores/useBudgetStore'
import BudgetSummary from '../components/BudgetSummary.vue'
import CategoryBars from '../components/CategoryBars.vue'
import ItemCard from '../components/ItemCard.vue'
import ItemFormModal from '../components/ItemFormModal.vue'
import PaymentModal from '../components/PaymentModal.vue'
import CapModal from '../components/CapModal.vue'
import CategoriesModal from '../components/CategoriesModal.vue'
import ItemSponsorsModal from '../components/ItemSponsorsModal.vue'
import { FILTERS, filterCounts, filterItems, groupByCategory, itemPayload, paymentPayload } from '../utils/budget'

const { t } = useI18n()
const { success, error: showError } = useToast()
const eventsStore = useEventsStore()
const store = useBudgetStore()

const event = computed(() => eventsStore.activeEvent)
const canEdit = computed(() => ['owner', 'editor'].includes(event.value?.userRole))
const summary = computed(() => store.summary)
const categories = computed(() => store.summary?.categories ?? [])

const loading = ref(true)
const saving = ref(false)
const filter = ref('all')
const search = ref('')

const itemOpen = ref(false)
const editingItem = ref(null)
const payOpen = ref(false)
const payItem = ref(null)
const editingPayment = ref(null)
const capOpen = ref(false)
const categoriesOpen = ref(false)
const removing = ref(null)
const padrinos = ref([]) // `{ id, name }` for the payment payer
const padrinoList = ref([]) // full rows, with their commitments
const sponsorsOpen = ref(false)
const sponsorItem = ref(null)

async function load() {
  if (!event.value?.id) return
  loading.value = true
  try {
    await store.fetch(event.value.id)
    // Who besides the family can have paid a payment; if padrinos cannot load the budget still works.
    padrinoList.value = await PadrinosService.list(event.value.id).then(r => r.data).catch(() => [])
    padrinos.value = padrinoList.value.map(p => ({ id: p.id, name: p.name }))
  } catch {
    showError(t('app.budget.loadError'))
  } finally {
    loading.value = false
  }
}
onMounted(load)
watch(() => event.value?.id, load)

const tabs = computed(() => {
  const counts = filterCounts(store.items)
  return FILTERS.map(f => ({ value: f.value, label: t(`app.budget.filters.${f.value}`), count: counts[f.value] }))
})
const visible = computed(() => filterItems(store.items, filter.value, search.value))
const groups = computed(() => groupByCategory(visible.value, categories.value))

/** Runs a write, refreshes from the server (the totals live there) and reports. */
async function run(action, okKey = 'app.budget.saved') {
  saving.value = true
  try {
    await action()
    await store.refresh(event.value.id)
    if (okKey) success(t(okKey))
    return true
  } catch (e) {
    const message = e.response?.status === 422 && e.response.data?.errors?.category ? t('app.budget.categories.inUse') : t('app.budget.saveError')
    showError(message)
    return false
  } finally {
    saving.value = false
  }
}

function openItem(item = null) {
  editingItem.value = item
  itemOpen.value = true
}
async function saveItem(form) {
  const id = event.value.id
  const payload = itemPayload(form)
  const ok = await run(() => (editingItem.value ? BudgetService.updateItem(id, editingItem.value.id, payload) : BudgetService.createItem(id, payload)))
  if (ok) itemOpen.value = false
}

function openPayment(item, payment = null) {
  payItem.value = item
  editingPayment.value = payment
  payOpen.value = true
}
async function savePayment(form) {
  const id = event.value.id
  const payload = paymentPayload(form)
  const ok = await run(() =>
    editingPayment.value ? BudgetService.updatePayment(id, payItem.value.id, editingPayment.value.id, payload) : BudgetService.addPayment(id, payItem.value.id, payload)
  )
  if (ok) payOpen.value = false
}
const removePayment = ({ item, payment }) => run(() => BudgetService.removePayment(event.value.id, item.id, payment.id), 'app.budget.payment.removed')

async function saveCap(cap) {
  const ok = await run(() => BudgetService.setCap(event.value.id, cap))
  if (ok) capOpen.value = false
}

async function confirmRemove() {
  const ok = await run(() => BudgetService.removeItem(event.value.id, removing.value.id), 'app.budget.item.removed')
  if (ok) removing.value = null
}

function openSponsors(item) {
  sponsorItem.value = item
  sponsorsOpen.value = true
}
async function saveSponsors(changes) {
  if (!changes.length) {
    sponsorsOpen.value = false
    return
  }
  const id = event.value.id
  const ok = await run(async () => {
    for (const change of changes) await PadrinosService.setCommitments(id, change.padrinoId, change.commitments)
  })
  if (ok) {
    padrinoList.value = await PadrinosService.list(id).then(r => r.data).catch(() => padrinoList.value)
    sponsorsOpen.value = false
  }
}

const addCategory = name => run(() => BudgetService.addCategory(event.value.id, name), null)
const renameCategory = ({ id, name }) => run(() => BudgetService.renameCategory(event.value.id, id, name), null)
const removeCategory = category => run(() => BudgetService.removeCategory(event.value.id, category.id), null)

async function download() {
  try {
    const blob = await BudgetService.exportCsv(event.value.id)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${event.value.customUrlSlug || 'presupuesto'}-${t('app.budget.fileName')}.csv`
    link.click()
    URL.revokeObjectURL(url)
  } catch {
    showError(t('app.budget.exportError'))
  }
}
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <UiPageHeader :title="t('app.budget.title')" :subtitle="t('app.budget.subtitle')">
      <template #actions>
        <UiButton v-if="summary && store.items.length" variant="secondary" @click="download">
          <Download class="h-4 w-4" aria-hidden="true" />
          {{ t('app.budget.export') }}
        </UiButton>
        <UiButton v-if="canEdit" @click="openItem()">
          <Plus class="h-4 w-4" aria-hidden="true" />
          {{ t('app.budget.add') }}
        </UiButton>
      </template>
    </UiPageHeader>

    <div v-if="loading && !summary" class="mt-6 space-y-4">
      <UiSkeleton class="h-44" />
      <UiSkeleton class="h-28" />
      <UiSkeleton class="h-28" />
    </div>

    <template v-else-if="summary">
      <BudgetSummary class="mt-6" :summary="summary" :can-edit="canEdit" @cap="capOpen = true" />

      <UiEmptyState v-if="!store.items.length" class="mt-8" :title="t('app.budget.emptyTitle')" :description="t('app.budget.emptyText')">
        <UiButton v-if="canEdit" @click="openItem()">{{ t('app.budget.addFirst') }}</UiButton>
      </UiEmptyState>

      <template v-else>
        <CategoryBars class="mt-6" :summary="summary" />

        <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div class="relative flex-1">
            <Search class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" aria-hidden="true" />
            <input
              v-model="search"
              type="search"
              autocomplete="off"
              :aria-label="t('app.budget.search')"
              :placeholder="t('app.budget.search')"
              class="h-11 w-full rounded-xl border border-line-strong bg-white pl-10 pr-3 text-base text-ink-900 placeholder:text-ink-500 focus-visible:outline-2 focus-visible:outline-rose-600"
            />
          </div>
        </div>
        <div class="mt-3 overflow-x-auto">
          <UiTabs v-model="filter" :tabs="tabs" />
        </div>

        <p v-if="!visible.length" class="mt-8 text-center text-ink-500">{{ t('app.budget.noResults') }}</p>

        <section v-for="group in groups" :key="group.category?.id ?? 'none'" class="mt-6" :aria-label="group.category?.name ?? t('app.budget.uncategorized')">
          <h2 class="font-heading text-lg text-ink-900">{{ group.category?.name ?? t('app.budget.uncategorized') }}</h2>
          <ul class="mt-2 space-y-3">
            <li v-for="item in group.items" :key="item.id">
              <ItemCard
                :item="item"
                :currency="summary.currency"
                :can-edit="canEdit"
                :has-padrinos="padrinoList.length > 0"
                @sponsors="openSponsors"
                @pay="openPayment($event)"
                @edit="openItem"
                @remove="removing = $event"
                @edit-payment="openPayment($event.item, $event.payment)"
                @remove-payment="removePayment"
              />
            </li>
          </ul>
        </section>
      </template>
    </template>

    <ItemFormModal v-model:open="itemOpen" :item="editingItem" :categories="categories" :saving="saving" @save="saveItem" @categories="categoriesOpen = true" />
    <PaymentModal v-model:open="payOpen" :item="payItem" :payment="editingPayment" :currency="summary?.currency" :padrinos="padrinos" :saving="saving" @save="savePayment" />
    <ItemSponsorsModal v-model:open="sponsorsOpen" :item="sponsorItem" :padrinos="padrinoList" :saving="saving" @save="saveSponsors" />
    <CapModal v-model:open="capOpen" :cap="summary?.cap ?? null" :saving="saving" @save="saveCap" />
    <CategoriesModal v-model:open="categoriesOpen" :categories="categories" :saving="saving" @add="addCategory" @rename="renameCategory" @remove="removeCategory" />

    <UiModal :open="!!removing" :title="t('app.budget.item.removeTitle')" size="sm" @update:open="removing = null">
      <p class="text-ink-700">{{ t('app.budget.item.removeBody', { name: removing?.title ?? '' }) }}</p>
      <template #footer>
        <UiButton variant="ghost" @click="removing = null">{{ t('app.budget.cancel') }}</UiButton>
        <UiButton variant="danger" :loading="saving" @click="confirmRemove">{{ t('app.budget.item.remove') }}</UiButton>
      </template>
    </UiModal>
  </div>
</template>
