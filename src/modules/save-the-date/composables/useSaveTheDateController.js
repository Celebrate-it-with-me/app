import { ref, onMounted, watch, computed } from 'vue'
import { useUserStore } from '@/stores/useUserStore'
import { useSaveTheDateStore } from '../stores/useSaveTheDateStore'
import { useNotificationStore } from '@/stores/useNotificationStore'

export function useSaveTheDateController() {
  const userStore = useUserStore()
  const stdStore = useSaveTheDateStore()
  const notificationStore = useNotificationStore()

  const eventId = computed(() => userStore.activeEvent)

  const form = ref({
    show_countdown: false,
    use_add_to_calendar: false,
    date_source: 'event',
    custom_starts_at: null,
    countdown_units: [],
    countdown_finish_behavior: 'hide',
    calendar_providers: [],
    calendar_mode: 'modal',
    calendar_location_override: null,
    calendar_description_override: null,
    is_enabled: false
  })

  const isCreating = ref(false)
  const isEnabled = computed(() => stdStore.isEnabled || isCreating.value)

  const loadConfig = async () => {
    if (!eventId.value) return
    try {
      await stdStore.fetchConfig(eventId.value)
      if (stdStore.config) {
        syncFormWithStore()
      }
    } catch (error) {
      notificationStore.addNotification({
        type: 'error',
        message: 'Failed to load Save The Date configuration.'
      })
    }
  }

  const syncFormWithStore = () => {
    if (stdStore.config) {
      form.value = { ...stdStore.config }
    }
  }

  const handleEnable = () => {
    isCreating.value = true
    form.value = {
      show_countdown: true,
      use_add_to_calendar: true,
      date_source: 'event',
      custom_starts_at: null,
      countdown_units: ['days', 'hours', 'minutes', 'seconds'],
      countdown_finish_behavior: 'hide',
      calendar_providers: ['google', 'apple', 'outlook'],
      calendar_mode: 'modal',
      calendar_location_override: null,
      calendar_description_override: null,
      is_enabled: true
    }
  }

  const handleSave = async () => {
    try {
      await stdStore.saveConfig(eventId.value, form.value)
      isCreating.value = false
      notificationStore.addNotification({
        type: 'success',
        message: 'Changes saved successfully.'
      })
    } catch (error) {
      notificationStore.addNotification({
        type: 'error',
        message: 'Failed to save changes.'
      })
    }
  }

  onMounted(async () => {
    await loadConfig()
  })

  watch(eventId, async newId => {
    if (newId) await loadConfig()
  })

  return {
    form,
    loading: computed(() => stdStore.loading),
    saving: computed(() => stdStore.saving),
    isEnabled,
    isCreating,
    handleEnable,
    handleSave
  }
}
