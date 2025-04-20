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

      <ActiveEventCard
        :active-event="activeEvent"
      />
    </div>

    <div>
      <CHeading :level="5" class="mb-4">Other Events</CHeading>
      <div
        v-if="otherEvents.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <OtherEventCard
          v-for="event in otherEvents"
          :key="event.id"
          :event="event"
          @switch-event="switchToEvent"
        />
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
import CHeading from '@/components/UI/headings/CHeading.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import { useRouter } from 'vue-router'
import CAlert from '@/components/UI/alerts/CAlert.vue'
import OtherEventCard from '@/views/internal/events/OtherEventCard.vue'
import ActiveEventCard from '@/views/internal/events/ActiveEventCard.vue'

const eventsStore = useEventsStore()
const router = useRouter()

const activeEvent = computed(() => eventsStore.activeEvent)
const otherEvents = computed(() =>
  eventsStore.events.filter(e => e.id !== eventsStore.activeEvent?.id)
)

const switchToEvent = async (event) => {
  try {
    await eventsStore.setActiveEvent(event)

  } catch (error) {
    console.error('Error switching event:', error)
  }
}

function createNewEvent() {
  router.push('/events/create')
}

</script>
