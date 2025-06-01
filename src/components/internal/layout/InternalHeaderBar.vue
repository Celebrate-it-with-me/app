<template>
  <header
    class="w-full h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900"
  >
    <div class="flex items-center gap-3">
      <!-- Mobile sidebar toggle button -->
      <button
        class="md:hidden p-1 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-label="Toggle mobile sidebar"
        @click="toggleMobileSidebar"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <label
        class="text-md font-medium text-gray-700 dark:text-gray-300 truncate max-w-[200px] sm:max-w-xs md:max-w-md hidden md:block"
      >
        {{ eventName }}
      </label>
    </div>

    <div class="flex items-center gap-4">
      <UserNotifications />
      <UserMenu />
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useEventsStore } from '@/stores/useEventsStore'
import UserMenu from '@/components/internal/layout/UserMenu.vue'
import UserNotifications from '@/components/internal/layout/UserNotifications.vue'

const eventStore = useEventsStore()
const eventName = computed(() => eventStore.activeEvent?.eventName || 'No Event Selected')

const emit = defineEmits(['toggle-mobile-sidebar'])

const toggleMobileSidebar = () => {
  emit('toggle-mobile-sidebar')
}
</script>
