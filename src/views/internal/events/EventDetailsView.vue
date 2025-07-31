<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventsStore } from '@/stores/useEventsStore'
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
  Users,
  Share2,
  Clock,
  CalendarDays,
  Link,
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
  const fetched = eventStore.events.find(e => e.id == id)

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
  sweetMemories: { name: 'sweetMemories', label: 'Sweet Memories', icon: ImageIcon },
  music: { name: 'music', label: 'Music', icon: Waves },
  backgroundMusic: { name: 'backgroundMusic', label: 'Background Music', icon: Music },
  eventComments: { name: 'eventComments', label: 'Comments', icon: MessageSquareText },
  location: { name: 'location', label: 'Location', icon: MapIcon }
}

const enabledFeatures = computed(() =>
  Object.entries(featureMap)
    .filter(([key]) => event.value?.[key])
    .map(([key, val]) => val)
)
</script>

<template>
  <section v-if="event" class="space-y-10">
    <!-- Header -->
    <div class="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6 shadow-sm">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ event.eventName }}</h2>
            <span class="inline-block text-xs font-semibold px-2 py-1 rounded" :class="statusClass">
              {{ event.status }}
            </span>
            <!-- User Role Badge -->
            <div
              class="flex items-center bg-white dark:bg-gray-800 px-2 py-1 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 ml-2"
            >
              <UserCircle
                class="w-3.5 h-3.5 mr-1"
                :class="{
                  'text-purple-500': getUserRole === 'owner',
                  'text-blue-500': getUserRole === 'editor',
                  'text-gray-500': getUserRole === 'viewer'
                }"
              />
              <span
                class="text-xs font-medium capitalize"
                :class="{
                  'text-purple-500': getUserRole === 'owner',
                  'text-blue-500': getUserRole === 'editor',
                  'text-gray-500': getUserRole === 'viewer'
                }"
                >{{ getUserRole }}</span
              >
            </div>
          </div>
          <div class="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
            <CalendarDays class="w-4 h-4" />
            <span>{{ formattedDates }}</span>
          </div>
        </div>

        <div class="flex gap-2 mt-4 md:mt-0">
          <CButton variant="outline" class="flex items-center gap-1" @click="goToEdit">
            <Edit3 class="w-4 h-4" />
            <span>Edit</span>
          </CButton>
          <CButton variant="gradient" class="flex items-center gap-1" @click="openPublicPage">
            <ExternalLink class="w-4 h-4" />
            <span>View Public</span>
          </CButton>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div
          class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <div class="flex items-center gap-2 text-primary">
            <Users class="w-5 h-5" />
            <span class="font-medium">Guests</span>
          </div>
          <p class="text-2xl font-bold mt-2">{{ event.guestCount || 0 }}</p>
        </div>

        <div
          class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <div class="flex items-center gap-2 text-primary">
            <Share2 class="w-5 h-5" />
            <span class="font-medium">Shares</span>
          </div>
          <p class="text-2xl font-bold mt-2">{{ event.shareCount || 0 }}</p>
        </div>

        <div
          class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <div class="flex items-center gap-2 text-primary">
            <Clock class="w-5 h-5" />
            <span class="font-medium">Days Left</span>
          </div>
          <p class="text-2xl font-bold mt-2">
            {{
              Math.max(
                0,
                Math.ceil((new Date(event.startDate) - new Date()) / (1000 * 60 * 60 * 24))
              )
            }}
          </p>
        </div>
      </div>
    </div>

    <!-- Description -->
    <CCard variant="feature" class="overflow-visible">
      <template #title>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Description</h3>
      </template>
      <p class="text-sm text-gray-700 dark:text-gray-300">
        {{ event.eventDescription || 'No description provided.' }}
      </p>

      <!-- Public URL -->
      <div
        class="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between"
      >
        <div class="flex items-center gap-2 text-sm">
          <Link class="w-4 h-4 text-primary" />
          <span class="text-gray-700 dark:text-gray-300 truncate max-w-xs">{{
            event.public_url || 'No public URL available'
          }}</span>
        </div>
        <CButton
          variant="outline"
          size="sm"
          class="flex items-center gap-1"
          @click="openPublicPage"
        >
          <ExternalLink class="w-3 h-3" />
          <span>Open</span>
        </CButton>
      </div>
    </CCard>

    <!-- Enabled Features -->
    <CCard variant="feature" class="overflow-visible">
      <template #title>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Enabled Features</h3>
      </template>
      <div class="flex flex-wrap gap-3">
        <span
          v-for="feature in enabledFeatures"
          :key="feature.name"
          class="flex items-center gap-2 px-3 py-1 text-sm rounded-full bg-primary/10 text-primary border border-primary/20"
        >
          <component :is="feature.icon" class="w-4 h-4" />
          {{ feature.label }}
        </span>
      </div>
    </CCard>

    <!-- Collaborators -->
    <CCard variant="feature" class="overflow-visible">
      <template #title>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Collaborators</h3>
          <CButton
            variant="outline"
            size="sm"
            class="flex items-center gap-1"
            @click="openCollaboratorModal"
          >
            <Users class="w-4 h-4" />
            <span>Add Collaborator</span>
          </CButton>
        </div>
      </template>

      <div v-if="event.collaborators?.length > 0" class="space-y-3 mt-2">
        <div
          v-for="collaborator in event.collaborators"
          :key="collaborator.id"
          class="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:border-primary/30 transition-all duration-200"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold"
            >
              {{ collaborator.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="font-semibold text-gray-900 dark:text-white">{{ collaborator.name }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ collaborator.email }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span
              class="text-xs px-2 py-1 rounded-full font-medium"
              :class="
                collaborator.role === 'editor'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              "
            >
              {{ collaborator.role }}
            </span>
            <button
              class="text-gray-400 hover:text-red-500 transition-colors duration-200"
              @click="removeCollaborator(collaborator.id)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div v-else class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
        <Users class="w-12 h-12 mx-auto text-gray-400 mb-2" />
        <p class="text-gray-500 dark:text-gray-400">No collaborators yet</p>
        <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">
          Add collaborators to work together on this event
        </p>
      </div>
    </CCard>
  </section>
  <CAddCollaboratorModal
    :open="showCollaboratorModal"
    @close-modal="showCollaboratorModal = false"
  />
</template>
