import { computed, ref } from 'vue'
import { useDressCodeStore } from '@/modules/dress-code/stores/useDressCodeStore'

export default function useShowDressCode(emit) {
  const dressCodeStore = useDressCodeStore()
  const dressCode = computed(() => dressCodeStore.dressCode)

  // Map dress code type to a more readable format
  const dressCodeTypeMap = {
    formal: 'Formal',
    'semi-formal': 'Semi-Formal',
    casual: 'Casual',
    thematic: 'Thematic',
    'black-tie': 'Black Tie'
  }

  const formattedDressCodeType = computed(() => {
    return dressCodeTypeMap[dressCode.value.dressCodeType] || dressCode.value.dressCodeType
  })

  // Color names mapping for better UX
  const colorNames = {
    '#FFD700': 'Gold',
    '#9333EA': 'Purple',
    '#EC4899': 'Pink',
    '#000000': 'Black',
    '#FFFFFF': 'White',
    '#EF4444': 'Red',
    '#3B82F6': 'Blue',
    '#10B981': 'Green',
    '#F59E0B': 'Amber',
    '#8B5CF6': 'Violet',
    '#06B6D4': 'Cyan'
  }

  const getColorName = hex => {
    return colorNames[hex.toUpperCase()] || 'Custom'
  }

  // Function to handle edit button click
  const handleEdit = () => {
    emit('editDressCode')
  }

  // Image preview modal
  const selectedImage = ref(null)
  const showImageModal = ref(false)

  const openImagePreview = image => {
    selectedImage.value = image
    showImageModal.value = true
  }

  const closeImagePreview = () => {
    showImageModal.value = false
    selectedImage.value = null
  }

  // Toast notification
  const showToast = ref(false)
  const toastMessage = ref('')

  const showNotification = message => {
    toastMessage.value = message
    showToast.value = true
    setTimeout(() => {
      showToast.value = false
    }, 3000)
  }

  // Delete confirmation modal
  const showDeleteModal = ref(false)

  const confirmDelete = () => {
    showDeleteModal.value = true
  }

  const deleteDressCode = async () => {
    try {
      showDeleteModal.value = false
      await dressCodeStore.deleteDressCode(dressCode.value.id)
      emit('deleteDressCode')
      showNotification('Dress code deleted successfully!')
    } catch (error) {
      console.error('Failed to delete dress code:', error)
      showNotification('Failed to delete dress code. Please try again later.')
    }
  }

  return {
    dressCode,
    dressCodeTypeMap,
    formattedDressCodeType,
    colorNames,
    // Image preview modal
    selectedImage,
    showImageModal,
    // Toast notification
    showToast,
    toastMessage,
    // Delete confirmation modal
    showDeleteModal,
    confirmDelete,
    deleteDressCode,
    getColorName,
    handleEdit,
    showNotification,
    closeImagePreview,
    openImagePreview
  }
}
