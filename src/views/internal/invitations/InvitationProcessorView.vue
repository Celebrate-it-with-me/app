<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/useUserStore'
import { useCollaboratorsStore } from '@/stores/useCollaboratorsStore'
import { useHydrationStore } from '@/stores/useHydrationStore'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref(null)
const success = ref(null)
const userStore = useUserStore()
const collaboratorsStore = useCollaboratorsStore()
const hydrationStore = useHydrationStore()

onMounted(async () => {
  console.log('on mounted check')
  const eventId = Number(route.params.id)
  const currentEmail = userStore.email

  const invites = JSON.parse(localStorage.getItem('pending_invitations'))

  const invite = invites.find(
    i => i.event.id === eventId && i.email === currentEmail && i.status === 'pending'
  )

  if (!invite) {
    error.value = 'No valid invitation found for your account.'
    loading.value = false
    return
  }

  try {
    const response = await collaboratorsStore.acceptInvitation(invite)

    if (response) {
      await hydrationStore.hydrateAll()
    }

    console.log('response', response)
    // Send request to accept the invitation
    /*await axios.post('/api/event-invitations/accept', {
      invitation_id: invite.id,
    })*/

    invites.remove(invite.id)
    success.value = `Welcome! You've been added to “${invite.event.event_name}”`
    setTimeout(() => {
      router.push(`/dashboard/events/${eventId}/details`)
    }, 2000)
  } catch (e) {
    error.value = 'There was an error accepting the invitation. Please try again later.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="max-w-lg mx-auto mt-20 text-center px-4">
    <div v-if="loading">
      <p class="text-lg font-semibold text-gray-700">Processing your invitation...</p>
      <p class="text-sm text-gray-500 mt-2">Please wait.</p>
    </div>

    <div v-if="error" class="text-red-600 mt-4 text-sm">
      {{ error }}
    </div>

    <div v-if="success" class="text-green-600 mt-4 text-sm">
      {{ success }}
    </div>
  </div>
</template>
