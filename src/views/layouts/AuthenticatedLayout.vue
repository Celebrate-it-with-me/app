<script setup>
import Header from '@/components/authenticated/header/Header.vue'
import { onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/useUserStore'
import CWMLoadingPage from '@/components/UI/loading/CWMLoadingPage.vue'

const userStore = useUserStore()
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  await userStore.initUserState()
  loading.value = false
})
</script>

<template>
  <div v-if="loading">
    <CWMLoadingPage />
  </div>
  <div v-else class="relative min-h-screen bg-gray-900 text-gray-200">
    <Header />
    <div class="container md:w-[80%] mx-auto px-6 pt-32">
      <router-view />
    </div>
  </div>
</template>

<style scoped></style>
