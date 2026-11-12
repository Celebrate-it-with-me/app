<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Plus, Search } from 'lucide-vue-next'
import { UiPageHeader, UiButton, UiTabs, UiSkeleton, UiEmptyState, UiModal, UiPagination, useToast } from '@/ui'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import GuestLimitBanner from '@/components/internal/limits/GuestLimitBanner.vue'
import { planLimitFrom } from '@/utils/planLimit'
import RosterService from '../services/RosterService'
import GuestCard from '../components/GuestCard.vue'
import GuestFormModal from '../components/GuestFormModal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import { TABS, noCounts, personPayload, whatsappUrl } from '../utils/roster'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { success, error: showError } = useToast()
const eventsStore = useEventsStore()

const event = computed(() => eventsStore.activeEvent)
const canEdit = computed(() => ['owner', 'editor'].includes(event.value?.userRole))

const status = ref(TABS.some(tab => tab.value === route.query.status) ? route.query.status : 'all')
const search = ref('')
const page = ref(1)
const families = ref([])
const meta = ref({ currentPage: 1, lastPage: 1, total: 0 })
const counts = ref(noCounts())
const loading = ref(true)
const saving = ref(false)

const formOpen = ref(false)
const editing = ref(null)
const confirming = ref(null)
const removing = ref(null)

let loadId = 0
async function load() {
  if (!event.value?.id) return
  const id = ++loadId
  loading.value = true
  try {
    const result = await RosterService.list(event.value.id, { status: status.value, search: search.value.trim(), page: page.value })
    if (id !== loadId) return
    families.value = result.data
    meta.value = result.meta
    counts.value = result.counts
  } catch {
    if (id === loadId) showError(t('app.roster.loadError'))
  } finally {
    if (id === loadId) loading.value = false
  }
}

let timer
watch(search, () => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    page.value = 1
    load()
  }, 300)
})
onBeforeUnmount(() => clearTimeout(timer))
watch(status, value => {
  page.value = 1
  router.replace({ query: value === 'all' ? {} : { status: value } })
  load()
})
watch(page, load)
watch(() => event.value?.id, load)
onMounted(load)

const tabs = computed(() => TABS.map(tab => ({ value: tab.value, label: t(`app.roster.tabs.${tab.value}`), count: counts.value[tab.count] })))
const answered = computed(() => counts.value.attending + counts.value.notAttending)
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

const shareText = family => t('app.roster.shareText', { name: family.name, event: event.value?.eventName ?? '', link: family.link })
const openWhatsapp = family => window.open(whatsappUrl(family.phone, shareText(family)), '_blank', 'noopener')
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
  <div class="mx-auto max-w-3xl">
    <UiPageHeader :title="t('app.roster.title')" :subtitle="counter" />
    <GuestLimitBanner class="mt-4" />

    <section v-if="counts.all" class="mt-5 rounded-2xl border border-line bg-white p-4" :aria-label="t('app.roster.progress.label')">
      <div class="flex items-baseline justify-between gap-3">
        <p class="font-heading text-lg text-ink-900">{{ t('app.roster.progress.answered', { n: answered, total: counts.all }) }}</p>
        <p class="text-sm font-medium text-ink-700">{{ percent }}%</p>
      </div>
      <div class="mt-3 h-2 overflow-hidden rounded-full bg-cream-100" role="progressbar" :aria-valuenow="percent" aria-valuemin="0" aria-valuemax="100" :aria-label="t('app.roster.progress.label')">
        <div class="h-full origin-left rounded-full bg-rose-600 transition-transform duration-500 ease-out" :style="{ transform: `scaleX(${percent / 100})` }" />
      </div>
      <p class="mt-3 text-sm text-ink-500">{{ t('app.roster.progress.detail', { yes: counts.attending, no: counts.notAttending, pending: counts.pending }) }}</p>
    </section>

    <div class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div class="relative flex-1">
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
      <UiButton v-if="canEdit" @click="openForm()">
        <Plus class="h-4 w-4" aria-hidden="true" />
        {{ t('app.roster.add') }}
      </UiButton>
    </div>

    <div class="mt-4 overflow-x-auto">
      <UiTabs v-model="status" :tabs="tabs" />
    </div>

    <div v-if="loading && !families.length" class="mt-5 space-y-3">
      <UiSkeleton class="h-24" />
      <UiSkeleton class="h-24" />
      <UiSkeleton class="h-24" />
    </div>

    <UiEmptyState
      v-else-if="!families.length"
      class="mt-8"
      :title="t(search || status !== 'all' ? 'app.roster.noResultsTitle' : 'app.roster.emptyTitle')"
      :description="t(search || status !== 'all' ? 'app.roster.noResultsText' : 'app.roster.emptyText')"
    >
      <UiButton v-if="canEdit && !search && status === 'all'" @click="openForm()">{{ t('app.roster.add') }}</UiButton>
    </UiEmptyState>

    <ul v-else class="mt-5 space-y-3" :aria-busy="loading">
      <li v-for="family in families" :key="family.id">
        <GuestCard
          :family="family"
          :can-edit="canEdit"
          @edit="openForm"
          @confirm="confirming = $event"
          @revert="revert"
          @remove="removing = $event"
          @whatsapp="openWhatsapp"
          @copy="copyLink"
        />
      </li>
    </ul>

    <UiPagination v-if="meta.lastPage > 1" :page="page" :pages="meta.lastPage" class="mt-6" @update:page="page = $event" />

    <GuestFormModal v-model:open="formOpen" :family="editing" :saving="saving" @save="save" />
    <ConfirmModal :open="!!confirming" :family="confirming" :saving="saving" @update:open="confirming = null" @save="saveConfirm" />

    <UiModal :open="!!removing" :title="t('app.roster.removeTitle')" size="sm" @update:open="removing = null">
      <p class="text-ink-700">{{ t('app.roster.removeBody', { name: removing?.name ?? '', n: removing?.companions?.length ?? 0 }, removing?.companions?.length ?? 0) }}</p>
      <template #footer>
        <UiButton variant="ghost" @click="removing = null">{{ t('app.roster.cancel') }}</UiButton>
        <UiButton variant="danger" :loading="saving" @click="confirmRemove">{{ t('app.roster.menu.remove') }}</UiButton>
      </template>
    </UiModal>
  </div>
</template>
