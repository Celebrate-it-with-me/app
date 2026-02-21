<script setup>
import CwmAlert from '@/components/UI/alerts/CWMAlert.vue'
import CreateEvent from '@/components/authenticated/events/CreateEvent.vue'
import ShowEvent from '@/components/authenticated/events/ShowEvent.vue'
import MyEventsList from '@/components/authenticated/events/MyEventsList.vue'
import { computed, onMounted, ref } from 'vue'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'

// Data
const activeView = ref('none')
const eventsStore = useEventsStore()

onMounted(() => {
  handleCancelCreate()
})

const handleCreateEvent = () => {
  eventsStore.currentEvent = null
  activeView.value = 'create'
}

const handleCancelCreate = () => {
  if (eventsStore.currentEvent) {
    activeView.value = 'showEvent'
  } else {
    activeView.value = 'none'
  }
}

const handleEditEvent = () => {
  activeView.value = 'edit'
}

const handleShowEvent = () => {
  activeView.value = 'showEvent'
}

const eventMessage = computed(() => {
  if (!eventsStore.events.length) {
    return "You don't have any event yet, please click in 'Add new event' to start"
  }

  if (!eventsStore.currentEvent) {
    return 'Please select one event to work on it!'
  }

  return ''
})
</script>

<template>
  <section class="my-events">
    <section
      class="my-events-container flex flex-row gap-x-4 mt-2 border-2 border-gray-200/10 p-5 rounded-md min-h-[600px] h-full"
    >
      <MyEventsList @create-event="handleCreateEvent" @selected-event="handleShowEvent" />

      <div class="event-handle w-[70%]">
        <ShowEvent v-if="activeView === 'showEvent'" @edit-event="handleEditEvent" />

        <div v-else-if="['create', 'edit'].includes(activeView)" class="w-full">
          <CreateEvent :mode="activeView" @cancel-create="handleCancelCreate" />
        </div>

        <CwmAlert v-else-if="activeView === 'none'" alert-type="info">
          {{ eventMessage.length ? eventMessage : 'There is no event selected' }}
        </CwmAlert>
      </div>
    </section>
  </section>
</template>

<style scoped></style>
