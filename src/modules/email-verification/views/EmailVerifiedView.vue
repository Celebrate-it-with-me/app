<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { UiButton } from '@/ui'
import AuthCard from '@/components/external/auth/AuthCard.vue'
import { useUserStore } from '@/stores/useUserStore'
import { useEmailVerificationStore } from '../stores/useEmailVerificationStore'
import { normalizeStatus } from '../utils/emailVerification'

const { t } = useI18n()
const route = useRoute()
const userStore = useUserStore()
const store = useEmailVerificationStore()

const status = computed(() => normalizeStatus(route.query.status))
const signedIn = computed(() => userStore.isAuthenticated)
const retry = computed(() => status.value !== 'ok')
const feedback = computed(() => ({ sent: t('emailVerify.page.sent'), limited: t('emailVerify.limited'), error: t('emailVerify.error'), verified: t('emailVerify.alreadyVerified') })[store.result] ?? '')

// The link worked: the notice must go away, so the user is refreshed (best effort) when there is a session.
onMounted(() => {
  if (status.value === 'ok' && signedIn.value) {
    userStore.setEmailVerified(true)
    userStore.syncEmailVerified()
  }
})
</script>

<template>
  <section class="flex justify-center px-4 py-10 sm:py-16">
    <AuthCard :title="t(`emailVerify.page.${status}.title`)" :subtitle="t(`emailVerify.page.${status}.text`)">
      <p v-if="feedback" class="mb-4 text-center text-sm font-medium" :class="['sent', 'verified'].includes(store.result) ? 'text-success-700' : 'text-danger-700'" role="status">{{ feedback }}</p>
      <div class="flex flex-col gap-3">
        <template v-if="!signedIn">
          <UiButton block to="/sign-in">{{ t('common.signIn') }}</UiButton>
        </template>
        <template v-else-if="retry">
          <UiButton block :loading="store.resending" @click="store.resend()">{{ t('emailVerify.resend') }}</UiButton>
          <UiButton block variant="secondary" to="/dashboard">{{ t('emailVerify.page.goDashboard') }}</UiButton>
        </template>
        <UiButton v-else block to="/dashboard">{{ t('emailVerify.page.goDashboard') }}</UiButton>
      </div>
    </AuthCard>
  </section>
</template>
