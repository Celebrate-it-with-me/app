<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Plus, CalendarPlus, TriangleAlert } from 'lucide-vue-next'
import { UiPageHeader, UiButton, UiTabs, UiEmptyState, UiSkeleton, useToast } from '@/ui'
import { useEventsStore } from '../stores/useEventsStore'
import { sortEvents } from '../utils/eventList'
import EventCard from '../components/EventCard.vue'

const { t } = useI18n()
const router = useRouter()
const { success, error: showError } = useToast()
const eventsStore = useEventsStore()

const loading = ref(true)
const failed = ref(false)
const tab = ref('active')
const busyId = ref(null)

async function load() {
  loading.value = true
  failed.value = false
  const response = await eventsStore.initEvents()
  failed.value = response?.status !== 200
  loading.value = false
}

onMounted(async () => {
  await load()
  if (!eventsStore.eventTypes.length) await eventsStore.loadEventsPlansAndType()
})

const active = computed(() => sortEvents(eventsStore.activeEvents))
const archived = computed(() => sortEvents(eventsStore.inactiveEvents))
const tabs = computed(() => [
  { value: 'active', label: t('events.tabs.active'), count: active.value.length },
  { value: 'archived', label: t('events.tabs.archived'), count: archived.value.length }
])

async function open(event) {
  busyId.value = event.id
  try {
    await eventsStore.setActiveEvent(event)
    await router.push('/dashboard')
  } catch {
    showError(t('common.genericError'))
  } finally {
    busyId.value = null
  }
}

async function restore(event) {
  busyId.value = event.id
  try {
    await eventsStore.runEventAction(event.id, 'restore')
    success(t('events.publication.done.restore'))
    tab.value = 'active'
  } catch {
    showError(t('common.genericError'))
  } finally {
    busyId.value = null
  }
}
</script>

<template>
  <div>
    <UiPageHeader :title="t('events.title')" :subtitle="t('events.subtitle')">
      <template #actions>
        <UiButton to="/dashboard/events/create">
          <Plus class="h-4 w-4" aria-hidden="true" />
          {{ t('events.new') }}
        </UiButton>
      </template>
    </UiPageHeader>

    <div v-if="loading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
      <UiSkeleton v-for="n in 3" :key="n" height="13rem" />
    </div>

    <UiEmptyState v-else-if="failed" :title="t('events.loadError')">
      <template #icon><TriangleAlert class="h-6 w-6" /></template>
      <UiButton variant="secondary" @click="load">{{ t('events.retry') }}</UiButton>
    </UiEmptyState>

    <UiEmptyState
      v-else-if="!eventsStore.events.length"
      :title="t('events.empty.title')"
      :description="t('events.empty.text')"
    >
      <template #icon><CalendarPlus class="h-6 w-6" /></template>
      <UiButton to="/dashboard/events/create">{{ t('events.empty.cta') }}</UiButton>
    </UiEmptyState>

    <UiTabs v-else v-model="tab" :tabs="tabs">
      <template #active>
        <div v-if="active.length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <EventCard
            v-for="event in active"
            :key="event.id"
            :event="event"
            :active="event.id === eventsStore.activeEvent?.id"
            :busy="busyId === event.id"
            @open="open"
          />
        </div>
        <UiEmptyState v-else :title="t('events.empty.title')" :description="t('events.empty.text')" compact>
          <UiButton to="/dashboard/events/create">{{ t('events.empty.cta') }}</UiButton>
        </UiEmptyState>
      </template>
      <template #archived>
        <div v-if="archived.length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <EventCard
            v-for="event in archived"
            :key="event.id"
            :event="event"
            :busy="busyId === event.id"
            @restore="restore"
          />
        </div>
        <UiEmptyState v-else :title="t('events.empty.archivedTitle')" :description="t('events.empty.archivedText')" compact />
      </template>
    </UiTabs>
  </div>
</template>
