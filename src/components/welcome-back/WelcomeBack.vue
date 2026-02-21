<script setup>
import { useUserStore } from '@/stores/useUserStore'
import { computed } from 'vue'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'

const userStore = useUserStore()
const eventStore = useEventsStore()

const wBText = computed(() => {
  if (!userStore.lastLogin) {
    return ''
  }

  return `Welcome Back ${userStore.name}, your last login was ${userStore.lastLoginDate}`
})

const eventSelectedName = computed(() => {
  return eventStore.currentEvent?.eventName ?? ''
})
</script>

<template>
  <div v-if="wBText" class="w-full">
    <p class="text-gray-400 text-md">
      {{ wBText }}
    </p>

    <p class="text-gray-400 text-sm font-extralight">
      {{ eventSelectedName }}
    </p>
  </div>
</template>

<style scoped></style>
