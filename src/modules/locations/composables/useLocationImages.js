import { ref, watch } from 'vue'
import { useLocationsStore } from '@/stores/useLocationsStore'

export function useLocationImages(props, emit) {
  const renderKey = ref(0)
  const locationStore = useLocationsStore()
  const loading = ref(true)
  const photos = ref([])

  watch(photos, () => {
    emit('update:modelValue', photos.value)
  })

  const fetchGooglePhotos = async () => {
    try {
      loading.value = true
      photos.value = []
      const response = await locationStore.getPlaceImages(props.placeId)
      if (response.status === 200 && Array.isArray(response.data)) {
        photos.value = response.data
        renderKey.value++
      }
    } catch (error) {
      console.error('Error loading Google photos:', error)
    } finally {
      loading.value = false
    }
  }

  const removePhoto = index => {
    photos.value.splice(index, 1)
  }

  const addUploadedPhotos = newPhotos => {
    photos.value.push(...newPhotos)
  }

  watch(
    () => props.placeId,
    async (newVal, oldVal) => {
      if (newVal && newVal !== oldVal) {
        await fetchGooglePhotos()
      }
    },
    { immediate: true }
  )

  return {
    renderKey,
    loading,
    photos,
    removePhoto,
    addUploadedPhotos
  }
}
