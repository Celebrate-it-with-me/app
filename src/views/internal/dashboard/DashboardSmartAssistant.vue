<script setup>

import { onMounted, ref } from 'vue'
import { useEventsStore } from '@/stores/useEventsStore'
import { useUserStore } from '@/stores/useUserStore'
import { Bot } from 'lucide-vue-next'

const eventStore = useEventsStore()
const userStore = useUserStore()
const suggestions = ref([])

onMounted(async () => {
  await loadSuggestions()
})

const loadSuggestions = async () => {
  try {
    const response = await eventStore.loadSuggestions({
      eventId: userStore.activeEvent,
    })

    if (response.status === 200) {
      suggestions.value = response.data ?? []
    }

  } catch (error) {
    console.error('Error loading suggestions:', error)
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

    <ul class="ml-5 space-y-2">
      <li
        v-for="suggestion in suggestions"
        :key="suggestion.name"
        class="flex items-start space-x-2"
      >
        <span class="text-gray-800 font-bold">{{ suggestion.name }}</span>
        <span class="text-gray-600 dark:text-gray-300">- {{ suggestion.description }}</span>
        <span class="text-gray-500">
          - <router-link :to="suggestion.url" class="text-blue-500 hover:underline">
            Work on it
          </router-link>
        </span>
      </li>
    </ul>
  </section>
</template>


<style scoped>

</style>
