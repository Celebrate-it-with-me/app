<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/useUserStore'
import { CWM_API } from '@/services/axios'
import { UiSkeleton } from '@/ui'
import AuthCard from '@/components/external/auth/AuthCard.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const provider = computed(() => route.query.provider || 'Google')

onMounted(async () => {
  if (route.query.status !== 'ok') {
    return router.push({ name: 'sign-in', query: { message: 'social-failed' } })
  }
  try {
    await CWM_API.get('sanctum/csrf-cookie', { baseURL: import.meta.env.VITE_API_URL })
    const response = await userStore.refreshUser()
    if (response.status === 200) {
      const preferences = await userStore.getPreferences()
      if (preferences?.status === 200) userStore.setPreferences(preferences.data?.data ?? {})
      return router.push(route.query.redirect || { name: 'dashboard' })
    }
  } catch (error) {
    console.error('Social callback error:', error)
  }
  return router.push({ name: 'sign-in', query: { message: 'session-failed' } })
})
</script>

<template>
  <section class="flex justify-center px-4 py-10 sm:py-16">
    <AuthCard :title="t('auth.socialSigning', { provider })">
      <UiSkeleton :lines="2" />
    </AuthCard>
  </section>
</template>
