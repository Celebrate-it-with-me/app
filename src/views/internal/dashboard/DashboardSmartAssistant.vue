<script setup>

import { onMounted, ref } from 'vue'
import { useEventsStore } from '@/stores/useEventsStore'
import { useUserStore } from '@/stores/useUserStore'
import { Bot, Loader2, AlertCircle } from 'lucide-vue-next'

const eventStore = useEventsStore()
const userStore = useUserStore()
const suggestions = ref([])
const isLoading = ref(true)
const hasError = ref(false)

onMounted(async () => {
  await loadSuggestions()
})

const loadSuggestions = async () => {
  isLoading.value = true
  hasError.value = false

  try {
    const response = await eventStore.loadSuggestions({
      eventId: userStore.activeEvent,
    })

    if (response.status === 200) {
      suggestions.value = response.data ?? []
    } else {
      hasError.value = true
    }

  } catch (error) {
    console.error('Error loading suggestions:', error)
    hasError.value = true
  } finally {
    isLoading.value = false
  }
}

</script>

<template>
  <section class="bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-6 border border-gray-100">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2 text-sky-600 font-semibold text-sm bg-sky-50 dark:bg-sky-950 px-3 py-1 rounded-full">
        <Bot class="w-4 h4" />
        Smart Assistant
      </div>
    </div>

    <p class="text-gray-600 dark:text-gray-300 mb-4">
      Your virtual assistant analyzes your progress and suggests the next steps to make your event perfect.
    </p>

    <p class="text-gray-600 font-semibold dark:text-gray-300 mb-4">
      Suggestions:
    </p>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center items-center py-4">
      <Loader2 class="w-6 h-6 text-sky-500 animate-spin" />
      <span class="ml-2 text-gray-600">Loading suggestions...</span>
    </div>

    <!-- Error state -->
    <div v-else-if="hasError" class="flex flex-col items-center justify-center py-4">
      <AlertCircle class="w-6 h-6 text-red-500 mb-2" />
      <p class="text-red-500">Failed to load suggestions. Please try again later.</p>
      <button
        @click="loadSuggestions"
        class="mt-2 text-sky-600 hover:text-sky-800 underline"
      >
        Retry
      </button>
    </div>

    <!-- Empty state -->
    <div v-else-if="suggestions.length === 0" class="text-center py-4">
      <p class="text-gray-500">No suggestions available at this time.</p>
    </div>

    <!-- Suggestions list -->
    <ul v-else class="ml-5 space-y-4">
      <li
        v-for="suggestion in suggestions"
        :key="suggestion.name"
        class="border-l-2 border-sky-200 pl-4 py-2"
      >
        <div class="text-gray-800 font-bold mb-1">{{ suggestion.name }}</div>
        <div class="text-gray-600 dark:text-gray-300 mb-1">{{ suggestion.description }}</div>
        <div class="text-gray-500">
          <router-link :to="suggestion.url" class="text-blue-500 hover:underline inline-flex items-center">
            Work on it
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </router-link>
        </div>
      </li>
    </ul>
  </section>
</template>


<style scoped>

</style>
