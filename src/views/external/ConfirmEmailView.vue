<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/useUserStore'
import { UiButton, UiSkeleton } from '@/ui'
import AuthCard from '@/components/external/auth/AuthCard.vue'

const { t } = useI18n()
const route = useRoute()
const userStore = useUserStore()
const loading = ref(true)
const success = ref(false)

onMounted(async () => {
  try {
    const confirmUrl = route.query.confirm ? decodeURIComponent(route.query.confirm) : ''
    if (!confirmUrl) return
    const response = await userStore.confirmEmail(confirmUrl)
    success.value = response.status === 200
  } catch (error) {
    console.error('Error confirming email:', error)
    success.value = false
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="flex justify-center px-4 py-10 sm:py-16">
    <AuthCard v-if="loading" :title="t('auth.confirming')">
      <UiSkeleton :lines="2" />
    </AuthCard>
    <AuthCard v-else-if="success" :title="t('auth.confirmedTitle')" :subtitle="t('auth.confirmedText')">
      <UiButton block to="/sign-in">{{ t('common.signIn') }}</UiButton>
    </AuthCard>
    <AuthCard v-else :title="t('auth.confirmFailedTitle')" :subtitle="t('auth.confirmFailedText')">
      <UiButton block variant="secondary" to="/">{{ t('common.backHome') }}</UiButton>
    </AuthCard>
  </section>
</template>
