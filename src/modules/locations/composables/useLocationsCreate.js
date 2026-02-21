import { ref } from 'vue'
import { useLocationsStore } from '@/modules/locations/stores/useLocationsStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { useRouter } from 'vue-router'
import LocationDetails from '@/modules/locations/components/LocationDetails.vue'
import LocationImages from '@/modules/locations/components/LocationImages.vue'
import LocationsReviews from '@/modules/locations/components/LocationsReviews.vue'

export default function useLocationsCreate() {
  const locationStore = useLocationsStore()
  const notificationsStore = useNotificationStore()
  const router = useRouter()

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

  const handleStepChange = async newStep => {
    currentStep.value = newStep
  }

  const handleNextStep = isValid => {
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

      const googlePhotos = images.value.filter(image => image.source === 'google')

      if (googlePhotos.length > 0) {
        formData.append('googlePhotos', JSON.stringify(googlePhotos))
      }

      images.value
        .filter(image => image.source !== 'google')
        .forEach((image, index) => {
          formData.append(`images[${index}]`, image.file)
        })

      if (formData.has('googlePhotos') || formData.has('images[0]')) {
        const uploadResponse = await locationStore.uploadLocationImages(locationId.value, formData)

        if (uploadResponse?.status !== 200) {
          throw new Error('Failed to upload images')
        }
      }

      await router.push('/dashboard/locations')

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

  return {
    currentStep,
    isValidNext,
    locationData,
    locationId,
    images,
    steps,
    handleSubmit,
    handleNextStep,
    handleStepChange
  }
}
