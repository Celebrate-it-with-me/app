import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/ui'
import { useSeatingStore } from '@/modules/seating/stores/useSeatingStore'
import { useMediaQuery } from '@/modules/seating/composables/useMediaQuery'
import {
  filterUnassigned,
  formToPayload,
  errorKind,
  isTableFull,
  sortTables
} from '@/modules/seating/utils/seating'

export function useSeatingController() {
  const { t } = useI18n()
  const { toast } = useToast()
  const store = useSeatingStore()
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const loading = ref(true)
  const saving = ref(false)
  const tab = ref('tables')
  const search = ref('')
  const status = ref('all')

  const showFormModal = ref(false)
  const editingTable = ref(null)
  const tableToDelete = ref(null)
  const guestToRemove = ref(null)
  const showDetailsModal = ref(false)

  const tables = computed(() => sortTables(store.tables))
  const selectedTable = computed(() => store.selectedTable)
  const unassigned = computed(() => store.unassigned)
  const filteredUnassigned = computed(() =>
    filterUnassigned(store.unassigned, { search: search.value, status: status.value })
  )
  const totalSeats = computed(() => store.tables.reduce((sum, tb) => sum + (Number(tb.capacity) || 0), 0))
  const seatedCount = computed(() =>
    store.tables.reduce((sum, tb) => sum + (tb.assigned_guests?.length || 0), 0)
  )

  const fail = (error, fallbackKey = 'app.seating.toast.error') => {
    const kind = errorKind(error)
    if (kind === 'full') toast({ title: t('app.seating.toast.full'), tone: 'warning' })
    else toast({ title: t(fallbackKey), tone: 'danger' })
  }

  onMounted(async () => {
    try {
      await store.refresh()
    } catch {
      toast({ title: t('app.seating.toast.loadError'), tone: 'danger' })
    } finally {
      loading.value = false
    }
  })

  const selectTable = table => {
    store.selectTable(table)
    if (!isDesktop.value) showDetailsModal.value = true
  }

  const openCreate = () => {
    editingTable.value = null
    showFormModal.value = true
  }
  const openEdit = table => {
    editingTable.value = table
    showFormModal.value = true
  }

  async function saveTable(form) {
    saving.value = true
    try {
      const payload = formToPayload(form)
      if (editingTable.value) {
        await store.updateTable(editingTable.value.id, payload)
        toast({ title: t('app.seating.toast.updated', { name: payload.name }), tone: 'success' })
      } else {
        const created = await store.createTable(payload)
        toast({ title: t('app.seating.toast.created', { name: created.name }), tone: 'success' })
      }
      showFormModal.value = false
    } catch (e) {
      fail(e)
    } finally {
      saving.value = false
    }
  }

  async function confirmDelete() {
    const table = tableToDelete.value
    if (!table) return
    saving.value = true
    try {
      await store.deleteTable(table.id)
      toast({ title: t('app.seating.toast.deleted', { name: table.name }), tone: 'success' })
      if (showDetailsModal.value && !store.selectedTable) showDetailsModal.value = false
      tableToDelete.value = null
    } catch (e) {
      fail(e)
    } finally {
      saving.value = false
    }
  }

  async function assignGuest(guest) {
    const table = store.selectedTable
    if (!table) return
    if (isTableFull(table)) {
      toast({ title: t('app.seating.toast.full'), tone: 'warning' })
      return
    }
    saving.value = true
    try {
      await store.assignGuestToTable(guest.id, table.id)
      toast({ title: t('app.seating.toast.assigned', { guest: guest.name, table: table.name }), tone: 'success' })
    } catch (e) {
      fail(e)
      // The table may have filled up elsewhere: resync.
      try {
        await store.refresh()
      } catch {
        /* nothing else to do */
      }
    } finally {
      saving.value = false
    }
  }

  async function confirmRemoveGuest() {
    const guest = guestToRemove.value
    const table = store.selectedTable
    if (!guest || !table) return
    saving.value = true
    try {
      await store.removeGuestFromTable(guest.id, table.id)
      toast({ title: t('app.seating.toast.removed', { guest: guest.name, table: table.name }), tone: 'success' })
      guestToRemove.value = null
    } catch (e) {
      fail(e)
    } finally {
      saving.value = false
    }
  }

  const goAssign = () => {
    showDetailsModal.value = false
    tab.value = 'unassigned'
  }

  return {
    isDesktop,
    loading,
    saving,
    tab,
    search,
    status,
    showFormModal,
    editingTable,
    tableToDelete,
    guestToRemove,
    showDetailsModal,
    tables,
    selectedTable,
    unassigned,
    filteredUnassigned,
    totalSeats,
    seatedCount,
    selectTable,
    openCreate,
    openEdit,
    saveTable,
    confirmDelete,
    assignGuest,
    confirmRemoveGuest,
    goAssign
  }
}
