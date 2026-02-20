import { ref, computed } from 'vue'
import { useTimelineStore } from '../stores/timelineStore'
import { useUserStore } from '@/stores/useUserStore'
import { useNotificationStore } from '@/stores/useNotificationStore'

export function useTimeline() {
  const timelineStore = useTimelineStore()
  const userStore = useUserStore()
  const notificationStore = useNotificationStore()

  const isModalOpen = ref(false)
  const isEditing = ref(false)
  const currentTimeline = ref({
    title: '',
    description: '',
    icon: '',
    start_time: '',
    end_time: ''
  })
  const itemToDelete = ref(null)
  const isDeleteConfirmOpen = ref(false)

  const eventId = computed(() => userStore.activeEvent)

  const timelines = computed(() => timelineStore.sortedTimelines)
  const loading = computed(() => timelineStore.loading)

  const fetchTimelines = async () => {
    if (!eventId.value) return
    try {
      await timelineStore.fetchTimelines(eventId.value)
    } catch (error) {
      notificationStore.addNotification({
        type: 'error',
        message: 'Failed to load timeline events'
      })
    }
  }

  const openCreateModal = () => {
    isEditing.value = false
    const now = new Date()
    const formatDate = date => {
      return date
        .toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
        .replace(',', '')
    }
    const todayStr = formatDate(now)

    currentTimeline.value = {
      title: '',
      description: '',
      icon: '',
      start_time: todayStr,
      end_time: todayStr
    }
    isModalOpen.value = true
  }

  const openEditModal = timeline => {
    isEditing.value = true
    currentTimeline.value = { ...timeline }
    isModalOpen.value = true
  }

  const saveTimeline = async () => {
    try {
      if (isEditing.value) {
        await timelineStore.updateTimeline(
          eventId.value,
          currentTimeline.value.id,
          currentTimeline.value
        )
        notificationStore.addNotification({
          type: 'success',
          message: 'Timeline event updated successfully'
        })
      } else {
        await timelineStore.addTimeline(eventId.value, currentTimeline.value)
        notificationStore.addNotification({
          type: 'success',
          message: 'Timeline event created successfully'
        })
      }
      isModalOpen.value = false
    } catch (error) {
      notificationStore.addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to save timeline event'
      })
    }
  }

  const confirmDelete = timeline => {
    itemToDelete.value = timeline
    isDeleteConfirmOpen.value = true
  }

  const deleteTimeline = async () => {
    if (!itemToDelete.value) return
    try {
      await timelineStore.deleteTimeline(eventId.value, itemToDelete.value.id)
      notificationStore.addNotification({
        type: 'success',
        message: 'Timeline event deleted successfully'
      })
      isDeleteConfirmOpen.value = false
      itemToDelete.value = null
    } catch (error) {
      notificationStore.addNotification({
        type: 'error',
        message: 'Failed to delete timeline event'
      })
    }
  }

  return {
    timelines,
    loading,
    isModalOpen,
    isEditing,
    currentTimeline,
    isDeleteConfirmOpen,
    fetchTimelines,
    openCreateModal,
    openEditModal,
    saveTimeline,
    confirmDelete,
    deleteTimeline
  }
}
