<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { FileSpreadsheet, Plus, Search, Send } from 'lucide-vue-next'
import { UiPageHeader, UiBadge, UiButton, UiTabs, UiSkeleton, UiEmptyState, UiModal, UiPagination, useToast } from '@/ui'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import GuestLimitBanner from '@/components/internal/limits/GuestLimitBanner.vue'
import { planLimitFrom } from '@/utils/planLimit'
import { useFloatingBarSpace } from '@/composables/useFloatingBarSpace'
import { unlockPath } from '@/components/internal/shell/navModules'
import RosterService from '../services/RosterService'
import WhatsappService from '../services/WhatsappService'
import GuestCard from '../components/GuestCard.vue'
import GuestFormModal from '../components/GuestFormModal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import GuestImportModal from '../components/GuestImportModal.vue'
import RosterDownloadMenu from '../components/RosterDownloadMenu.vue'
import SendWizard from '../components/send/SendWizard.vue'
import { TABS, noCounts, personPayload } from '../utils/roster'
import { whatsappModuleState, retryErrorKey, isUnknownDelivery } from '../utils/whatsapp'
import { WIZARD_HANDLES_AUTOMATIC, batchProgress } from '../utils/sendWizard'
import { useBatchPolling } from '../composables/useBatchPolling'
import { parseEventDate } from '@/views/internal/dashboard/dashboardLogic'
import { DELIVERY_FILTERS, deliveryChips, deliveryOf } from '../utils/delivery'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const { success, error: showError } = useToast()
const eventsStore = useEventsStore()

const event = computed(() => eventsStore.activeEvent)
const canEdit = computed(() => ['owner', 'editor'].includes(event.value?.userRole))

const status = ref(TABS.some(tab => tab.value === route.query.status) ? route.query.status : 'all')
const delivery = ref(DELIVERY_FILTERS.includes(route.query.delivery) ? route.query.delivery : null)
const search = ref('')
const page = ref(1)
const families = ref([])
const meta = ref({ currentPage: 1, lastPage: 1, total: 0 })
const counts = ref(noCounts())
const eventLocale = ref('es')
const loading = ref(true)
const loadFailed = ref(false)
const saving = ref(false)

const formOpen = ref(false)
const importOpen = ref(false)
const editing = ref(null)
const confirming = ref(null)
const removing = ref(null)
const retrying = ref(null) // unknown-delivery message waiting for the organizer's confirmation
const retryBusy = ref(false)

// WhatsApp: the delivery of each family comes inside the roster row; the send dialog is still the old one (F3 replaces it).
// Dev-only mock of the module state (see whatsappMock.js); the import is dropped from production builds.
const mockState = ref(null)
if (import.meta.env.DEV && import.meta.env.VITE_WHATSAPP_MOCK) {
  import('../services/whatsappMock').then(m => { mockState.value = m.mockModuleState() })
}
const moduleState = computed(() => mockState.value ?? whatsappModuleState(event.value))
const waLocked = computed(() => moduleState.value === 'locked')
const waAutomatic = computed(() => !waLocked.value && moduleState.value !== 'off')
// The wizard drives both modes: automatic when the WhatsApp module is on and unlocked, manual otherwise (module off or locked).
const wizardMode = computed(() => (waAutomatic.value && WIZARD_HANDLES_AUTOMATIC ? 'automatic' : 'manual'))
const wizardOpen = ref(false)
const wizardResume = ref(false)
const reloadToken = ref(0)
const sendIds = ref([])
let pollTimer

const deliveryOfRow = family => deliveryOf(family)

/** One family from its menu: the wizard (or the old dialog) opens with her preselected. */
function sendTo(family) {
  sendIds.value = [family.id]
  wizardResume.value = false
  wizardOpen.value = true
}

function openSend() {
  sendIds.value = []
  wizardResume.value = false
  wizardOpen.value = true
}

// A send in flight (automatic mode): the banner follows its batch and reopens the wizard on its progress.
const activeBatchId = ref(null)
const tracker = useBatchPolling(() => WhatsappService.batch(event.value.id, activeBatchId.value))
const banner = computed(() => (activeBatchId.value && tracker.batch.value && tracker.batch.value.queued > 0 ? batchProgress(tracker.batch.value) : null))

