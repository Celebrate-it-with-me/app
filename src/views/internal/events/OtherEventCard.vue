<script setup>
import CCard from '@/components/UI/cards/CCard.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useEventsStore } from '@/stores/useEventsStore'
import { MoreVertical, Edit, Archive, XCircle, Calendar, MapPin, SwitchCamera, UserCircle } from 'lucide-vue-next'
import { vOnClickOutside } from '@vueuse/components'

const router = useRouter()
const eventStore = useEventsStore()
const emit = defineEmits(['switchEvent'])
const props = defineProps({
  event: {
    type: Object,
    required: true
  },
  userRole: {
    type: String,
    default: 'viewer'
  }
})

const switchToEvent = (event) => {
  emit('switchEvent', event)
}

const openMenu = ref(null)

const toggleMenu = () => {
  openMenu.value = !openMenu.value
}

const isActiveEvent = (id) => {
  return id === eventStore.activeEvent?.id
}

const editEvent = (event) => {
  router.push({ name: 'edit-event', params: { id: event.id } })
}

const archiveEvent = (event) => {
  if (!isActiveEvent(event.id)) {
    console.log('Archiving', event.id)
  }
}

const cancelEvent = (event) => {
  if (!isActiveEvent(event.id)) {
    console.log('Cancelling', event.id)
  }
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const isPast = computed(() => {
  return new Date(props.event.endDate) < new Date()
})


</script>

<template>
  <CCard
    variant="feature"
    class="hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 relative"
    :class="{ 'opacity-60 grayscale': isPast }"
  >
    <!-- Past Event Badge -->
    <span v-if="isPast" class="badge absolute top-2 right-2 bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full z-10">Past Event</span>
    <template #title>
      <div class="flex justify-between items-center mb-2">
        <!-- Role Badge (Status) -->
        <div class="flex items-center bg-white dark:bg-gray-800 px-2 py-1 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
          <UserCircle class="w-3 h-3 mr-1" :class="{
          'text-purple-500': userRole === 'owner',
          'text-blue-500': userRole === 'editor',
          'text-gray-500': userRole === 'viewer'
        }" />
          <span class="text-xs font-medium capitalize" :class="{
          'text-purple-500': userRole === 'owner',
          'text-blue-500': userRole === 'editor',
          'text-gray-500': userRole === 'viewer'
        }">{{ userRole }}</span>
        </div>

        <!-- Three dots menu -->
        <div class="relative">
          <button
            @click="toggleMenu()"
            class="p-1.5 rounded-full text-gray-500 hover:text-rose hover:bg-rose-light focus:outline-none transition-colors"
            aria-label="Event options"
          >
            <MoreVertical class="w-4 h-4" />
          </button>
          <div
            v-if="openMenu"
            class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-20"
            v-on-click-outside="() => openMenu = false"
          >
            <ul class="py-1 text-sm text-gray-700 dark:text-gray-200">
              <li>
                <button
                  @click="editEvent(event)"
                  class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  <Edit class="w-4 h-4 mr-2 text-gray-500" />
                  Edit Event
                </button>
              </li>
              <li>
                <button
                  @click="archiveEvent(event)"
                  class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  :disabled="isActiveEvent(event.id)"
                  :class="{ 'opacity-50 cursor-not-allowed': isActiveEvent(event.id) }"
                >
                  <Archive class="w-4 h-4 mr-2 text-gray-500" />
                  Archive Event
                </button>
              </li>
              <li>
                <button
                  @click="cancelEvent(event)"
                  class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-red-500"
                  :disabled="isActiveEvent(event.id)"
                  :class="{ 'opacity-50 cursor-not-allowed': isActiveEvent(event.id) }"
                >
                  <XCircle class="w-4 h-4 mr-2" />
                  Cancel Event
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <h3 class="text-lg font-medium text-gray-800 dark:text-gray-200">{{ event.eventName }}</h3>
    </template>

    <template #content>

      <p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-3">{{ event.eventDescription }}</p>

      <div class="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
        <Calendar class="w-3.5 h-3.5 mr-1.5 text-rose" />
        <span>{{ formatDate(event.startDate) }} – {{ formatDate(event.endDate) }}</span>
      </div>

      <div v-if="event.location" class="flex items-center text-xs text-gray-500 dark:text-gray-400">
        <MapPin class="w-3.5 h-3.5 mr-1.5 text-rose" />
        <span class="truncate">{{ event.location }}</span>
      </div>
    </template>

    <template #cta>
      <CButton
        variant="outline"
        @click="switchToEvent(event)"
        :disabled="isPast"
        class="w-full transition-colors"
        :class="isPast ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'border-rose text-rose hover:bg-rose-light'"
      >
        <SwitchCamera class="w-4 h-4 mr-2" />
        Switch to Active
      </CButton>
    </template>
  </CCard>
</template>

<style scoped>
.card-menu {
  position: absolute;
  top: -9.5rem;
  right: -10px;
  z-index: 10;
}
</style>
