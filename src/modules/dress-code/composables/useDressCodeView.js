import { useDressCodeStore } from '@/modules/dress-code/stores/useDressCodeStore'
import { computed, onMounted, ref } from 'vue'

export function useDressCodeView() {
  const dressCodeStorage = useDressCodeStore()
  const hasDressCode = computed(() => dressCodeStorage.hasDressCode)
  const activeView = ref('')
  const loading = ref(false)

  const handleShowForm = () => {
    activeView.value = 'dressCodeForm'
  }

  const handleFormSubmitted = () => {
    activeView.value = 'showDressCode'
  }

  const handleFormCancelled = () => {
    activeView.value = 'showDressCode'
  }

  const handleDeleteDressCode = () => {
    activeView.value = 'noDressCode'
  }

  onMounted(async () => {
    loading.value = true
    await dressCodeStorage.loadDressCode()
    loading.value = false
    activeView.value = hasDressCode.value ? 'showDressCode' : 'noDressCode'
  })

  return {
    hasDressCode,
    activeView,
    loading,
    handleShowForm,
    handleFormSubmitted,
    handleFormCancelled,
    handleDeleteDressCode
  }
}
