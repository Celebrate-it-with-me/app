import { ref, computed, watch } from 'vue'
import { useGuestsStore } from '@/modules/guests/stores/useGuestStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { useMenusStore } from '@/modules/menus/stores/useMenusStore'

export function useCreateGuestWizard() {
  const currentStep = ref(0)
  const namedCompanions = ref([])
  const unnamedCompanions = ref(0)
  const guestStore = useGuestsStore()
  const notifications = useNotificationStore()
  const menusStore = useMenusStore()

  const steps = [{ title: 'Guest Info' }, { title: 'Companions' }, { title: 'Summary' }]

  const guestData = ref({
    name: '',
    email: '',
    phone: '',
    menuSelected: null
  })

  const preferences = ref({
    meal_preference: '',
    allergies: '',
    notes: ''
  })

  const isValidNext = computed(() => {
    return !(currentStep.value === 0 && !guestData.value.name)
  })

  const resetWizard = () => {
    currentStep.value = 0
    guestData.value = { name: '', email: '', phone: '', menuSelected: null }
    namedCompanions.value = []
    unnamedCompanions.value = 0
    preferences.value = { meal_preference: '', allergies: '', notes: '' }
  }

  const handleSubmit = async () => {
    try {
      const payload = {
        guest: guestData.value,
        namedCompanions: namedCompanions.value,
        unnamedCompanions: unnamedCompanions.value,
        preferences: preferences.value
      }

      const response = await guestStore.createGuest(payload)

      if (response?.status >= 200 && response?.status < 300) {
        await guestStore.loadGuests()
        notifications.addNotification({
          type: 'success',
          message: 'Guest added successfully!'
        })

        resetWizard()
      } else {
        notifications.addNotification({
          type: 'error',
          message: 'Something went wrong. Please try again.'
        })
      }
    } catch (error) {
      console.error(error)
      notifications.addNotification({
        type: 'error',
        message: 'Unexpected error. Please try again later.'
      })
    }
  }

  const handleStepChange = step => {
    currentStep.value = step
  }

  watch(
    () => menusStore.menus,
    newValue => {
      if (newValue?.length > 0) {
        guestData.value.menuSelected = menusStore.mainMenu?.id ?? 0
      }
    },
    { deep: true, immediate: true }
  )

  return {
    currentStep,
    namedCompanions,
    unnamedCompanions,
    guestData,
    preferences,
    steps,
    isValidNext,
    handleSubmit,
    handleStepChange,
    resetWizard
  }
}
