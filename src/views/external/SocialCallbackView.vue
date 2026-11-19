<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/useUserStore'
import { CWM_API } from '@/services/axios'
import { UiButton, UiSkeleton } from '@/ui'
import AuthCard from '@/components/external/auth/AuthCard.vue'
import { isSuspendedSocialCallback, rememberSupportEmail } from '@/utils/accountSuspended'
import { internalRedirect, providerName } from '@/utils/socialProviders'

// `rate_limited`: the API's attempts limit (HTTP 429) on the social login; it sends the user back with this reason.
const REASONS = ['access_denied', 'email_required', 'account_exists', 'oauth_failed', 'rate_limited']
const KEYS = { session_failed: 'sessionFailed', access_denied: 'accessDenied', email_required: 'emailRequired', account_exists: 'accountExists', rate_limited: 'rateLimited' }

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const provider = computed(() => providerName(route.query.provider) || 'Google')
const redirect = computed(() => internalRedirect(route.query.redirect))
/** Reason to explain, or '' while the session is still being set up. */
const failure = ref('')

const failureKey = computed(() => KEYS[failure.value] ?? 'oauthFailed')
const signInTarget = computed(() => ({ name: 'sign-in', query: redirect.value ? { redirect: redirect.value } : {} }))
// Cancelling is not an error: neutral tone, no alert banner.
const cancelled = computed(() => failure.value === 'access_denied')

onMounted(async () => {
  if (isSuspendedSocialCallback(route.query)) {
    rememberSupportEmail('')
    return router.replace({ name: 'account-suspended' })
  }
  if (route.query.status !== 'ok') {
    const reason = String(route.query.reason ?? '')
    failure.value = REASONS.includes(reason) ? reason : 'oauth_failed'
    return
  }
  try {
    await CWM_API.get('sanctum/csrf-cookie', { baseURL: import.meta.env.VITE_API_URL })
    const response = await userStore.refreshUser()
    if (response.status === 200) {
      const preferences = await userStore.getPreferences()
      if (preferences?.status === 200) userStore.setPreferences(preferences.data?.data ?? {})
      return router.push(redirect.value || { name: 'dashboard' })
    }
  } catch (error) {
    console.error('Social callback error:', error)
    if (error?.response?.status === 429) {
      failure.value = 'rate_limited'
      return
    }
  }
  failure.value = 'session_failed'
})
</script>

<template>
  <section class="flex justify-center px-4 py-10 sm:py-16">
    <AuthCard
      v-if="!failure"
      :title="t('auth.socialSigning', { provider })"
    >
      <UiSkeleton :lines="2" />
    </AuthCard>
    <AuthCard
      v-else
      :title="t(`auth.social.${failureKey}.title`)"
      :error="cancelled ? '' : t(`auth.social.${failureKey}.text`, { provider })"
    >
      <p v-if="cancelled" class="mb-5 text-center text-base text-ink-500" role="status">
        {{ t(`auth.social.${failureKey}.text`, { provider }) }}
      </p>
      <UiButton block :to="signInTarget">{{ t('auth.social.backToSignIn') }}</UiButton>
      <template v-if="failure === 'account_exists'" #footer>
        <router-link to="/forgot-password" class="font-semibold text-rose-600 hover:underline">
          {{ t('auth.forgot') }}
        </router-link>
      </template>
    </AuthCard>
  </section>
</template>
