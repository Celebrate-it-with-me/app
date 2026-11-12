<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/useUserStore'
import { useCollaboratorsStore } from '@/stores/useCollaboratorsStore'
import { UiButton, UiSkeleton, UiBadge } from '@/ui'
import AuthCard from '@/components/external/auth/AuthCard.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const collaboratorsStore = useCollaboratorsStore()

const token = route.query.token
const eventId = route.params.id
const invite = ref(null)
const loading = ref(true)
const error = ref('')
const isAuthenticated = computed(() => userStore.isAuthenticated)

const STORAGE_KEY = 'pending_invitations'
function readPending() {
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

onMounted(async () => {
  if (!token) {
    error.value = t('invite.noToken')
    loading.value = false
    return
  }
  try {
    invite.value = await collaboratorsStore.checkInviteToken({ token, eventId })
  } catch (e) {
    error.value = e.response?.data?.message || t('invite.invalid')
  } finally {
    loading.value = false
  }
})

async function decline() {
  try {
    invite.value = await collaboratorsStore.declineInvite({ token, eventId })
    if (invite.value) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(readPending().filter(i => i.id !== invite.value.id)))
    }
  } catch (e) {
    error.value = e.response?.data?.message || t('invite.declineFailed')
  }
}

async function accept() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...readPending(), invite.value]))
  try {
    if (!isAuthenticated.value) {
      return await router.push({ name: 'sign-in', query: { redirect: route.fullPath } })
    }
    return await router.push(`/dashboard/events/${invite.value.event.id}/invitations`)
  } catch (e) {
    error.value = e.response?.data?.message || t('invite.acceptFailed')
  }
}
</script>

<template>
  <section class="flex justify-center px-4 py-10 sm:py-16">
    <AuthCard :title="t('invite.title')" :subtitle="invite && invite.status === 'pending' ? t('invite.text') : ''" :error="error">
      <UiSkeleton v-if="loading" :lines="3" />
      <div v-else-if="invite" class="flex flex-col gap-4">
        <dl class="divide-y divide-line rounded-lg border border-line">
          <div class="flex items-center justify-between gap-3 px-4 py-3">
            <dt class="text-sm text-ink-500">{{ t('invite.event') }}</dt>
            <dd class="text-right font-medium text-ink-900">{{ invite.event?.event_name }}</dd>
          </div>
          <div class="flex items-center justify-between gap-3 px-4 py-3">
            <dt class="text-sm text-ink-500">{{ t('invite.role') }}</dt>
            <dd><UiBadge tone="rose">{{ invite.role }}</UiBadge></dd>
          </div>
        </dl>
        <p v-if="invite.status === 'declined'" class="text-sm text-danger-700">{{ t('invite.declined') }}</p>
        <p v-else-if="invite.status === 'accepted'" class="text-sm text-success-700">{{ t('invite.accepted') }}</p>
        <template v-else>
          <UiButton block @click="accept">{{ t('invite.accept') }}</UiButton>
          <UiButton block variant="ghost" @click="decline">{{ t('invite.decline') }}</UiButton>
          <p class="text-center text-xs text-ink-400">{{ t('invite.validity') }}</p>
        </template>
      </div>
    </AuthCard>
  </section>
</template>
