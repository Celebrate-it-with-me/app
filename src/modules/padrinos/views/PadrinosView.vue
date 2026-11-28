<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Plus } from 'lucide-vue-next'
import { UiPageHeader, UiCard, UiButton, UiSkeleton, UiEmptyState, UiModal, useToast, UiPage } from '@/ui'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import BudgetService from '@/modules/budget/services/BudgetService'
import { formatMoney, percent } from '@/modules/budget/utils/budget'
import PadrinosService from '../services/PadrinosService'
import PadrinoCard from '../components/PadrinoCard.vue'
import PadrinoFormModal from '../components/PadrinoFormModal.vue'
import CommitmentsModal from '../components/CommitmentsModal.vue'
import CommitmentConflictDialog from '../components/CommitmentConflictDialog.vue'
import { useCommitmentSave } from '../composables/useCommitmentSave'
import { conflictAnchor, conflictsOf, padrinoPayload, warningTitles, whatsappUrl } from '../utils/padrinos'

const { t, locale } = useI18n()
const { success, error: showError, toast } = useToast()
const eventsStore = useEventsStore()
const router = useRouter()

const event = computed(() => eventsStore.activeEvent)
const canEdit = computed(() => ['owner', 'editor'].includes(event.value?.userRole))

const padrinos = ref([])
const totals = ref({ committed: 0, paid: 0, remaining: 0, count: 0 })
const currency = ref('USD')
const items = ref([])
const loading = ref(true)
const saving = ref(false)

const formOpen = ref(false)
const editing = ref(null)
const commitmentsOpen = ref(false)
const target = ref(null)
const removing = ref(null)

const money = value => formatMoney(value, currency.value, locale.value)
const paidShare = computed(() => percent(totals.value.paid, totals.value.committed))
const conflicts = computed(() => conflictsOf(padrinos.value, items.value))

