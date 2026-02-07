<script setup>
import CCard from '@/components/UI/cards/CCard.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useEventsStore } from '@/stores/useEventsStore'
import {
  MoreVertical,
  Edit,
  Archive,
  XCircle,
  Calendar,
  MapPin,
  SwitchCamera,
  UserCircle
} from 'lucide-vue-next'
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

const switchToEvent = event => {
  emit('switchEvent', event)
}

const openMenu = ref(null)

const toggleMenu = () => {
  openMenu.value = !openMenu.value
}

const isActiveEvent = id => {
  return id === eventStore.activeEvent?.id
}

const editEvent = event => {
  router.push({ name: 'edit-event', params: { id: event.id } })
}

const archiveEvent = event => {
  if (!isActiveEvent(event.id)) {
    console.log('Archiving', event.id)
  }
}

const cancelEvent = event => {
  if (!isActiveEvent(event.id)) {
    console.log('Cancelling', event.id)
  }
}

const formatDate = date => {
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
    class="group hover:shadow-xl transition-all duration-500 border border-gray-100 dark:border-gray-700/50 relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
    :class="{ 'opacity-60 grayscale scale-[0.98]': isPast }"
  >
    <!-- Past Event Badge -->
    <div
      v-if="isPast"
      class="absolute -top-2 right-4 bg-gray-100 dark:bg-gray-700 text-gray-500 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded shadow-sm z-10 border border-gray-200 dark:border-gray-600"
    >
      Past Event
    </div>

    <template #title>
      <div class="flex justify-between items-start mb-4">
        <!-- Role Badge (Status) -->
        <div
          class="flex items-center bg-rose-light/20 dark:bg-rose-dark/10 px-2 py-1 rounded-md border border-rose/10"
        >
          <UserCircle
            class="w-3.5 h-3.5 mr-1.5"
            :class="{
              'text-purple-500': userRole === 'owner',
              'text-blue-500': userRole === 'editor',
              'text-gray-500': userRole === 'viewer'
            }"
          />
          <span
            class="text-[10px] font-bold uppercase tracking-tight"
            :class="{
              'text-purple-600 dark:text-purple-400': userRole === 'owner',
              'text-blue-600 dark:text-blue-400': userRole === 'editor',
              'text-gray-600 dark:text-gray-400': userRole === 'viewer'
            }"
            >{{ userRole }}</span
          >
        </div>

        <!-- Three dots menu -->
        <div class="relative">
          <button
            class="p-2 rounded-full text-gray-400 hover:text-rose hover:bg-rose-light/50 dark:hover:bg-rose-dark/20 focus:outline-none transition-all duration-200"
            aria-label="Event options"
            @click="toggleMenu()"
          >
            <MoreVertical class="w-4 h-4" />
          </button>
          <Transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
          >
            <div
              v-if="openMenu"
              v-on-click-outside="() => (openMenu = false)"
              class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-30 py-1"
            >
              <ul class="text-sm text-gray-700 dark:text-gray-200">
                <li>
                  <button
                    class="w-full text-left px-4 py-2.5 hover:bg-rose-light/30 dark:hover:bg-rose-dark/10 flex items-center transition-colors"
                    @click="editEvent(event)"
                  >
                    <Edit class="w-4 h-4 mr-3 text-gray-400" />
                    Edit Event
                  </button>
                </li>
                <li>
                  <button
                    class="w-full text-left px-4 py-2.5 hover:bg-rose-light/30 dark:hover:bg-rose-dark/10 flex items-center transition-colors"
                    :disabled="isActiveEvent(event.id)"
                    :class="{ 'opacity-50 cursor-not-allowed': isActiveEvent(event.id) }"
                    @click="archiveEvent(event)"
                  >
                    <Archive class="w-4 h-4 mr-3 text-gray-400" />
                    Archive Event
                  </button>
                </li>
                <div class="my-1 border-t border-gray-100 dark:border-gray-700"></div>
                <li>
                  <button
                    class="w-full text-left px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center text-red-500 transition-colors"
                    :disabled="isActiveEvent(event.id)"
                    :class="{ 'opacity-50 cursor-not-allowed': isActiveEvent(event.id) }"
                    @click="cancelEvent(event)"
                  >
                    <XCircle class="w-4 h-4 mr-3" />
                    Cancel Event
                  </button>
                </li>
              </ul>
            </div>
          </Transition>
        </div>
      </div>

      <h3
        class="text-lg font-bold text-gray-800 dark:text-gray-100 group-hover:text-rose transition-colors duration-300"
      >
        {{ event.eventName }}
      </h3>
    </template>

    <template #content>
      <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 h-10">
        {{ event.eventDescription }}
      </p>

      <div class="space-y-2 mb-2">
        <div class="flex items-center text-xs font-medium text-gray-600 dark:text-gray-400">
          <Calendar class="w-3.5 h-3.5 mr-2 text-rose/70" />
          <span>{{ formatDate(event.startDate) }} – {{ formatDate(event.endDate) }}</span>
        </div>

        <div
          v-if="event.location"
          class="flex items-center text-xs font-medium text-gray-600 dark:text-gray-400"
        >
          <MapPin class="w-3.5 h-3.5 mr-2 text-rose/70" />
          <span class="truncate">{{ event.location }}</span>
        </div>
      </div>
    </template>

    <template #cta>
      <CButton
        variant="outline"
        :disabled="isPast"
        class="w-full transition-all duration-300 border-rose/20 text-rose/80 hover:text-rose hover:border-rose hover:bg-rose-light/30 shadow-sm"
        :class="{ 'opacity-50 cursor-not-allowed grayscale bg-gray-100': isPast }"
        @click="switchToEvent(event)"
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
