<script setup>
import { useUserStore } from '@/stores/useUserStore'
import { computed } from 'vue'

const userStore = useUserStore()

const wBText = computed(() => {
  if (!userStore.lastLogin) {
    return ''
  }

  return `Welcome Back ${userStore.name}, your last login was ${userStore.lastLoginDate}`
})
</script>

<template>
<div class="w-full" v-if="wBText">
  <p class="text-gray-500 text-md">
    {{ wBText }}
  </p>
</div>
</template>

<style scoped>

</style>
