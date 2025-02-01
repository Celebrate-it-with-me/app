<script setup>
import { useNotification } from '@/stores/useNotification'
import { computed } from 'vue'
import SuccessIcon from '@/components/UI/cwmNotification/notification-icons/SuccessIcon.vue'
import WarningIcon from '@/components/UI/cwmNotification/notification-icons/WarningIcon.vue'
import ErrorIcon from '@/components/UI/cwmNotification/notification-icons/ErrorIcon.vue'

const notificationStore = useNotification()

const notifications = computed(() => notificationStore.notifications)

const removeNotification = (id) => {
  notificationStore.removeNotification(id)
}

const getClassesByType = (type) => {
  switch (type) {
    case 'success':
      return `text-green-500 bg-green-100 dark:bg-green-800 dark:text-green-200`
    case 'error':
      return `text-red-500 bg-red-100 dark:bg-red-800 dark:text-red-200`
    case 'warning':
      return `text-orange-500 bg-orange-100 dark:bg-orange-700 dark:text-orange-200`
  }
}
</script>

<template>
  <div
    class="fixed bottom-4 right-4 z-100"
  >
    <div
      v-for="notification in notifications"
      :key="notification.id"
      role="alert"
      class="flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow-sm dark:text-gray-400 dark:bg-gray-800"
    >
      <div
        class="inline-flex items-center justify-center shrink-0 w-8 h-8 rounded-lg"
        :class="getClassesByType(notification.type)"
      >
        <SuccessIcon v-if="notification.type === 'success'" />
        <ErrorIcon v-if="notification.type === 'error'" />
        <WarningIcon v-if="notification.type === 'warning'" />
      </div>
      <div class="ms-3 text-sm font-normal">{{ notification.message }}</div>
      <button
        type="button"
        class="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
        @click="removeNotification(notification.id)"
      >
        <span class="sr-only">Close</span>
        <svg
          class="w-3 h-3"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 14 14"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped></style>
