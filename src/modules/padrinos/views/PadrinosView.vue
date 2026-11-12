<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Plus } from 'lucide-vue-next'
import { UiPageHeader, UiCard, UiButton, UiSkeleton, UiEmptyState, UiModal, useToast } from '@/ui'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import BudgetService from '@/modules/budget/services/BudgetService'
import { formatMoney, percent } from '@/modules/budget/utils/budget'
import PadrinosService from '../services/PadrinosService'
import PadrinoCard from '../components/PadrinoCard.vue'
import PadrinoFormModal from '../components/PadrinoFormModal.vue'
import CommitmentsModal from '../components/CommitmentsModal.vue'
import { padrinoPayload, whatsappUrl } from '../utils/padrinos'

const { t, locale } = useI18n()
const { success, error: showError } = useToast()
const eventsStore = useEventsStore()

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

async function load() {
  if (!event.value?.id) return
  loading.value = true
  try {
    const [list, budgetItems] = await Promise.all([PadrinosService.list(event.value.id), BudgetService.items(event.value.id)])
    padrinos.value = list.data
    totals.value = list.totals
    currency.value = list.currency
    items.value = budgetItems
  } catch {
    showError(t('app.padrinos.loadError'))
  } finally {
    loading.value = false
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
async function saveCommitments(commitments) {
  const ok = await run(() => PadrinosService.setCommitments(event.value.id, target.value.id, commitments))
  if (ok) commitmentsOpen.value = false
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
  <div class="mx-auto max-w-3xl">
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
        <div class="mt-4 h-2.5 overflow-hidden rounded-full bg-cream-100" role="progressbar" :aria-valuenow="paidShare" aria-valuemin="0" aria-valuemax="100" :aria-label="t('app.padrinos.summary.label')">
          <div class="h-full origin-left rounded-full bg-rose-600 transition-transform duration-500 ease-out" :style="{ transform: `scaleX(${paidShare / 100})` }" />
        </div>
        <p class="mt-2 text-sm text-ink-500">{{ t('app.padrinos.summary.note') }}</p>
      </UiCard>

      <ul class="mt-6 space-y-3">
        <li v-for="padrino in padrinos" :key="padrino.id">
          <PadrinoCard :padrino="padrino" :currency="currency" :can-edit="canEdit" @edit="openForm" @commitments="openCommitments" @whatsapp="openWhatsapp" @remove="removing = $event" />
        </li>
      </ul>
    </template>

    <PadrinoFormModal v-model:open="formOpen" :padrino="editing" :saving="saving" @save="save" />
    <CommitmentsModal v-model:open="commitmentsOpen" :padrino="target" :items="items" :currency="currency" :saving="saving" @save="saveCommitments" />

    <UiModal :open="!!removing" :title="t('app.padrinos.removeTitle')" size="sm" @update:open="removing = null">
      <p class="text-ink-700">{{ t('app.padrinos.removeBody', { name: removing?.name ?? '' }) }}</p>
      <template #footer>
        <UiButton variant="ghost" @click="removing = null">{{ t('app.padrinos.cancel') }}</UiButton>
        <UiButton variant="danger" :loading="saving" @click="confirmRemove">{{ t('app.padrinos.menu.remove') }}</UiButton>
      </template>
    </UiModal>
  </div>
</template>
