<script setup>
import CWMLoading from '@/components/UI/loading/CWMLoading.vue'
import { onMounted, ref } from 'vue'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { useRsvpStore } from '@/stores/useRsvpStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import RsvpTemplates from '@/components/authenticated/rsvp/RsvpTemplates/RsvpTemplates.vue'

const loading = ref(true)
const eventStore = useEventsStore()
const rsvpStore = useRsvpStore()
const notificationStore = useNotificationStore()

onMounted(() => {
  loadRsvp()
})

const loadRsvp = async () => {
  try {
    loading.value = true
    const response = await rsvpStore.loadRsvp({ eventId: eventStore.currentEvent?.id })

    if (response.status === 200) {
      notificationStore.addNotification({
        message: 'RSVP loaded successfully!'
      })

      const rsvpData = response.data?.data ?? []

      if (rsvpData.length > 0) {
        rsvpStore.loaded = true
      } else {
        rsvpStore.title = rsvpData.title
        rsvpStore.description = rsvpData.description
        rsvpStore.customFields = rsvpData.customFields
        rsvpStore.confirmationDeadline = rsvpData.confirmationDeadline
      }
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="event-rsvp">
    <div
      class="my-events-container mt-2 border-2 border-gray-200/10 p-10 rounded-md min-h-[300px] h-full"
    >
      <CWMLoading
        v-if="loading"
        :loader-classes="'w-full flex flex-row justify-center items-center'"
        :loader-fill="'fill-gray-800'"
      />
      <RsvpTemplates v-else />
    </div>
  </section>
</template>

<style scoped></style>
