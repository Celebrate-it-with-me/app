<script setup>
import { onMounted, ref, computed } from 'vue'
import { useEventsStore } from '@/stores/useEventsStore'
import { useUserStore } from '@/stores/useUserStore'
import { Bot, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { Splide, SplideSlide } from '@splidejs/vue-splide'
import '@splidejs/splide/dist/css/splide.min.css'

const eventStore = useEventsStore()
const userStore = useUserStore()
const suggestions = ref([])
const isLoading = ref(true)
const hasError = ref(false)
const currentSlide = ref(0)

// Splide slider options
const sliderOptions = {
  type: 'slide',
  perPage: 2,
  perMove: 1,
  pagination: false,
  arrows: false,
  gap: '1rem',
  autoplay: true,
  interval: 5000,
  pauseOnHover: true,
  resetProgress: false,
  breakpoints: {
    640: {
      perPage: 1
    }
  }
}

onMounted(async () => {
  await loadSuggestions()
})

const loadSuggestions = async () => {
  isLoading.value = true
  hasError.value = false

  try {
    const response = await eventStore.loadSuggestions({
      eventId: userStore.activeEvent
    })

    if (response.status === 200) {
      suggestions.value = response.data ?? []
    } else {
      hasError.value = true
    }
  } catch (error) {
    hasError.value = true
  } finally {
    isLoading.value = false
  }
}

// Reference to the Splide instance
const splideRef = ref(null)

// Navigation methods
const goToNext = () => {
  if (splideRef.value) {
    splideRef.value.go('+')
  }
}

const goToPrev = () => {
  if (splideRef.value) {
    splideRef.value.go('-')
  }
}
</script>

<template>
  <section
    class="bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-6 border border-gray-100 overflow-hidden"
  >
    <div class="flex items-center justify-between mb-4">
      <div
        class="flex items-center gap-2 text-sky-600 font-semibold text-sm bg-sky-50 dark:bg-sky-950 px-3 py-1 rounded-full"
      >
        <Bot class="w-4 h4" />
        Smart Assistant
      </div>
    </div>

    <p class="text-gray-600 dark:text-gray-300 mb-4">
      Your virtual assistant analyzes your progress and suggests the next steps to make your event
      perfect.
    </p>

    <p class="text-gray-600 font-semibold dark:text-gray-300 mb-4">Suggestions:</p>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center items-center py-4">
      <Loader2 class="w-6 h-6 text-sky-500 animate-spin" />
      <span class="ml-2 text-gray-600">Loading suggestions...</span>
    </div>

    <!-- Error state -->
    <div v-else-if="hasError" class="flex flex-col items-center justify-center py-4">
      <AlertCircle class="w-6 h-6 text-red-500 mb-2" />
      <p class="text-red-500">Failed to load suggestions. Please try again later.</p>
      <button class="mt-2 text-sky-600 hover:text-sky-800 underline" @click="loadSuggestions">
        Retry
      </button>
    </div>

    <!-- Empty state -->
    <div v-else-if="suggestions.length === 0" class="text-center py-4">
      <p class="text-gray-500">No suggestions available at this time.</p>
    </div>

    <!-- Suggestions slider -->
    <div v-else class="suggestions-slider-container">
      <Splide ref="splideRef" :options="sliderOptions" class="suggestions-slider">
        <SplideSlide
          v-for="suggestion in suggestions"
          :key="suggestion.name"
          class="suggestion-slide"
        >
          <div class="suggestion-card border-l-2 border-sky-200 pl-4 py-2">
            <div class="text-gray-800 font-bold mb-1">{{ suggestion.name }}</div>
            <div class="text-gray-600 dark:text-gray-300 mb-1">{{ suggestion.description }}</div>
            <div class="text-gray-500">
              <router-link
                :to="suggestion.url"
                class="text-blue-500 hover:underline inline-flex items-center"
              >
                Work on it
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </router-link>
            </div>
          </div>
        </SplideSlide>
      </Splide>

      <!-- Navigation controls -->
      <div class="slider-navigation flex justify-center mt-4 gap-2">
        <button
          class="nav-button p-2 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-600 transition-colors"
          :disabled="suggestions.length <= sliderOptions.perPage"
          @click="goToPrev"
        >
          <ChevronLeft class="w-5 h-5" />
        </button>
        <button
          class="nav-button p-2 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-600 transition-colors"
          :disabled="suggestions.length <= sliderOptions.perPage"
          @click="goToNext"
        >
          <ChevronRight class="w-5 h-5" />
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.suggestions-slider-container {
  margin: 0;
  width: 100%;
  overflow: hidden;
}

.suggestion-slide {
  height: 100%;
}

.suggestion-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 0.5rem;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.suggestion-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Dark mode adjustments */
:deep(.dark) .suggestion-card {
  background-color: #1f2937;
}

/* Splide customizations */
:deep(.splide__track) {
  overflow: hidden;
}

:deep(.splide__slide) {
  opacity: 1;
  transition: opacity 0.3s;
}

:deep(.splide__slide:not(.is-active)) {
  opacity: 0.7;
}

@media (max-width: 640px) {
  /* Mobile-specific styles if needed */
}
</style>
