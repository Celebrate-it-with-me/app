<script setup>
import { computed, ref } from 'vue'
import { Clock, Users, ChevronDown, Check, Plus, Calendar } from 'lucide-vue-next'
import { useEventsStore } from '@/stores/useEventsStore'
import { useUserStore } from '@/stores/useUserStore'
import { useGuestsStore } from '@/stores/useGuestStore'
import { useClickOutside } from '@/composables/useClickOutside'

const eventStore = useEventsStore()
const userStore = useUserStore()
const guestStore = useGuestsStore()

const isOpen = ref(false)
const dropdownRef = ref(null)

useClickOutside(dropdownRef, () => {
  isOpen.value = false
})

const eventName = computed(() => eventStore.activeEvent?.eventName || 'No Event Selected')
const guestCount = computed(() => guestStore.totalAssistant || 0)

const eventDate = computed(() => {
  if (!eventStore.activeEvent?.startDate) return null
  const date = new Date(eventStore.activeEvent.startDate)
  const today = new Date()
  const diffTime = date - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'Event passed'
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays <= 7) return `${diffDays} days`

  return null
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const selectEvent = event => {
  eventStore.setActiveEvent(event)
  isOpen.value = false
}
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <!-- Trigger Button -->
    <button
      v-if="eventStore.activeEvent"
      class="flex items-center gap-3 p-2 rounded-xl transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 group"
      @click="toggleDropdown"
    >
      <div class="flex flex-col items-start">
        <div class="flex items-center gap-2">
          <span class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ eventName }}
          </span>
          <ChevronDown
            v-if="eventStore.hasEvents"
            class="w-4 h-4 text-gray-400 transition-transform duration-200"
            :class="{ 'rotate-180': isOpen }"
          />
        </div>
        <div
          v-if="userStore.activeEvent"
          class="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400"
        >
          <span class="flex items-center gap-1">
            <Users class="w-3 h-3" />
            {{ guestCount }} assistant
          </span>
          <span v-if="eventDate" class="flex items-center gap-1">
            <Clock class="w-3 h-3" />
            {{ eventDate }}
          </span>
        </div>
      </div>
    </button>

    <div v-else class="flex items-center gap-2">
      <div
        class="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg flex items-center justify-center"
      >
        <Calendar class="w-4 h-4 text-white" />
      </div>
      <span class="text-lg font-semibold text-gray-500 dark:text-gray-400"> No Active Event </span>
    </div>

    <!-- Dropdown Menu -->
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen && eventStore.hasEvents"
        class="absolute left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-[60] overflow-hidden"
      >
        <div class="p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
          <div
            class="px-3 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider"
          >
            Switch Event
          </div>

          <div class="space-y-1">
            <button
              v-for="event in eventStore.events"
              :key="event.id"
              class="w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group"
              :class="[
                eventStore.activeEvent.id === event.id
                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              ]"
              @click="selectEvent(event)"
            >
              <div class="flex flex-col items-start min-w-0">
                <span class="font-medium truncate w-full">{{ event.eventName }}</span>
              </div>
              <Check v-if="eventStore.activeEvent.id === event.id" class="w-4 h-4 flex-shrink-0" />
            </button>
          </div>
        </div>

        <!-- Action Section -->
        <div
          class="p-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50"
        >
          <RouterLink
            to="/dashboard/events/create"
            class="flex items-center gap-2 w-full p-2 text-sm text-purple-600 dark:text-purple-400 font-medium rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
            @click="isOpen = false"
          >
            <Plus class="w-4 h-4" />
            Create New Event
          </RouterLink>
          <RouterLink
            to="/dashboard/events"
            class="flex items-center gap-2 w-full p-2 text-sm text-gray-600 dark:text-gray-400 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
            @click="isOpen = false"
          >
            <Calendar class="w-4 h-4" />
            Manage All Events
          </RouterLink>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(168, 85, 247, 0.2);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(168, 85, 247, 0.4);
}
</style>
