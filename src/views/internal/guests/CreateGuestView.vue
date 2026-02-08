<template>
  <div class="space-y-8">
    <CHeading :level="2" weight="semibold">Add Guest</CHeading>

    <CWizard
      :steps="steps"
      :next-valid="isValidNext"
      :initial-step="currentStep"
      @active-step="handleStepChange"
      @submit="handleSubmit"
    >
      <template #current-Step>
        <GuestInfoStep v-if="currentStep === 0" v-model="guestData" />

        <GuestCompanionsStep
          v-else-if="currentStep === 1"
          v-model:named="namedCompanions"
          v-model:unnamed-count="unnamedCompanions"
        />

<!--        <GuestPreferencesStep v-else-if="currentStep === 2" v-model="preferences" />-->

        <GuestSummaryStep
          v-else-if="currentStep === 2"
          :guest-data="guestData"
          :named-companions="namedCompanions"
          :unnamed-companions="unnamedCompanions"
          :preferences="preferences"
        />
      </template>
    </CWizard>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import CWizard from '@/components/UI/wizard/CWizard.vue'
import CHeading from '@/components/UI/headings/CHeading.vue'
import GuestInfoStep from '@/components/internal/guests/GuestInfoStep.vue'
import GuestCompanionsStep from '@/components/internal/guests/GuestCompanionsStep.vue'
import GuestPreferencesStep from '@/components/internal/guests/GuestPreferencesStep.vue'
import GuestSummaryStep from '@/components/internal/guests/GuestSummaryStep.vue'
import { useGuestsStore } from '@/stores/useGuestStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { useMenusStore } from '@/stores/useMenusStore'

const currentStep = ref(0)
const namedCompanions = ref([])
const unnamedCompanions = ref(0)
const guestStore = useGuestsStore()
const notifications = useNotificationStore()
const menusStore = useMenusStore()

const steps = [
  { title: 'Guest Info' },
  { title: 'Companions' },
  { title: 'Summary' }
]

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

const resetWizard = () => {
  currentStep.value = 0
  guestData.value = { name: '', email: '', phone: '', menuSelected: null }
  namedCompanions.value = []
  unnamedCompanions.value = 0
  preferences.value = { meal_preference: '', allergies: '', notes: '' }
}

const isValidNext = computed(() => {
  return !(currentStep.value === 0 && !guestData.value.name)
})

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
</script>
