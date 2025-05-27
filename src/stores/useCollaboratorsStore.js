import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useUserStore } from '@/stores/useUserStore'
import CollaboratorsService from '@/services/CollaboratorsService'

export const useCollaboratorsStore = defineStore('collaboratorsStore', () => {
  const collaborators = ref([])
  const isLoading = ref(false)
  const userStore = useUserStore()
  const invitations = ref([])

  /**
   * Load collaborators for the active event
   * @returns {Promise<void>}
   */
  const loadCollaborators = async () => {
    isLoading.value = true
    try {
      const { data, status } = await CollaboratorsService.loadCollaborators({
        eventId: userStore.activeEvent
      })
      if (status === 200) {
        collaborators.value = data.data ?? []
      } else {
        // Handle error
        console.error('Error loading collaborators:', data)
      }
    } catch (error) {
      console.error('Error loading collaborators:', error)
    } finally {
      isLoading.value = false
    }
  }

  const checkInviteToken = async ({ token, eventId }) => {
    isLoading.value = true
    try {
      const { data, status } = await CollaboratorsService.checkInviteToken({
        token,
        eventId
      })
      if (status === 200) {
        return data ?? null
      } else {
        // Handle error
        console.error('Error checking invite token:', data)
        return null
      }
    } catch (error) {
      console.error('Error checking invite token:', error)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const checkToken = async ({ tokens }) => {
    isLoading.value = true
    try {
      const { data, status } = await CollaboratorsService.checkToken({
        tokens
      })

      if (status === 200) {
        return data ?? null
      } else {
        // Handle error
        console.error('Error checking token:', data)
        return null
      }
    } catch (error) {
      console.error('Error checking token:', error)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const declineInvite = async ({ token, eventId }) => {
    isLoading.value = true
    try {
      const { data, status } = await CollaboratorsService.declineInvite({
        token,
        eventId
      })
      if (status === 200) {
        return data ?? null
      } else {
        // Handle error
        console.error('Error declining invite:', data)
        return null
      }
    } catch (error) {
      console.error('Error declining invite:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const loadInvitations = async () => {
    isLoading.value = true
    try {
      const invitationsToken = JSON.parse(localStorage.getItem('pending_invite_token') || '[]')

      if (invitationsToken.length > 0) {
        invitations.value = await checkToken({
          tokens: invitationsToken
        })
      }
    } catch (error) {
      console.error('Error loading invitations:', error)
    } finally {
      isLoading.value = false
    }
  }

  const declineInvitation = async ({ invitation }) => {
    isLoading.value = true
    try {
      const { status } = await CollaboratorsService.declineInvite({
        token: invitation.token,
        eventId: invitation.event.id
      })
      if (status === 200) {
        invitations.value = invitations.value.filter(i => i.token !== invitation.token)

        // Remove the token from localStorage
        const invitationsToken = JSON.parse(localStorage.getItem('pending_invite_token') || '[]')
        const updatedTokens = invitationsToken.filter(token => token !== invitation.token)
        localStorage.setItem('pending_invite_token', JSON.stringify(updatedTokens))

        return true
      } else {
        console.error('Error declining invitation:', status)
        return false
      }
    } catch (error) {
      console.error('Error declining invitation:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Invite a collaborator to the event
   * @param email
   * @param role
   */
  const inviteCollaborator = async ({ email, role }) => {
    isLoading.value = true
    try {
      const { data, status } = await CollaboratorsService.inviteCollaborator({
        eventId: userStore.activeEvent,
        email,
        role
      })
      if (status === 200) {
        collaborators.value.push(data.data)
        return true
      } else {
        // Handle error
        console.error('Error inviting collaborator:', data)
        return false
      }
    } catch (error) {
      console.error('Error inviting collaborator:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Resets the application state to its initial values.
   * Specifically, it clears the `collaborators` list and sets the `isLoading` flag to `false`.
   */
  const reset = () => {
    collaborators.value = []
    isLoading.value = false
  }

  return {
    collaborators,
    isLoading,
    invitations,
    loadCollaborators,
    inviteCollaborator,
    reset,
    checkInviteToken,
    declineInvite,
    checkToken,
    loadInvitations,
    declineInvitation
  }
})
