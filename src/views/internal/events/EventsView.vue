<template>
  <section>
    <div class="flex items-center justify-between mb-6">
      <CHeading :level="2" weight="bold">My Events</CHeading>
      <CButton variant="gradient" @click="createNewEvent">
        + Create New Event
      </CButton>
    </div>

    <div v-if="activeEvent" class="mb-8">
      <CHeading :level="5" class="mb-2 text-primary">Active Event</CHeading>
      <CCard variant="feature">
        <template #title>{{ activeEvent.eventName }}</template>
        <template #content>
          <p class="text-sm text-text-light">{{ activeEvent.eventDescription }}</p>
          <p class="text-xs text-gray-400 mt-1">
            {{ formatDate(activeEvent.startDate) }} – {{ formatDate(activeEvent.endDate) }}
          </p>
        </template>
        <template #cta>
          <CButton @click="goToDashboard">Go to Dashboard</CButton>
        </template>
      </CCard>
    </div>

    <div>
      <CHeading :level="5" class="mb-4">Other Events</CHeading>
      <div
        v-if="otherEvents.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <CCard
          v-for="event in otherEvents"
          :key="event.id"
          variant="feature"
        >
          <template #title>{{ event.eventName }}</template>
          <template #content>
            <p class="text-sm text-text-light line-clamp-3">{{ event.eventDescription }}</p>
            <p class="text-xs text-gray-400 mt-1">
              {{ event.startDate }} – {{ event.endDate }}
            </p>
          </template>
          <template #cta>
            <CButton variant="outline" @click="switchToEvent(event)">Switch</CButton>
          </template>
        </CCard>
      </div>
      <div v-else class="col-span-1">
        <CAlert variant="info">
          <template #message>
            <p class="text-sm text-text-light">You have no other events.</p>
          </template>
        </CAlert>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useEventsStore } from '@/stores/useEventsStore'
import CCard from '@/components/UI/cards/CCard.vue'
import CHeading from '@/components/UI/headings/CHeading.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import { useRouter } from 'vue-router'
import CAlert from '@/components/UI/alerts/CAlert.vue'

const eventsStore = useEventsStore()
const router = useRouter()

const activeEvent = computed(() => eventsStore.activeEvent)
const otherEvents = computed(() =>
  eventsStore.events.filter(e => e.id !== eventsStore.activeEvent?.id)
)

function switchToEvent(event) {
  // eventsStore.setCurrentEvent(event)
  router.push('/dashboard')
}

function createNewEvent() {
  router.push('/dashboard/events/create')
}

function goToDashboard() {
  router.push('/dashboard')
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>
