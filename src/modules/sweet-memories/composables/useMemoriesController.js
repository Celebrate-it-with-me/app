import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/ui'
import { useSweetMemoriesStore } from '@/modules/sweet-memories/stores/useSweetMemoriesStore'
import {
  ALL_YEARS,
  availableYears,
  buildMemoryFormData,
  FILTERS_MIN,
  errorInfo,
  filterMemories,
  formToPayload,
  groupByYear,
  memoryStats,
  memoryToForm,
  sortMemories
} from '@/modules/sweet-memories/utils/memories'

export function useMemoriesController() {
  const { t } = useI18n()
  const { toast } = useToast()
  const store = useSweetMemoriesStore()

  const loading = ref(true)
  const saving = ref(false)
  const search = ref('')
  const year = ref(ALL_YEARS)
  const sort = ref('oldest')
  const hiddenOnly = ref(false)

  const showFormModal = ref(false)
  const editingMemory = ref(null)
  const memoryToDelete = ref(null)
  const fileError = ref('')

  const memories = computed(() => store.memories)
  const years = computed(() => availableYears(store.memories))
  const stats = computed(() => memoryStats(store.memories))
  const visibleMemories = computed(() =>
    sortMemories(
      filterMemories(store.memories, { search: search.value, year: year.value, hiddenOnly: hiddenOnly.value }),
      sort.value
    )
  )
  const groups = computed(() => groupByYear(visibleMemories.value))
  const filtersActive = computed(() => !!search.value.trim() || year.value !== ALL_YEARS || hiddenOnly.value)
  const showFilters = computed(() => store.memories.length >= FILTERS_MIN || filtersActive.value)

  onMounted(async () => {
    try {
      await store.loadMemories()
    } catch {
      toast({ title: t('app.memories.toast.loadError'), tone: 'danger' })
    } finally {
      loading.value = false
    }
  })

  const clearFilters = () => {
    search.value = ''
    year.value = ALL_YEARS
    hiddenOnly.value = false
  }
  const toggleSort = () => {
    sort.value = sort.value === 'oldest' ? 'newest' : 'oldest'
  }
  const toggleHiddenOnly = () => {
    hiddenOnly.value = !hiddenOnly.value
  }

  const openCreate = () => {
    editingMemory.value = null
    fileError.value = ''
    showFormModal.value = true
  }
  const openEdit = memory => {
    editingMemory.value = memory
    fileError.value = ''
    showFormModal.value = true
  }

  async function saveMemory({ form, file }) {
    saving.value = true
    fileError.value = ''
    try {
      const editing = editingMemory.value
      const payload = formToPayload(form, file, editing ? null : 0)
      const formData = buildMemoryFormData(payload)
      if (editing) await store.updateMemory(editing.id, formData)
      else await store.createMemory(formData)
      toast({ title: t(editing ? 'app.memories.toast.updated' : 'app.memories.toast.created'), tone: 'success' })
      showFormModal.value = false
    } catch (error) {
      const info = errorInfo(error)
      if (info.hasFileError) {
        fileError.value = t('app.memories.toast.fileRejected')
        toast({ title: t('app.memories.toast.fileRejected'), tone: 'danger' })
      } else if (info.kind === 'validation') {
        toast({ title: t('app.memories.toast.invalid'), tone: 'danger' })
      } else {
        toast({ title: t('app.memories.toast.error'), tone: 'danger' })
      }
    } finally {
      saving.value = false
    }
  }

  /** Same save call as the edit dialog, details only: the photo and the other fields stay as they are. */
  async function toggleVisibility(memory) {
    const form = { ...memoryToForm(memory), visible: !memory.visible }
    try {
      await store.updateMemory(memory.id, buildMemoryFormData(formToPayload(form)))
      toast({ title: t(form.visible ? 'app.memories.toast.nowVisible' : 'app.memories.toast.nowHidden'), tone: 'success' })
    } catch {
      toast({ title: t('app.memories.toast.error'), tone: 'danger' })
    }
  }

  async function confirmDelete() {
    if (!memoryToDelete.value) return
    saving.value = true
    try {
      await store.deleteMemory(memoryToDelete.value.id)
      toast({ title: t('app.memories.toast.deleted'), tone: 'success' })
      memoryToDelete.value = null
    } catch {
      toast({ title: t('app.memories.toast.error'), tone: 'danger' })
    } finally {
      saving.value = false
    }
  }

  return {
    loading,
    saving,
    search,
    year,
    sort,
    hiddenOnly,
    groups,
    showFilters,
    filtersActive,
    memories,
    years,
    stats,
    visibleMemories,
    showFormModal,
    editingMemory,
    memoryToDelete,
    fileError,
    clearFilters,
    toggleSort,
    toggleHiddenOnly,
    toggleVisibility,
    openCreate,
    openEdit,
    saveMemory,
    confirmDelete
  }
}