async function checkActiveBatch() {
  if (wizardMode.value !== 'automatic' || !canEdit.value || !event.value?.id) return
  try {
    const active = await WhatsappService.activeBatch(event.value.id)
    activeBatchId.value = active?.batchId ?? null
    if (active) tracker.start()
    else tracker.stop()
  } catch {
    activeBatchId.value = null
  }
}

watch(wizardMode, checkActiveBatch)
watch(() => tracker.batch.value?.queued, queued => {
  if (queued === 0 && activeBatchId.value) {
    activeBatchId.value = null
    tracker.stop()
    load({ silent: true })
  }
})

function resumeSend() {
  sendIds.value = []
  wizardResume.value = true
  wizardOpen.value = true
}

const eventDateLabel = computed(() => {
  const date = parseEventDate(event.value?.startDate)
  return date ? new Intl.DateTimeFormat(locale.value, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date) : ''
})

/** The wizard asks to fix a guest's phone: the same form as the list, over the wizard. */
async function editFromWizard(guest) {
  let family = families.value.find(f => f.id === guest.id)
  if (!family) {
    try {
      family = (await RosterService.list(event.value.id, { search: guest.name, perPage: 100 })).data.find(f => f.id === guest.id)
    } catch {
      family = null
    }
  }
  if (family) openForm(family)
  else showError(t('app.roster.listLoadError'))
}

function wizardClosed() {
  sendIds.value = []
  wizardResume.value = false
  load({ silent: true })
  checkActiveBatch()
}

function publishFromWizard() {
  wizardOpen.value = false
  router.push({ name: 'edit-event', params: { id: event.value.id } })
}

function goUnlock() {
  wizardOpen.value = false
  router.push(unlockPath('whatsapp'))
}

async function doRetry(message) {
  retryBusy.value = true
  try {
    await WhatsappService.retry(event.value.id, message.id)
    success(t('app.whatsapp.retried'))
    await load({ silent: true })
  } catch (e) {
    showError(t(`app.whatsapp.errors.${retryErrorKey(e)}`))
  } finally {
    retryBusy.value = false
    retrying.value = null
  }
}

// The message may have arrived (unknown_delivery): ask before sending it twice.
const retryMessage = message => (isUnknownDelivery(message) ? (retrying.value = message) : doRetry(message))

let loadId = 0
/** `silent` reloads without the skeleton (the background look at messages still in flight). */
async function load({ silent = false } = {}) {
  if (!event.value?.id) return
  const id = ++loadId
  if (!silent) loading.value = true
  try {
    const result = await RosterService.list(event.value.id, { status: status.value, search: search.value.trim(), delivery: delivery.value, page: page.value })
    if (id !== loadId) return
    families.value = result.data
    meta.value = result.meta
    counts.value = { ...noCounts(), ...result.counts }
    eventLocale.value = result.eventLocale ?? 'es'
    loadFailed.value = false
    schedulePoll()
  } catch {
    if (id === loadId) {
      loadFailed.value = true
      if (!silent) showError(t('app.roster.listLoadError'))
    }
  } finally {
    if (id === loadId) loading.value = false
  }
}

/** Messages in flight (queued) change by themselves: look again until they settle. `sent` can wait for ever, so it does not count. */
function schedulePoll() {
  clearTimeout(pollTimer)
  if (families.value.some(f => f.delivery?.state === 'queued')) pollTimer = setTimeout(() => load({ silent: true }), 5000)
}
onBeforeUnmount(() => clearTimeout(pollTimer))

// Phones: the send button sits in the flow under the title; the fixed bar only appears once it has scrolled away, so it
// never covers the first card of the list. Without IntersectionObserver the bar is simply always there.
const inlineSend = ref(null)
const inlineSendVisible = ref(false)
const sendBar = ref(null)
// The assistant's "next step" button lifts above this bar (it measures it through the shared registry).
useFloatingBarSpace(sendBar)
let sendObserver
// The button exists only once the list has people: observe it when it appears.
watch(inlineSend, el => {
  sendObserver?.disconnect()
  inlineSendVisible.value = false
  if (!el || typeof IntersectionObserver === 'undefined') return
  sendObserver = new IntersectionObserver(([entry]) => (inlineSendVisible.value = entry.isIntersecting))
  sendObserver.observe(el)
})
onBeforeUnmount(() => sendObserver?.disconnect())

