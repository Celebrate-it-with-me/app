<script setup>
import { ref } from 'vue'
import CHeading from '@/components/UI/headings/CHeading.vue'
import CWizard from '@/components/UI/wizard/CWizard.vue'
import LocationDetails from '@/views/internal/locations/LocationDetails.vue'
import LocationImages from '@/views/internal/locations/LocationImages.vue'
import LocationsReviews from '@/views/internal/locations/LocationsReviews.vue'
import { useLocationsStore } from '@/stores/useLocationsStore'
import { useNotificationStore } from '@/stores/useNotificationStore'

const locationStore = useLocationsStore()
const notificationsStore = useNotificationStore()

const currentStep = ref(0)
const isValidNext = ref(false)

const locationData = ref({})
const locationId = ref(null)
const images = ref([])

const steps = [
  { title: 'Location Details', component: LocationDetails, icon: 'location' },
  { title: 'Upload Photos', component: LocationImages, icon: 'upload' },
  { title: 'Review & Submit', component: LocationsReviews, icon: 'check' }
]

const handleStepChange = async (newStep) => {
  currentStep.value = newStep
}

const handleNextStep = (isValid) => {
  isValidNext.value = isValid
}

const handleSubmit = async () => {
  try {
    const response = await locationStore.addLocation(locationData.value)

    if (response?.status !== 201) {
      throw new Error('Failed to create location')
    }


    locationId.value = response.data.data.id

    const formData = new FormData()

    const googlePhotos = images.value.filter((image) => image.source === 'google')

    if (googlePhotos.length > 0) {
      formData.append('googlePhotos', JSON.stringify(googlePhotos))
    }

    images.value.filter((image) => image.source !== 'google')
      .forEach((image, index) => {
        formData.append(`images[${index}]`, image.file)
      })

    if (formData.has('googlePhotos') || formData.has('images[0]')) {
      const uploadResponse = await locationStore.uploadLocationImages(locationId.value, formData)

      if (uploadResponse?.status !== 200) {
        throw new Error('Failed to upload images')
      }
    }

    notificationsStore.addNotification({
      type: 'success',
      message: 'Event Location created successfully!'
    })


  } catch (e) {
    console.error(e)
    notificationsStore.addNotification({
      type: 'error',
      message: 'Error creating event location or uploading images.'
    })
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <CHeading :level="2" weight="semibold"> Event Locations </CHeading>
    </div>

    <CWizard
      :steps="steps"
      :nextValid="isValidNext"
      :initial-step="currentStep"
      @active-step="handleStepChange"
      @submit="handleSubmit"
    >
      <template #current-Step>
        <LocationDetails
          :initial-place-name="locationData.name"
          v-if="currentStep === 0"
          v-model="locationData"
          @valid="handleNextStep"
        />

        <LocationImages
          :place-id="locationData.placeId"
          v-else-if="currentStep === 1"
          v-model="images"
        />

        <LocationsReviews
          v-else-if="currentStep === 2"
          :locationData="locationData"
          :images="images"
        />
      </template>
    </CWizard>
  </div>
</template>
