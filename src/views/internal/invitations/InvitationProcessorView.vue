<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiButton } from '@/ui'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/useUserStore'
import { useCollaboratorsStore } from '@/stores/useCollaboratorsStore'
import { useHydrationStore } from '@/stores/useHydrationStore'
import { acceptOnce, forgetAcceptOnce } from './acceptOnce'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref(null)
const success = ref(null)
const needsVerification = ref(false)
let currentInviteId = null
const userStore = useUserStore()
const collaboratorsStore = useCollaboratorsStore()
const hydrationStore = useHydrationStore()

function pendingInvitations() {
  try {
    const list = JSON.parse(localStorage.getItem('pending_invitations') || '[]')
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

async function process() {
  const eventId = Number(route.params.id)
  const invite = pendingInvitations().find(
    i => i.event?.id === eventId && i.email === userStore.email && i.status === 'pending'
  )

  loading.value = true
  error.value = null
  needsVerification.value = false

  if (!invite) {
    error.value = t('invite.noneValid')
    loading.value = false
    return
  }
  currentInviteId = invite.id

  try {
    const accepted = await acceptOnce(invite.id, () => collaboratorsStore.acceptInvitation(invite))
    if (!accepted) {
      // The global interceptor already opened the "verify your email" dialog; here the screen only explains what to do next.
      if (collaboratorsStore.acceptError === 'email_not_verified') {
        needsVerification.value = true
      } else {
        error.value = t('invite.processError')
      }
      return
    }
    await hydrationStore.hydrateAll()
    success.value = t('invite.welcome', { event: invite.event.event_name })
    setTimeout(() => {
      router.push('/dashboard/events')
    }, 2000)
  } catch {
    error.value = t('invite.processError')
  } finally {
    loading.value = false
  }
}

function retry() {
  if (currentInviteId !== null) forgetAcceptOnce(currentInviteId)
  return process()
}

onMounted(process)
</script>

<template>
  <div class="mx-auto mt-20 max-w-lg px-4 text-center" aria-live="polite">
    <div v-if="loading">
      <p class="text-lg font-semibold text-ink-800">{{ t('invite.processing') }}</p>
      <p class="mt-2 text-sm text-ink-600">{{ t('invite.processingWait') }}</p>
    </div>

    <div v-if="needsVerification" role="alert" class="mt-4">
      <p class="text-sm text-ink-800">{{ t('invite.verifyEmail') }}</p>
      <UiButton class="mt-4" @click="retry">{{ t('invite.retry') }}</UiButton>
    </div>

    <p v-if="error" role="alert" class="mt-4 text-sm text-danger-700">{{ error }}</p>

    <p v-if="success" class="mt-4 text-sm text-success-700">{{ success }}</p>
  </div>
</template>
