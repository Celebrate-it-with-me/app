<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { useUserStore } from '@/stores/useUserStore'
import { useNotificationStore } from '@/stores/useNotificationStore'

import CButton from '@/components/UI/buttons/CButton.vue'
import CCard from '@/components/UI/cards/CCard.vue'

import {
  Calendar,
  Music,
  Waves,
  ImageIcon,
  MessageSquareText,
  MapIcon,
  ExternalLink,
  Edit3,
  UserCircle
} from 'lucide-vue-next'
import CAddCollaboratorModal from '@/components/UI/modals/CAddCollaboratorModal.vue'

const route = useRoute()
const router = useRouter()
const eventStore = useEventsStore()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

const getUserRole = computed(() => {
  if (!event.value) return 'viewer'

  if (event.value.user_id === userStore.user?.id) {
    return 'owner'
  }

  if (event.value.collaborators && event.value.collaborators.length > 0) {
    const collaborator = event.value.collaborators.find(c => c.email === userStore.user?.email)
    if (collaborator) {
      return collaborator.role
    }
  }

  return 'viewer'
})

const event = ref(null)
const showCollaboratorModal = ref(false)

const fetchEvent = async () => {
  const id = route.params.id
  const fetched = eventStore.events.find(e => e.id === id)

  if (!fetched || fetched.user_id !== eventStore.currentUser?.id) {
    notificationStore.addNotification({
      type: 'error',
      message: 'You do not have access to this event.'
    })
    return router.push('/dashboard')
  }

  if (!fetched.collaborators) {
    fetched.collaborators = []
  }

  event.value = fetched
}

onMounted(fetchEvent)

const goToEdit = () => {
  router.push(`/dashboard/events/${event.value.id}/edit`)
}

const openPublicPage = () => {
  window.open(event.value.public_url, '_blank')
}

const openCollaboratorModal = () => {
  showCollaboratorModal.value = true
}

const removeCollaborator = collaboratorId => {
  event.value.collaborators = event.value.collaborators.filter(c => c.id !== collaboratorId)
  notificationStore.addNotification({
    type: 'success',
    message: 'Collaborator removed successfully'
  })
}

const formattedDates = computed(() => {
  const options = { dateStyle: 'medium', timeStyle: 'short' }
  return `${new Date(event.value.startDate).toLocaleString(undefined, options)} – ${new Date(event.value.endDate).toLocaleString(undefined, options)}`
})

const statusClass = computed(() => {
  return {
    'bg-green-100 text-green-800': event.value.status === 'active',
    'bg-yellow-100 text-yellow-800': event.value.status === 'draft',
    'bg-gray-200 text-gray-700': event.value.status === 'archived'
  }
})

const featureMap = {
  menu: { name: 'menu', label: 'Menu', icon: Calendar },
  rsvp: { name: 'rsvp', label: 'RSVP', icon: Calendar },
  music: { name: 'music', label: 'Suggested Music', icon: Music },
  backgroundMusic: { name: 'backgroundMusic', label: 'Background Music', icon: Waves },
  sweetMemories: { name: 'sweetMemories', label: 'Sweet Memories', icon: ImageIcon },
  eventComments: { name: 'eventComments', label: 'Guest Comments', icon: MessageSquareText },
  location: { name: 'location', label: 'Location', icon: MapIcon }
}

const activeFeatures = computed(() => {
  return event.value?.eventFeatures?.filter(f => f.isActive).map(f => featureMap[f.name]) || []
})
</script>

<template>
  <div class="max-w-5xl mx-auto p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-black text-gray-900 dark:text-white">{{ event?.eventName }}</h1>
        <p class="text-gray-500 dark:text-gray-400">Event Details</p>
      </div>

      <div class="flex items-center gap-3">
        <CButton variant="outline" @click="openPublicPage">
          <ExternalLink class="w-4 h-4 mr-2" />
          Open Public Page
        </CButton>
        <CButton variant="gradient" @click="goToEdit">
          <Edit3 class="w-4 h-4 mr-2" />
          Edit Event
        </CButton>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <CCard>
          <template #title>
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-xl font-black text-gray-900 dark:text-white">Overview</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  General information about your event
                </p>
              </div>
              <span class="px-3 py-1 rounded-full text-xs font-bold" :class="statusClass">
                {{ event?.status }}
              </span>
            </div>
          </template>

          <template #content>
            <div class="space-y-4">
              <div>
                <h3
                  class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Description
                </h3>
                <p class="text-gray-700 dark:text-gray-300">
                  {{ event?.eventDescription || 'No description provided' }}
                </p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3
                    class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Dates
                  </h3>
                  <p class="text-gray-700 dark:text-gray-300">{{ formattedDates }}</p>
                </div>
                <div>
                  <h3
                    class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Visibility
                  </h3>
                  <p class="text-gray-700 dark:text-gray-300 capitalize">{{ event?.visibility }}</p>
                </div>
              </div>

              <div v-if="event?.location">
                <h3
                  class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Location
                </h3>
                <p class="text-gray-700 dark:text-gray-300">{{ event.location }}</p>
              </div>
            </div>
          </template>
        </CCard>

        <CCard>
          <template #title>
            <h2 class="text-xl font-black text-gray-900 dark:text-white">Active Features</h2>
          </template>
          <template #content>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div
                v-for="feature in activeFeatures"
                :key="feature.name"
                class="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
              >
                <component :is="feature.icon" class="w-4 h-4 text-purple-500" />
                <span class="text-sm font-semibold">{{ feature.label }}</span>
              </div>
            </div>
          </template>
        </CCard>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <CCard>
          <template #title>
            <h2 class="text-xl font-black text-gray-900 dark:text-white">Collaborators</h2>
          </template>
          <template #content>
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <UserCircle class="w-8 h-8 text-gray-400" />
                <div>
                  <div class="font-bold">{{ userStore.user?.name }}</div>
                  <div class="text-sm text-gray-500">Owner</div>
                </div>
              </div>

              <div
                v-for="col in event?.collaborators"
                :key="col.id"
                class="flex items-center justify-between"
              >
                <div class="flex items-center gap-3">
                  <UserCircle class="w-8 h-8 text-purple-400" />
                  <div>
                    <div class="font-bold">{{ col.name || col.email }}</div>
                    <div class="text-sm text-gray-500 capitalize">{{ col.role }}</div>
                  </div>
                </div>
                <button
                  class="text-sm text-red-500 hover:underline"
                  @click="removeCollaborator(col.id)"
                >
                  Remove
                </button>
              </div>

              <CButton variant="outline" @click="openCollaboratorModal">Add Collaborator</CButton>
            </div>
          </template>
        </CCard>

        <CCard>
          <template #title>
            <h2 class="text-xl font-black text-gray-900 dark:text-white">Quick Actions</h2>
          </template>
          <template #content>
            <div class="flex flex-col gap-3">
              <CButton class="w-full" variant="outline" @click="goToEdit">Edit Event</CButton>
              <CButton class="w-full" variant="outline" @click="openPublicPage"
                >Open Public Page</CButton
              >
            </div>
          </template>
        </CCard>
      </div>
    </div>

    <CAddCollaboratorModal v-model:open="showCollaboratorModal" :event-id="event?.id" />
  </div>
</template>