let timer
watch(search, () => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    page.value = 1
    load()
  }, 300)
})
onBeforeUnmount(() => clearTimeout(timer))
function syncQuery() {
  const query = {}
  if (status.value !== 'all') query.status = status.value
  if (delivery.value) query.delivery = delivery.value
  router.replace({ query })
}
watch([status, delivery], () => {
  page.value = 1
  syncQuery()
  load()
})
watch(page, load)
watch(() => event.value?.id, () => {
  load()
  checkActiveBatch()
})
onMounted(() => {
  load()
  checkActiveBatch()
})

const tabs = computed(() => TABS.map(tab => ({ value: tab.value, label: t(`app.roster.tabs.${tab.value}`), count: counts.value[tab.count] })))
const answered = computed(() => counts.value.attending + counts.value.notAttending)
const filtered = computed(() => !!search.value.trim() || status.value !== 'all' || !!delivery.value)
/** Nobody on the list yet (and not because of a filter or an error): import is the main way in, so the toolbar buttons give way to the empty state (ORG-011). */
const emptyList = computed(() => !loading.value && !loadFailed.value && !filtered.value && !families.value.length)
/** Over the plan's guest limit: a soft red chip under the title says "39 of 30" at a glance (ORG-013). */
const overLimit = computed(() => !!counts.value.limit && counts.value.all > counts.value.limit)
const chips = computed(() => (counts.value.delivery ? deliveryChips(counts.value.delivery, { automatic: waAutomatic.value }) : []))
const unsent = computed(() => counts.value.delivery?.unsent ?? 0)
const canSend = computed(() => canEdit.value && counts.value.all > 0)
const toggleChip = value => (delivery.value = delivery.value === value ? null : value)
const percent = computed(() => (counts.value.all ? Math.round((answered.value / counts.value.all) * 100) : 0))
const counter = computed(() => (counts.value.limit ? t('app.roster.counterLimit', { n: counts.value.all, limit: counts.value.limit }) : t('app.roster.counter', { n: counts.value.all }, counts.value.all)))

/** After a change the event's own count (the limit banner reads it) is refreshed too. */
async function refresh() {
  await load()
  eventsStore.fetchEvent(event.value.id).catch(() => {})
}

function openForm(family = null) {
  editing.value = family
  formOpen.value = true
}

async function save({ person, companions, removed }) {
  saving.value = true
  const eventId = event.value.id
  try {
    if (editing.value) {
      await RosterService.update(eventId, editing.value.id, personPayload(person))
      for (const id of removed) await RosterService.remove(eventId, id)
      for (const companion of companions) {
        if (companion.id) await RosterService.update(eventId, companion.id, { name: companion.name })
        else await RosterService.addCompanion(eventId, editing.value.id, { name: companion.name })
      }
    } else {
      await RosterService.create(eventId, { guest: personPayload(person), companions: companions.map(c => ({ name: c.name })) })
    }
    formOpen.value = false
    success(t('app.roster.saved'))
    reloadToken.value += 1
    await refresh()
  } catch (e) {
    const limit = planLimitFrom(e)
    showError(limit ? t('app.roster.limitReached', { limit: limit.limit }) : t('app.roster.saveError'))
    await refresh()
  } finally {
    saving.value = false
  }
}

async function saveConfirm(answers) {
  saving.value = true
  try {
    await RosterService.confirm(event.value.id, confirming.value.id, answers)
    confirming.value = null
    success(t('app.roster.confirmed'))
    await refresh()
  } catch {
    showError(t('app.roster.saveError'))
  } finally {
    saving.value = false
  }
}

async function revert(family) {
  try {
    await RosterService.revert(event.value.id, family.id)
    success(t('app.roster.reverted'))
    await refresh()
  } catch {
    showError(t('app.roster.saveError'))
  }
}

/** Optimistic: the select changes at once and goes back to what it was if the server refuses. */
async function changeLocale(family, next) {
  const previous = { locale: family.locale, effectiveLocale: family.effectiveLocale }
  family.locale = next
  family.effectiveLocale = next || eventLocale.value
  try {
    const row = await RosterService.setLocale(event.value.id, family.id, next)
    family.locale = row.locale
    family.effectiveLocale = row.effectiveLocale
    success(t('app.roster.locale.saved'))
  } catch {
    Object.assign(family, previous)
    showError(t('app.roster.locale.error'))
  }
}

