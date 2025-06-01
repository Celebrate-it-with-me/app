<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/useUserStore'
import CButton from '@/components/UI/buttons/CButton.vue'
import CPageLoaderV2 from '@/components/UI/loading/CPageLoaderV2.vue'
import { useCollaboratorsStore } from '@/stores/useCollaboratorsStore'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const token = route.query.token
const eventId = route.params.id
const invite = ref(null)
const loading = ref(true)
const error = ref(null)
const collaboratorsStore = useCollaboratorsStore()

const isAuthenticated = computed(() => userStore.isAuthenticated)

onMounted(async () => {
  if (!token) {
    error.value = 'No invitation token provided.'
    loading.value = false
    return
  }

  try {
    invite.value = await collaboratorsStore.checkInviteToken({
      token,
      eventId
    })
  } catch (e) {
    error.value = e.response?.data?.message || 'Invalid or expired invitation.'
  } finally {
    loading.value = false
  }
})

const declineInvite = async () => {
  try {
    invite.value = await collaboratorsStore.declineInvite({
      token,
      eventId
    })

    if (invite.value) {
      let pendingInvitations = JSON.parse(localStorage.getItem('pending_invitations') || '[]')

      if (!Array.isArray(pendingInvitations)) {
        pendingInvitations = []
      } else {
        pendingInvitations = pendingInvitations.filter(inv => inv.id !== invite.value.id)
      }

      localStorage.setItem('pending_invitations', JSON.stringify(pendingInvitations))
    }
  } catch (e) {
    error.value = e.response?.data?.message || 'Failed to decline invitation.'
  } finally {
    loading.value = false
  }
}

const acceptInvite = async () => {
  if (token && typeof token === 'string') {
    let pendingInvite = JSON.parse(localStorage.getItem('pending_invitations') || '[]')
    if (!Array.isArray(pendingInvite)) {
      pendingInvite = []
    }

    pendingInvite.push(invite.value)
    localStorage.setItem('pending_invitations', JSON.stringify(pendingInvite))
  }

  try {
    if (!isAuthenticated.value) {
      return await router.push({ name: 'sign-in', query: { redirect: `/invite?token=${token}` } })
    }

    return await router.push(`/dashboard/events/${invite.value.event.id}/invitations`)
  } catch (e) {
    error.value = e.response?.data?.message || 'Failed to accept invitation.'
  }
}
</script>

<template>
  <div class="max-w-xl mx-auto py-20 px-6">
    <CPageLoaderV2 v-if="loading" />

    <div v-else-if="error" class="text-center text-red-500 font-medium text-sm">
      {{ error }}
    </div>

    <div v-else>
      <h1 class="text-2xl font-bold mb-4 text-center text-primary">
        You're Invited to Collaborate!
      </h1>

      <div
        class="bg-white dark:bg-gray-900 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700"
      >
        <p class="text-sm mb-2 text-gray-700 dark:text-gray-300">
          <strong>Event:</strong> {{ invite.event.event_name }}
        </p>
        <p class="text-sm mb-4 text-gray-700 dark:text-gray-300">
          <strong>Role:</strong> {{ invite.role }}
        </p>

        <template v-if="invite.status === 'declined'">
          <p class="text-sm text-red-500 font-medium mb-4">
            This invitation has already been declined.
          </p>
        </template>
        <template v-else-if="invite.status === 'accepted'">
          <p class="text-sm text-green-500 font-medium mb-4">
            You have already accepted this invitation.
          </p>
        </template>
        <template v-else>
          <p class="text-sm mb-4 text-gray-700 dark:text-gray-300">
            Click the button below to accept this invitation and join the event as a collaborator.
          </p>

          <CButton variant="gradient" class="w-full" @click="acceptInvite">
            Accept Invitation
          </CButton>

          <CButton variant="secondary" class="w-full mt-3" @click="declineInvite">
            Decline Invitation
          </CButton>
          <p class="text-xs mt-4 text-center text-gray-500 dark:text-gray-400">
            This invitation is valid for 7 days. If you already have an account, please log in to
            accept.
          </p>
        </template>
      </div>
    </div>
  </div>
</template>
