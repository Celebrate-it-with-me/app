<script setup>
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/useUserStore'
import { CWM_API } from '@/services/axios'
import CCard from '@/components/UI/cards/CCard.vue'
import CLoading from '@/components/UI/loading/CLoading.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const status = computed(() => route.query.status)
const provider = computed(() => route.query.provider || 'social')

onMounted(async () => {
  if (status.value !== 'ok') {
    return router.push({ name: 'sign-in', query: { message: 'Social login failed' } })
  }

  try {
    await CWM_API.get('sanctum/csrf-cookie', {
      baseURL: import.meta.env.VITE_API_URL
    })

    const response = await userStore.refreshUser()

    if (response.status === 200) {
      const preferences = await userStore.getPreferences()
      if (preferences && preferences.status === 200) {
        userStore.setPreferences(preferences?.data?.data ?? {})
      }

      const redirectPath = route.query.redirect
      if (redirectPath) {
        await router.push(redirectPath)
      } else {
        await router.push({ name: 'dashboard' })
      }
    } else {
      await router.push({ name: 'sign-in', query: { message: 'Session could not be established' } })
    }
  } catch (error) {
    console.error('Social callback error:', error)
    await router.push({ name: 'sign-in', query: { message: 'Session could not be established' } })
  }
})
</script>

<template>
  <section
    class="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20 px-4 overflow-hidden"
  >
    <!-- Background Elements (Matches SignInView.vue) -->
    <div class="absolute inset-0 overflow-hidden">
      <div
        class="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl opacity-60 animate-pulse"
      ></div>
      <div
        class="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-l from-secondary/20 to-accent/20 rounded-full blur-3xl opacity-50 animate-pulse"
        style="animation-delay: 2s"
      ></div>
      <div
        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-pink-300/10 to-purple-300/10 rounded-full blur-2xl opacity-40"
      ></div>
    </div>

    <CCard
      class="relative z-10 max-w-md w-full p-8 shadow-xl bg-gradient-to-br from-pink-50/60 via-rose-50/50 to-pink-100/40 dark:from-pink-900/30 dark:via-pink-800/20 dark:to-pink-700/15 backdrop-blur-sm border border-pink-200/30 dark:border-pink-700/30"
    >
      <div class="text-center">
        <h1 class="text-2xl font-display font-bold text-primary mb-6 capitalize">
          Signing you in with {{ provider }}...
        </h1>
        <CLoading :size="12" />
      </div>
    </CCard>
  </section>
</template>

<style scoped></style>
