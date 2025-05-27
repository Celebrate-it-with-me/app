<template>
  <CModal v-model="showModal" :showCloseIcon="!!activeEvent">
    <template #title>
      <CHeading :level="3" weight="bold" color="text-primary"> Welcome back </CHeading>
    </template>
    <div class="events-container">
      <div class="active__event-section">
        <div v-if="activeEvent" class="mb-6">
          <CHeading :level="5" class="mb-2">Active Event</CHeading>
          <CCard variant="feature">
            <template #title>
              {{ activeEvent.eventName }}
            </template>
            <template #content>
              <p class="text-sm text-text-light">{{ activeEvent.eventDescription }}</p>
              <p class="text-xs text-gray-400 mt-1">
                {{ `${activeEvent?.startDate} - ${activeEvent?.endDate}` }}
              </p>
            </template>
            <template #cta>
              <CButton class="mt-4" @click="selectEvent(activeEvent)">Continue</CButton>
            </template>
          </CCard>
        </div>
        <div v-else>
          <CAlert variant="info">
            There is no active event. Please select an event to continue or create a new one.
          </CAlert>
        </div>
      </div>

      <div v-if="otherEvents.length" class="mt-2 others__events-container">
        <CHeading :level="5" class="mb-2">
          <span v-if="activeEvent">Select other Event</span>
          <span v-else>Select an event</span>
        </CHeading>
        <div class="grid grid-cols-1 gap-4">
          <CCard v-for="event in otherEvents" :key="event.id" :padding="'p-4'" variant="feature">
            <div class="card__event-container flex flex-row justify-between items-center gap-2">
              <div class="title__and-description">
                <CHeading :level="5" weight="bold" color="text-text">
                  {{ event.eventName }}
                </CHeading>
                <div class="description">
                  <p class="text-sm text-text-light">{{ event.eventDescription }}</p>
                </div>
              </div>

              <div class="cta__button">
                <CButton variant="outline" @click="selectEvent(event)">Select</CButton>
              </div>
            </div>
          </CCard>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 mt-2">
        <CCard variant="feature">
          <div class="card__event-container flex flex-row justify-between items-center gap-2">
            <div class="title__and-description">
              <CHeading :level="5" weight="bold" color="text-text"> Create new Event </CHeading>
            </div>

            <div class="cta__button">
              <CButton variant="gradient" @click="createNewEvent">Create</CButton>
            </div>
          </div>
        </CCard>
      </div>

      <div v-if="pendingInvitations.length" class="grid grid-cols-1 gap-4 mt-2">
        <CHeading :level="5" class="mt-2" >Pending Invitations</CHeading>
        <CCard
          v-for="invitation in pendingInvitations"
          :key="invitation.event.id"
          variant="feature"
        >
          <div class="card__event-container flex flex-row justify-between items-center gap-2">
            <div class="title__and-description">
              <CHeading :level="5" weight="bold" color="text-text">
                {{ invitation.event.event_name }}
              </CHeading>
            </div>

            <div class="cta__button flex flex-col gap-2">
              <CButton variant="gradient" @click="acceptInvitation">Accept</CButton>
              <CButton variant="secondary" @click="decline(invitation)">Decline</CButton>
            </div>
          </div>
        </CCard>
      </div>
    </div>

    <template #footer>
      <CButton :disabled="!activeEvent" variant="outline" @click="close"> Close </CButton>
    </template>
  </CModal>
</template>

<script setup>
import CModal from '@/components/UI/modals/CModal.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import { computed, ref } from 'vue'
import CHeading from '@/components/UI/headings/CHeading.vue'
import CCard from '@/components/UI/cards/CCard.vue'
import { useEventsStore } from '@/stores/useEventsStore'
import CAlert from '@/components/UI/alerts/CAlert.vue'
import { useRouter } from 'vue-router'
import { useCollaboratorsStore } from '@/stores/useCollaboratorsStore'

const emit = defineEmits(['update:modelValue'])
const eventsStore = useEventsStore()
const router = useRouter()
const collaboratorsStore = useCollaboratorsStore()

const pendingInvitations = computed(() => {
  return collaboratorsStore?.invitations?.filter((invitation) => invitation.status === 'pending')
})

const activeEvent = computed(() => {
  return eventsStore.activeEvent ?? null
})

const otherEvents = computed(() => {
  if (!activeEvent.value) {
    return eventsStore.events
  }

  return eventsStore.events.filter((event) => event.id !== activeEvent.value.id)
})

const close = () => {
  emit('update:modelValue', false)
}

const showModal = ref(false)

const selectEvent = (event) => {
  eventsStore.setActiveEvent(event)
  close()
}

const createNewEvent = async () => {
  await router.push('dashboard/events/create')
  close()
}

const decline = async (invitation) => {
  try {
    await collaboratorsStore.declineInvitation({ invitation })
    await collaboratorsStore.loadInvitations()
  } catch (error) {
    console.error('Error declining invitation:', error)
  }
}
</script>

<style scoped>
.others__events-container {
  max-height: 300px;
  overflow-y: auto;
}
</style>