/** Scrolls to the first contribution that clashes with an expense already paid. */
function goToConflict() {
  const first = conflicts.value[0]
  const el = first ? document.getElementById(conflictAnchor(first)) : null
  el?.scrollIntoView({ behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' })
}
const reviewInBudget = () => router?.push({ name: 'budget' })

/** What is on screen belongs to this event; nothing of another event stays while (or after failing) to read. */
let shownFor = null
let reads = 0
function clear() {
  padrinos.value = []
  totals.value = { committed: 0, paid: 0, remaining: 0, count: 0 }
  currency.value = 'USD'
  items.value = []
  shownFor = null
}

async function load() {
  const eventId = event.value?.id
  if (!eventId) return
  const read = ++reads
  if (shownFor !== eventId) clear()
  loading.value = true
  try {
    const [list, budgetItems] = await Promise.all([PadrinosService.list(eventId), BudgetService.items(eventId)])
    if (read !== reads) return
    padrinos.value = list.data
    totals.value = list.totals
    currency.value = list.currency
    items.value = budgetItems
    shownFor = eventId
  } catch (e) {
    if (read !== reads) return
    clear()
    // Money is not for this role on this event (a viewer): back to the Inicio with the same notice as the route guard.
    if (e?.response?.status === 403) {
      toast({ title: t('app.dashboard.denied'), tone: 'warning' })
      router?.replace({ name: 'dashboard' })
      return
    }
    showError(t('app.padrinos.loadError'))
  } finally {
    if (read === reads) loading.value = false
  }
}
onMounted(load)
watch(() => event.value?.id, load)

async function run(action, okKey = 'app.padrinos.saved') {
  saving.value = true
  try {
    await action()
    await load()
    if (okKey) success(t(okKey))
    return true
  } catch (e) {
    showError(e.response?.data?.errors?.padrino ? t('app.padrinos.hasPayments') : t('app.padrinos.saveError'))
    return false
  } finally {
    saving.value = false
  }
}

function openForm(padrino = null) {
  editing.value = padrino
  formOpen.value = true
}
async function save(form) {
  const id = event.value.id
  const payload = padrinoPayload(form)
  const ok = await run(() => (editing.value ? PadrinosService.update(id, editing.value.id, payload) : PadrinosService.create(id, payload)))
  if (ok) formOpen.value = false
}

function openCommitments(padrino) {
  target.value = padrino
  commitmentsOpen.value = true
}
const commitmentFlow = useCommitmentSave({ save: commitments => PadrinosService.setCommitments(event.value.id, target.value.id, commitments) })

/** Reacts to the outcome of a save: close and refresh, ask about the paid items, or say what went wrong. */
async function afterCommitments(outcome) {
  if (outcome === 'saved') {
    commitmentsOpen.value = false
    await load()
    success(t('app.padrinos.saved'))
    const titles = warningTitles(commitmentFlow.warnings.value, items.value)
    if (titles.length) toast({ title: t('app.padrinos.conflict.warning', { items: titles.join(', ') }, titles.length), tone: 'warning', duration: 8000 })
  } else if (outcome === 'exceeds' && !commitmentFlow.asking.value) {
    const { budgetItemId, remaining } = commitmentFlow.exceeded.value
    const title = items.value.find(i => i.id === budgetItemId)?.title ?? ''
    showError(t('app.padrinos.conflict.exceededNamed', { item: title, remaining: money(remaining) }))
  } else if (outcome === 'failed') {
    showError(t('app.padrinos.saveError'))
  }
}
async function saveCommitments(commitments) {
  await afterCommitments(await commitmentFlow.submit(commitments))
}
async function resolveConflicts(choices) {
  await afterCommitments(await commitmentFlow.resolve(choices))
}

async function confirmRemove() {
  const ok = await run(() => PadrinosService.remove(event.value.id, removing.value.id), 'app.padrinos.removed')
  removing.value = null
  return ok
}

const openWhatsapp = padrino =>
  window.open(whatsappUrl(padrino.phone, t('app.padrinos.whatsappText', { name: padrino.name, event: event.value?.eventName ?? '' })), '_blank', 'noopener')
</script>

<template>
  <UiPage class="pb-24 lg:pb-0">
    <UiPageHeader :title="t('app.padrinos.title')" :subtitle="t('app.padrinos.subtitle')">
      <template #actions>
        <UiButton v-if="canEdit" @click="openForm()">
          <Plus class="h-4 w-4" aria-hidden="true" />
          {{ t('app.padrinos.add') }}
        </UiButton>
      </template>
    </UiPageHeader>

    <div v-if="loading && !padrinos.length" class="mt-6 space-y-3">
      <UiSkeleton class="h-28" />
      <UiSkeleton class="h-28" />
    </div>

    <UiEmptyState v-else-if="!padrinos.length" class="mt-8" :title="t('app.padrinos.emptyTitle')" :description="t('app.padrinos.emptyText')">
      <UiButton v-if="canEdit" @click="openForm()">{{ t('app.padrinos.addFirst') }}</UiButton>
    </UiEmptyState>

    <template v-else>
      <UiCard v-if="totals.committed > 0" class="mt-6" as="section" :aria-label="t('app.padrinos.summary.label')">
        <dl class="grid grid-cols-3 gap-3 text-center sm:gap-6 sm:text-left">
          <div>
            <dt class="text-xs text-ink-500 sm:text-sm">{{ t('app.padrinos.summary.committed') }}</dt>
            <dd class="mt-1 font-heading text-xl tabular-nums text-ink-900 sm:text-3xl">{{ money(totals.committed) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-ink-500 sm:text-sm">{{ t('app.padrinos.summary.paid') }}</dt>
            <dd class="mt-1 font-heading text-xl tabular-nums text-success-700 sm:text-3xl">{{ money(totals.paid) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-ink-500 sm:text-sm">{{ t('app.padrinos.summary.remaining') }}</dt>
            <dd class="mt-1 font-heading text-xl tabular-nums text-ink-900 sm:text-3xl">{{ money(totals.remaining) }}</dd>
          </div>
        </dl>
        <div class="mt-4 h-2.5 overflow-hidden rounded-full bg-cream-200" role="progressbar" :aria-valuenow="paidShare" aria-valuemin="0" aria-valuemax="100" :aria-label="t('app.padrinos.summary.label')">
          <div class="h-full origin-left rounded-full bg-rose-600 transition-transform duration-500 ease-out" :style="{ transform: `scaleX(${paidShare / 100})` }" />
        </div>
        <ul class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-700" data-legend>
          <li class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-sm bg-rose-600" aria-hidden="true" />{{ t('app.padrinos.summary.paid') }}</li>
          <li class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-sm bg-cream-200 ring-1 ring-line-strong" aria-hidden="true" />{{ t('app.padrinos.summary.remaining') }}</li>
        </ul>
        <button v-if="conflicts.length" type="button" class="relative touch-target mt-2 block text-left text-xs text-warning-700 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600" data-conflicts-line @click="goToConflict">
          ⚠ {{ t('app.padrinos.conflict.summaryLine', { count: conflicts.length }, conflicts.length) }}
        </button>
        <p class="mt-2 text-sm text-ink-500">{{ t('app.padrinos.summary.note') }}</p>
      </UiCard>

      <ul class="mt-6 space-y-3 lg:grid lg:grid-cols-[repeat(auto-fill,minmax(420px,1fr))] lg:gap-4 lg:space-y-0">
        <li v-for="(padrino, index) in padrinos" :key="padrino.id" class="min-w-0">
          <PadrinoCard :padrino="padrino" :items="items" :index="index" :currency="currency" :can-edit="canEdit" @edit="openForm" @commitments="openCommitments" @whatsapp="openWhatsapp" @remove="removing = $event" @review="reviewInBudget" />
        </li>
      </ul>
    </template>

    <PadrinoFormModal v-model:open="formOpen" :padrino="editing" :saving="saving" @save="save" />
    <CommitmentsModal v-model:open="commitmentsOpen" :padrino="target" :items="items" :currency="currency" :saving="commitmentFlow.busy.value" @save="saveCommitments" />

    <CommitmentConflictDialog
      :open="commitmentFlow.asking.value"
      :padrino-name="target?.name ?? ''"
      :conflicts="commitmentFlow.conflicts.value"
      :commitments="commitmentFlow.pending.value"
      :previous="target?.commitments ?? []"
      :exceeded="commitmentFlow.exceeded.value"
      :currency="currency"
      :busy="commitmentFlow.busy.value"
      @confirm="resolveConflicts"
      @cancel="commitmentFlow.cancel"
    />

    <UiModal :open="!!removing" :title="t('app.padrinos.removeTitle')" size="sm" @update:open="removing = null">
      <p class="text-ink-700">{{ t('app.padrinos.removeBody', { name: removing?.name ?? '' }) }}</p>
      <template #footer>
        <UiButton variant="ghost" @click="removing = null">{{ t('app.padrinos.cancel') }}</UiButton>
        <UiButton variant="danger" :loading="saving" @click="confirmRemove">{{ t('app.padrinos.menu.remove') }}</UiButton>
      </template>
    </UiModal>
  </UiPage>
</template>
