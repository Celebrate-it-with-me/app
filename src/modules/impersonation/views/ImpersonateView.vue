<script setup>
/**
 * Entry of a support session: `/impersonate#token=…&expires=…`. Takes the token out of the fragment (it never reaches
 * a server), keeps it for this tab only, cleans the address bar, loads who the account is and goes to the dashboard.
 */
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { CWM_API } from '@/services/axios'
import { UiEmptyState } from '@/ui'
import { useUserStore } from '@/stores/useUserStore'
import { useImpersonationStore } from '../stores/useImpersonationStore'
import { parseFragment, readSession, remainingSeconds } from '../utils/impersonation'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()
const imp = useImpersonationStore()
const failed = ref(false)

onMounted(async () => {
  const parsed = parseFragment(window.location.hash)
  // Out of the address bar and the history right away.
  window.history.replaceState(null, '', window.location.pathname)

  if (!parsed) {
    // Reloaded or revisited: if this tab already has a session, just continue.
    if (readSession()) return router.replace('/dashboard')
    failed.value = true
    return
  }
  if (remainingSeconds(parsed.expires) <= 0) return router.replace({ name: 'impersonation-ended', query: { reason: 'expired' } })

  imp.begin(parsed)
  try {
    const { data } = await CWM_API.get('user')
    const user = data?.data?.user
    if (!user) throw new Error('no user')
    userStore.initUserData({
      name: user.name,
      email: user.email,
      userId: user.id,
      lastLogin: null,
      activeEvent: user.last_active_event_id,
      justLogin: false,
      avatar: user.avatar_url,
      phone: user.phone,
      isFirstLogin: false
    })
    // A token that is not a support session is not ours to use.
    if (!data.data.impersonating) throw new Error('not a support session')
    imp.sync(data.data.impersonating)
    await router.replace('/dashboard')
  } catch {
    // The 401 handler already moved us to the "session ended" screen; anything else is a broken link.
    if (!imp.ended) {
      imp.finish()
      failed.value = true
    }
  }
})
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-cream-100 px-4 text-ink-900">
    <UiEmptyState v-if="failed" :title="t('impersonation.invalidTitle')" :description="t('impersonation.invalidText')" />
    <p v-else class="text-sm text-ink-500" role="status">{{ t('impersonation.opening') }}</p>
  </main>
</template>
