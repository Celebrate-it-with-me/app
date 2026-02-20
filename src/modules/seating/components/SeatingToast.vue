<script setup>
import { useSeatingStore } from '@/modules/seating/stores/useSeatingStore'
import { storeToRefs } from 'pinia'

const seatingStore = useSeatingStore()
const { showToast, toastMessage } = storeToRefs(seatingStore)
</script>

<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0 translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-2"
  >
    <div v-if="showToast" class="fixed bottom-6 right-6 z-50 max-w-md">
      <div
        class="rounded-2xl shadow-2xl backdrop-blur-lg border p-4 flex items-center gap-3 bg-green-50/95 border-green-200 dark:bg-green-900/95 dark:border-green-700"
      >
        <div
          class="flex-shrink-0 w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            stroke-width="3"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <p class="font-medium text-sm flex-1 text-green-800 dark:text-green-200">
          {{ toastMessage }}
        </p>

        <button
          class="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-green-200 dark:hover:bg-green-800 text-green-600 dark:text-green-300"
          @click="showToast = false"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  </Transition>
</template>