async function confirmRemove() {
  saving.value = true
  try {
    await RosterService.remove(event.value.id, removing.value.id)
    removing.value = null
    success(t('app.roster.removed'))
    if (families.value.length === 1 && page.value > 1) page.value -= 1
    await refresh()
  } catch {
    showError(t('app.roster.saveError'))
  } finally {
    saving.value = false
  }
}

async function copyLink(family) {
  try {
    await navigator.clipboard.writeText(family.link)
    success(t('app.roster.copied'))
  } catch {
    showError(t('app.roster.copyError'))
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl" :class="canSend && !inlineSendVisible && 'pb-[calc(12.5rem+env(safe-area-inset-bottom))] sm:pb-0'">
    <UiPageHeader :title="t('app.roster.title')" :subtitle="counter">
      <template v-if="canEdit" #actions>
        <div v-if="canSend" class="hidden sm:block">
          <UiButton data-testid="send-header" @click="openSend">
            <Send class="h-4 w-4" aria-hidden="true" />
            {{ t('app.roster.sendInvitations') }}
            <span v-if="unsent" class="rounded-full bg-black/20 px-2 py-0.5 text-xs">{{ unsent }}</span>
          </UiButton>
        </div>
      </template>
    </UiPageHeader>
    <UiBadge v-if="overLimit" tone="danger" class="-mt-3 mb-4" data-testid="over-limit-chip">{{ t('app.roster.overLimitChip', { n: counts.all, limit: counts.limit }) }}</UiBadge>
    <div v-if="canSend" ref="inlineSend" class="mb-4 sm:hidden" data-testid="send-inline">
      <UiButton block @click="openSend">
        <Send class="h-4 w-4" aria-hidden="true" />
        {{ unsent ? t('app.roster.sendInvitationsCount', { n: unsent }) : t('app.roster.sendInvitations') }}
      </UiButton>
    </div>
    <GuestLimitBanner />

    <!-- A send in flight (automatic mode): the batch keeps going in the server; this brings its progress back. -->
    <section v-if="banner && !wizardOpen" class="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-3.5" role="status" aria-live="polite" data-testid="send-banner">
      <div class="flex items-center justify-between gap-3">
        <p class="text-sm font-medium text-ink-900">{{ t('app.roster.activeBatch', { done: banner.processed, total: banner.total }) }}</p>
        <UiButton size="sm" variant="secondary" data-testid="send-banner-view" @click="resumeSend">{{ t('app.roster.activeBatchView') }}</UiButton>
      </div>
      <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-white" role="progressbar" :aria-valuenow="banner.processed" aria-valuemin="0" :aria-valuemax="banner.total" :aria-label="t('app.roster.activeBatch', { done: banner.processed, total: banner.total })">
        <div class="h-full origin-left rounded-full bg-rose-600 transition-transform duration-300 ease-out motion-reduce:transition-none" :style="{ transform: `scaleX(${banner.percent / 100})` }" />
      </div>
    </section>

    <!-- The progress card appears with the first answer; when the event is known to have guests its place is held meanwhile
         (otherwise the filters jump down when the list arrives). -->
    <div
      v-if="!counts.all && loading && (event?.guestsCount ?? 0) > 0"
      class="h-[7.15rem] rounded-2xl border border-line bg-white"
      aria-hidden="true"
      data-testid="progress-placeholder"
    />
    <section v-if="counts.all" class="rounded-2xl border border-line bg-white p-3.5 sm:p-4" :aria-label="t('app.roster.progress.label')">
      <div class="flex items-baseline justify-between gap-3">
        <p class="font-heading text-lg text-ink-900">{{ t('app.roster.progress.answered', { n: answered, total: counts.all }) }}</p>
        <p class="text-sm font-medium text-ink-700">{{ percent }}%</p>
      </div>
      <div class="mt-3 h-2 overflow-hidden rounded-full bg-cream-100" role="progressbar" :aria-valuenow="percent" aria-valuemin="0" aria-valuemax="100" :aria-label="t('app.roster.progress.label')">
        <div class="h-full origin-left rounded-full bg-rose-600 transition-transform duration-500 ease-out" :style="{ transform: `scaleX(${percent / 100})` }" />
      </div>
      <p class="mt-3 text-sm text-ink-500">{{ t('app.roster.progress.detail', { yes: counts.attending, no: counts.notAttending, pending: counts.pending }) }}</p>
    </section>

    <!-- Filters first: they decide which families the list shows; nothing below them acts on a selection. -->
    <div class="mt-5 flex flex-col gap-3">
      <div class="relative">
        <Search class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" aria-hidden="true" />
        <input
          v-model="search"
          type="search"
          autocomplete="off"
          :aria-label="t('app.roster.search')"
          :placeholder="t('app.roster.search')"
          class="h-11 w-full rounded-xl border border-line-strong bg-white pl-10 pr-3 text-base text-ink-900 placeholder:text-ink-500 focus-visible:outline-2 focus-visible:outline-rose-600"
        />
      </div>

      <div v-if="!emptyList" role="group" :aria-label="t('app.roster.filters.answers')">
        <UiTabs v-model="status" :tabs="tabs" />
      </div>

      <div v-if="chips.length && !emptyList" class="flex flex-wrap items-center gap-2" role="group" :aria-label="t('app.roster.filters.delivery')" data-testid="delivery-chips">
        <span class="text-sm font-medium text-ink-500">{{ t('app.roster.filters.delivery') }}</span>
        <button
          v-for="chip in chips"
          :key="chip.value"
          type="button"
          :aria-pressed="delivery === chip.value"
          class="inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
          :class="delivery === chip.value ? 'border-ink-900 bg-ink-900 text-white' : chip.value === 'problem' && chip.count ? 'border-danger-500/40 bg-danger-50 text-danger-700 hover:bg-danger-50' : 'border-line-strong bg-white text-ink-700 hover:bg-cream-100'"
          @click="toggleChip(chip.value)"
        >
          {{ t(`app.roster.delivery.${chip.key}`) }}
          <span class="rounded-full px-1.5 text-xs font-semibold tabular-nums" :class="delivery === chip.value ? 'bg-white/20' : 'bg-cream-200'">{{ chip.count }}</span>
        </button>
      </div>
    </div>

    <div v-if="!emptyList && (canEdit || (event?.id && counts.all))" class="mt-4 flex flex-wrap items-center gap-2">
      <div v-if="!counts.all && loading && (event?.guestsCount ?? 0) > 0" class="h-11 w-36" aria-hidden="true" data-testid="download-placeholder" />
      <template v-if="canEdit">
        <UiButton variant="secondary" @click="openForm()">
          <Plus class="h-4 w-4" aria-hidden="true" />
          {{ t('app.roster.add') }}
        </UiButton>
        <UiButton variant="secondary" @click="importOpen = true">
          <FileSpreadsheet class="h-4 w-4" aria-hidden="true" />
          {{ t('app.guestImport.button') }}
        </UiButton>
      </template>
      <RosterDownloadMenu v-if="event?.id && counts.all" :event-id="event.id" :status="status" :search="search" />
    </div>

    <div v-if="loading && !families.length" class="mt-5 space-y-3" data-testid="list-skeleton" aria-hidden="true">
      <div v-for="n in 3" :key="n" class="flex gap-3 rounded-2xl border border-line bg-white p-3">
        <UiSkeleton circle width="2.5rem" height="2.5rem" class="shrink-0" />
        <div class="flex-1 space-y-2 pt-1">
          <UiSkeleton width="45%" height="1.1rem" />
          <UiSkeleton width="30%" height="0.8rem" />
          <UiSkeleton width="25%" height="1.2rem" />
        </div>
      </div>
    </div>

    <UiEmptyState
      v-else-if="loadFailed && !families.length"
      class="mt-8"
      :title="t('app.roster.listLoadError')"
      :description="t('app.roster.loadError')"
    >
      <UiButton variant="secondary" @click="load()">{{ t('app.roster.retryLoad') }}</UiButton>
    </UiEmptyState>

    <UiEmptyState
      v-else-if="!families.length"
      class="mt-8"
      :title="t(filtered ? 'app.roster.noResultsTitle' : 'app.roster.emptyTitle')"
      :description="t(filtered ? 'app.roster.noResultsText' : 'app.roster.emptyText')"
    >
      <div v-if="canEdit && !filtered" class="flex flex-col items-stretch gap-2 sm:flex-row sm:justify-center">
        <UiButton @click="importOpen = true">
          <FileSpreadsheet class="h-4 w-4" aria-hidden="true" />
          {{ t('app.roster.importExcel') }}
        </UiButton>
        <UiButton variant="secondary" @click="openForm()">
          <Plus class="h-4 w-4" aria-hidden="true" />
          {{ t('app.roster.addOne') }}
        </UiButton>
      </div>
    </UiEmptyState>

    <ul v-else class="mt-5 space-y-3 transition-opacity duration-150" :class="loading && 'opacity-50'" :aria-busy="loading">
      <li v-for="family in families" :key="family.id">
        <GuestCard
          :family="family"
          :can-edit="canEdit"
          :event-locale="eventLocale"
          :delivery="deliveryOfRow(family)"
          @retry="retryMessage"
          @edit="openForm"
          @confirm="confirming = $event"
          @revert="revert"
          @remove="removing = $event"
          @send="sendTo"
          @copy="copyLink"
          @locale="changeLocale"
        />
      </li>
    </ul>

    <UiPagination v-if="meta.lastPage > 1" :page="page" :pages="meta.lastPage" class="mt-6" @update:page="page = $event" />

    <!-- Phones: once the inline button has scrolled away, the main action stays in reach, right above the bottom navigation.
         It declares itself through useFloatingBarSpace, so the assistant's "next step" pill lifts above it instead. -->
    <div
      v-if="canSend && !inlineSendVisible"
      ref="sendBar"
      class="pointer-events-none fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-20 px-4 sm:hidden"
      data-testid="send-bar"
    >
      <UiButton block class="pointer-events-auto shadow-pop" @click="openSend">
        <Send class="h-4 w-4" aria-hidden="true" />
        {{ unsent ? t('app.roster.sendInvitationsCount', { n: unsent }) : t('app.roster.sendInvitations') }}
      </UiButton>
    </div>

    <GuestImportModal v-if="event" v-model:open="importOpen" :event-id="event.id" @imported="refresh" />
    <SendWizard
      v-if="event"
      v-model:open="wizardOpen"
      :event-id="event.id"
      :event-name="event.eventName ?? ''"
      :event-date-label="eventDateLabel"
      :locked="waLocked"
      :mode="wizardMode"
      :can-edit="canEdit"
      :preselected-ids="sendIds"
      :reload-token="reloadToken"
      :resume="wizardResume"
      @closed="wizardClosed"
      @sent="checkActiveBatch"
      @unlock="goUnlock"
      @publish="publishFromWizard"
      @edit-guest="editFromWizard"
      @add-guest="wizardOpen = false; openForm()"
    />
    <GuestFormModal v-model:open="formOpen" :family="editing" :saving="saving" @save="save" />
    <ConfirmModal :open="!!confirming" :family="confirming" :saving="saving" @update:open="confirming = null" @save="saveConfirm" />

    <UiModal :open="!!retrying" :title="t('app.whatsapp.retryConfirm.title')" size="sm" @update:open="retrying = null">
      <p class="text-ink-700">{{ t('app.whatsapp.retryConfirm.body') }}</p>
      <template #footer>
        <UiButton variant="ghost" :disabled="retryBusy" @click="retrying = null">{{ t('app.roster.cancel') }}</UiButton>
        <UiButton :loading="retryBusy" @click="doRetry(retrying)">{{ t('app.whatsapp.retryConfirm.send') }}</UiButton>
      </template>
    </UiModal>

    <UiModal :open="!!removing" :title="t('app.roster.removeTitle')" size="sm" @update:open="removing = null">
      <p class="text-ink-700">{{ t('app.roster.removeBody', { name: removing?.name ?? '', n: removing?.companions?.length ?? 0 }, removing?.companions?.length ?? 0) }}</p>
      <template #footer>
        <UiButton variant="ghost" @click="removing = null">{{ t('app.roster.cancel') }}</UiButton>
        <UiButton variant="danger" :loading="saving" @click="confirmRemove">{{ t('app.roster.menu.remove') }}</UiButton>
      </template>
    </UiModal>
  </div>
</template>
