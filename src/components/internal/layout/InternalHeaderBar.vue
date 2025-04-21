<template>
  <header class="w-full h-16 flex items-center justify-between px-6 border-b
                 border-gray-200 dark:border-gray-700
                 bg-gradient-to-r from-pink-50 to-white dark:from-gray-800 dark:to-gray-900"
  >
    <div class="flex items-center gap-3">
      <label class="text-md font-medium text-gray-700 dark:text-gray-300">{{ eventName }}</label>
    </div>

    <div class="flex items-center gap-4">
      <UserMenu />
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useEventsStore } from '@/stores/useEventsStore'
import UserMenu from '@/components/internal/layout/UserMenu.vue'

const eventStore = useEventsStore()

const eventName = computed(() => eventStore.activeEvent?.eventName || 'No Event Selected')

</script>
