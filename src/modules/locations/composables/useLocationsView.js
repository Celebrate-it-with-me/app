import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLocationsStore } from '@/modules/locations/stores/useLocationsStore'
import { useNotificationStore } from '@/stores/useNotificationStore'

export function useLocationsView() {
  // Composables and stores
  const router = useRouter()
  const locationStore = useLocationsStore()
  const notificationsStore = useNotificationStore()

  // Ref vars
  const loading = ref(false)
  const selectedLocationForDelete = ref(null)
  const showConfirmDelete = ref(false)

  // Computed properties
  const fullAddress = computed(() => {
    const location = locationStore.location
    if (!location) return ''
    return `${location.address}, ${location.city}, ${location.state} ${location.zip_code}`
  })

  const latitudeNumber = computed(() => {
    if (!locationStore.location) return ''

    return parseFloat(locationStore.location?.latitude)
  })

  const longitudeNumber = computed(() => {
    if (!locationStore.location) return ''

    return parseFloat(locationStore.location?.longitude)
  })

  const hasMap = computed(() => {
    return latitudeNumber.value && longitudeNumber.value
  })

  const imagesUrl = computed(() => {
    return locationStore.location.event_location_images.map(image => image.path)
  })

  const location = computed(() => locationStore.location)

  const hasLocation = computed(() => locationStore.hasLocation)

  // Functions
  const loadLocation = async () => {
    loading.value = true
    await locationStore.fetchLocation()
    loading.value = false
  }

  const confirmDelete = location => {
    selectedLocationForDelete.value = location
    showConfirmDelete.value = true
  }

  const addLocation = async () => {
    await router.push('/dashboard/locations/create')
  }

  const handleConfirmDelete = async () => {
    if (selectedLocationForDelete.value) {
      const response = await locationStore.deleteLocation(selectedLocationForDelete.value.id)

      if (response.status === 200) {
        await loadLocation()
        selectedLocationForDelete.value = null
        notificationsStore.addNotification({
          type: 'success',
          message: 'Location deleted successfully!'
        })
      } else {
        console.error('Failed to delete location:', response)
        notificationsStore.addNotification({
          type: 'error',
          message: 'Failed to delete location. Please try again.'
        })
      }
      showConfirmDelete.value = false
    }
  }

  return {
    loading,
    selectedLocationForDelete,
    showConfirmDelete,
    fullAddress,
    latitudeNumber,
    longitudeNumber,
    hasMap,
    imagesUrl,
    location,
    hasLocation,
    handleConfirmDelete,
    addLocation,
    confirmDelete,
    loadLocation
  }
}
