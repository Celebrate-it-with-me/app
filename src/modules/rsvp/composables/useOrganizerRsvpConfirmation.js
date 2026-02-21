import { ref, reactive, onMounted } from 'vue'
import { useOrganizerRsvpStore } from '@/stores/useOrganizerRsvpStore'
import { useNotificationStore } from '@/stores/useNotificationStore'

export function useOrganizerRsvpConfirmation(props, emit) {
  // Stores
  const organizerRsvpStore = useOrganizerRsvpStore()
  const notificationStore = useNotificationStore()

  // State
  const saving = ref(false)

  // Form Data - Initialize with guest data
  const formData = reactive({
    guest: {
      rsvp_status: props.guest.rsvpStatus || 'pending',
      notes: props.guest.notes || ''
    }
  })

  // Companions Data - Initialize with guest companions
  const companionsData = ref([])

  // Initialize data on mount
  onMounted(() => {
    // Populate companions data from guest prop
    companionsData.value = (props.guest.companions || []).map(companion => ({
      id: companion.id,
      name: companion.name,
      rsvp_status: companion.rsvpStatus || 'pending',
      notes: companion.notes || ''
    }))
  })

  // Bulk apply to companions
  const bulkApplyToCompanions = status => {
    companionsData.value.forEach(companion => {
      companion.rsvp_status = status
    })
  }

  // Save confirmation
  const saveConfirmation = async () => {
    saving.value = true

    try {
      const payload = {
        guest: formData.guest,
        companions: companionsData.value.map(companion => ({
          id: companion.id,
          rsvp_status: companion.rsvp_status,
          notes: companion.notes
        }))
      }

      const response = await organizerRsvpStore.confirmRsvp(props.guest.id, payload)

      if (response.success) {
        notificationStore.addNotification({
          type: 'success',
          message: 'RSVP confirmation updated successfully!'
        })
        emit('confirmed', response.guest)
      }
    } catch (error) {
      console.error('Error saving RSVP confirmation:', error)
      notificationStore.addNotification({
        type: 'error',
        message: 'Failed to save RSVP confirmation'
      })
    } finally {
      saving.value = false
    }
  }

  return {
    saving,
    formData,
    companionsData,
    bulkApplyToCompanions,
    saveConfirmation
  }
}
