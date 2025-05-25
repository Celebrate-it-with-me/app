import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useUserStore } from '@/stores/useUserStore'
import CollaboratorsService from '@/services/CollaboratorsService'

export const useCollaboratorsStore = defineStore('collaborators', () => {
  const collaborators = ref([])
  const isLoading = ref(false)
  const userStore = useUserStore()

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
    loadCollaborators,
    inviteCollaborator,
    reset
  }
})
