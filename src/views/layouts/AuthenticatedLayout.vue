<script setup>
import Header from '@/components/authenticated/header/Header.vue'
import { onMounted } from 'vue'
import { useEventsStore } from '@/stores/useEventsStore'

const eventsStore = useEventsStore()

onMounted(async () => {
  await eventsStore.initEvents()
})
</script>

<template>
  <div class="relative min-h-screen bg-gray-900 text-gray-200">
    <Header />
    <div class="container md:w-[80%] mx-auto px-6 pt-32">
      <router-view />
    </div>
  </div>

</template>

<style scoped>

</style>
