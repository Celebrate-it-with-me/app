import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/ui'
import { useSeatingStore } from '@/modules/seating/stores/useSeatingStore'
import { useMediaQuery } from '@/modules/seating/composables/useMediaQuery'
import {
  companionOfName,
  countByStatus,
  errorKind,
  filterUnassigned,
  formToPayload,
  groupOf,
  seatsLeft,
  sortTables
} from '@/modules/seating/utils/seating'
import { templateMissingFrom } from '@/modules/template-picker/utils/templatePicker'

/** How many unseated rows show before "Show more". */
export const PAGE_SIZE = 25

export function useSeatingController() {
  const { t } = useI18n()
  const { toast } = useToast()
  const store = useSeatingStore()
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const loading = ref(true)
  const loadFailed = ref(false)
  const saving = ref(false)
  const tab = ref('tables')
  const search = ref('')
  const status = ref('all')
  const visible = ref(PAGE_SIZE)

  const showFormModal = ref(false)
  const editingTable = ref(null)
  const tableToDelete = ref(null)
  const guestToRemove = ref(null)
  const showDetailsModal = ref(false)
  const showClearAll = ref(false)
  /** Ids of the unseated guests ticked for "seat them together". */
  const selectedIds = ref([])
  /** `{ guests: [...], fromTable: table|null }` while the "Seat at..." sheet is open (fromTable set when moving). */
  const seatSheet = ref(null)
  /** `{ module, templateName }` after the API refused the first table with 409 template_missing_module (the form stays open). */
  const blocked = ref(null)

  const tables = computed(() => sortTables(store.tables))
  const selectedTable = computed(() => store.selectedTable)
  const unassigned = computed(() => store.unassigned)
  const statusCounts = computed(() => countByStatus(store.unassigned))
  const filteredUnassigned = computed(() =>
    filterUnassigned(store.unassigned, { search: search.value, status: status.value })
  )
  const visibleUnassigned = computed(() => filteredUnassigned.value.slice(0, visible.value))
  const hiddenCount = computed(() => Math.max(0, filteredUnassigned.value.length - visible.value))
  const selectedGuests = computed(() => store.unassigned.filter(g => selectedIds.value.includes(g.id)))
  const totalSeats = computed(() => store.tables.reduce((sum, tb) => sum + (Number(tb.capacity) || 0), 0))
  /** Seated people, counted from the guests the API lists per table (never from a separate counter). */
  const seatedCount = computed(() =>
    store.tables.reduce((sum, tb) => sum + (tb.assigned_guests?.length || 0), 0)
  )
  const freeSeats = computed(() => store.tables.reduce((sum, tb) => sum + seatsLeft(tb), 0))
  const companionName = guest => companionOfName(guest, store.guestIndex)

  watch([search, status], () => {
    visible.value = PAGE_SIZE
  })

  const fail = (error, fallbackKey = 'app.seating.toast.error') => {
    const kind = errorKind(error)
    if (kind === 'full') toast({ title: t('app.seating.toast.full'), tone: 'warning' })
    else if (kind === 'already') toast({ title: t('app.seating.toast.already'), tone: 'warning' })
    else if (kind === 'same') toast({ title: t('app.seating.toast.same'), tone: 'warning' })
    else if (kind === 'missing') toast({ title: t('app.seating.toast.missing'), tone: 'warning' })
    else if (kind === 'validation') toast({ title: t('app.seating.toast.invalid'), tone: 'danger' })
    else toast({ title: t(fallbackKey), tone: 'danger' })
  }

  const resync = async () => {
    try {
      await store.refresh()
    } catch {
      /* nothing else to do */
    }
  }

  /** On desktop the detail panel is never empty: keep a table selected. */
  const ensureSelection = () => {
    if (isDesktop.value && !store.selectedTable && tables.value.length) store.selectTable(tables.value[0])
  }

  async function load() {
    loading.value = true
    loadFailed.value = false
    try {
      await store.refresh()
      ensureSelection()
    } catch {
      loadFailed.value = true
      toast({ title: t('app.seating.toast.loadError'), tone: 'danger' })
    } finally {
      loading.value = false
    }
  }

  onMounted(load)

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
    blocked.value = null
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
      blocked.value = templateMissingFrom(e)
      if (!blocked.value) fail(e)
    } finally {
      saving.value = false
    }
  }

  async function confirmDelete() {
    const table = tableToDelete.value
    if (!table) return
    saving.value = true
    try {
      const freed = await store.deleteTable(table.id)
      toast({
        title: freed
          ? t('app.seating.toast.deletedWithGuests', { name: table.name, count: freed }, freed)
          : t('app.seating.toast.deleted', { name: table.name }),
        tone: 'success'
      })
      if (showDetailsModal.value && !store.selectedTable) showDetailsModal.value = false
      ensureSelection()
      tableToDelete.value = null
    } catch (e) {
      fail(e)
    } finally {
      saving.value = false
    }
  }

  /* ---- selection of unseated guests ---- */

  const isSelected = guest => selectedIds.value.includes(guest.id)
  const toggleSelect = guest => {
    selectedIds.value = isSelected(guest)
      ? selectedIds.value.filter(id => id !== guest.id)
      : [...selectedIds.value, guest.id]
  }
  const clearSelection = () => {
    selectedIds.value = []
  }
  /** Ticks (or unticks) the guest together with the rest of their group among the unseated. */
  const toggleGroup = guest => {
    const ids = groupOf(guest, store.unassigned).map(g => g.id)
    const allIn = ids.every(id => selectedIds.value.includes(id))
    selectedIds.value = allIn
      ? selectedIds.value.filter(id => !ids.includes(id))
      : [...new Set([...selectedIds.value, ...ids])]
  }
  const groupSize = guest => groupOf(guest, store.unassigned).length
  const allVisibleSelected = computed(
    () => filteredUnassigned.value.length > 0 && filteredUnassigned.value.every(g => selectedIds.value.includes(g.id))
  )
  const toggleAllVisible = () => {
    const ids = filteredUnassigned.value.map(g => g.id)
    selectedIds.value = allVisibleSelected.value
      ? selectedIds.value.filter(id => !ids.includes(id))
      : [...new Set([...selectedIds.value, ...ids])]
  }
  const showMore = () => {
    visible.value += PAGE_SIZE
  }

  /* ---- seat / move ---- */

  const openSeat = guests => {
    const list = (Array.isArray(guests) ? guests : [guests]).filter(Boolean)
    if (list.length) seatSheet.value = { guests: list, fromTable: null }
  }
  const openSeatSelected = () => openSeat(selectedGuests.value)
  const openMove = guest => {
    const table = store.selectedTable
    if (table && guest) seatSheet.value = { guests: [guest], fromTable: table }
  }
  const closeSeat = () => {
    seatSheet.value = null
  }

  async function seatAt(table) {
    const sheet = seatSheet.value
    if (!sheet || !table) return
    const { guests, fromTable } = sheet
    saving.value = true
    try {
      if (fromTable) {
        await store.moveGuest(guests[0].id, table.id)
        toast({
          title: t('app.seating.toast.moved', { guest: guests[0].name, table: table.name }),
          tone: 'success'
        })
      } else if (guests.length === 1) {
        await store.assignGuestToTable(guests[0].id, table.id)
        toast({ title: t('app.seating.toast.assigned', { guest: guests[0].name, table: table.name }), tone: 'success' })
      } else {
        const { seated, failed } = await store.bulkAssign(table.id, guests.map(g => g.id))
        if (failed > 0) {
          toast({ title: t('app.seating.toast.bulkPartial', { seated, failed, table: table.name }), tone: 'warning' })
        } else {
          toast({ title: t('app.seating.toast.bulk', { count: seated, table: table.name }, seated), tone: 'success' })
        }
      }
      const seatedIds = guests.map(g => g.id)
      selectedIds.value = selectedIds.value.filter(id => !seatedIds.includes(id))
      seatSheet.value = null
    } catch (e) {
      fail(e)
      // The table may have filled up elsewhere: resync.
      await resync()
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

  async function confirmClearAll() {
    saving.value = true
    try {
      const count = await store.clearAll()
      toast({ title: t('app.seating.toast.cleared', { count }, count), tone: 'success' })
      showClearAll.value = false
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
    loadFailed,
    saving,
    tab,
    search,
    status,
    showFormModal,
    editingTable,
    tableToDelete,
    guestToRemove,
    showDetailsModal,
    showClearAll,
    seatSheet,
    selectedIds,
    blocked,
    tables,
    selectedTable,
    unassigned,
    statusCounts,
    filteredUnassigned,
    visibleUnassigned,
    hiddenCount,
    selectedGuests,
    totalSeats,
    seatedCount,
    freeSeats,
    allVisibleSelected,
    companionName,
    groupSize,
    isSelected,
    load,
    selectTable,
    openCreate,
    openEdit,
    saveTable,
    confirmDelete,
    toggleSelect,
    toggleGroup,
    toggleAllVisible,
    clearSelection,
    showMore,
    openSeat,
    openSeatSelected,
    openMove,
    closeSeat,
    seatAt,
    confirmRemoveGuest,
    confirmClearAll,
    goAssign
  }
}
