// src/modules/comments/composables/useCommentsAdminController.js
// All comments in code are in English, as requested.

import { computed, ref, watch } from 'vue'
import { useCommentsFilters } from '@/modules/comments/composables/useCommentsFilters'

export function useCommentsAdminController({ store, normalizeComment }) {
  // UI state
  const loading = ref(false)
  const loadingMore = ref(false)
  const error = ref(null)

  const isCreating = ref(false)
  const isDetailOpenOnMobile = ref(false)

  const showDeleteConfirm = ref(false)
  const commentToDelete = ref(null)

  const selectedCommentId = ref(null)

  // Derived paging
  const hasMore = computed(() => store.pageSelected < store.totalPages)

  // Normalized list for UI
  const eventComments = computed(() => {
    const list = Array.isArray(store.eventComments) ? store.eventComments : []
    if (typeof normalizeComment !== 'function') return list
    return list.map(normalizeComment)
  })

  // Filters (client-side)
  const { searchQuery, statusFilter, sortOrder, filteredComments } =
    useCommentsFilters(eventComments)

  // Selection
  const selectedComment = computed(() => {
    return filteredComments.value.find(c => c.id === selectedCommentId.value) || null
  })

  const ensureSelection = () => {
    const list = filteredComments.value
    if (!list.length) {
      selectedCommentId.value = null
      return
    }

    const exists = list.some(c => c.id === selectedCommentId.value)
    if (!exists) selectedCommentId.value = list[0].id
  }

  // Loaders
  const loadFirstPage = async () => {
    loading.value = true
    error.value = null

    try {
      store.pageSelected = 1
      await store.loadCommentsPaginated()
      ensureSelection()
    } catch (err) {
      console.error('Error fetching comments:', err)
      error.value = 'Failed to load comments.'
    } finally {
      loading.value = false
    }
  }

  const refresh = async () => {
    await loadFirstPage()
  }

  const loadMore = async () => {
    if (loadingMore.value || !hasMore.value) return

    loadingMore.value = true
    try {
      await store.loadNextPage()
      // Keep selection valid after new data arrives.
      ensureSelection()
    } catch (err) {
      console.error('Error loading more comments:', err)
    } finally {
      loadingMore.value = false
    }
  }

  // UI actions
  const openCreate = () => {
    isCreating.value = true
    // On mobile, create acts like detail drawer.
    isDetailOpenOnMobile.value = true
  }

  const closeCreate = () => {
    isCreating.value = false
    // Do not force-close detail on desktop; on mobile we follow the view's logic.
  }

  const selectComment = id => {
    selectedCommentId.value = id
    isDetailOpenOnMobile.value = true
    isCreating.value = false
  }

  const closeDetailOnMobile = () => {
    isDetailOpenOnMobile.value = false
  }

  // CRUD-like actions
  const onCommentCreated = async () => {
    isCreating.value = false
    await refresh()
  }

  const updateStatus = async ({ id, status }) => {
    const list = eventComments.value
    const exists = list.some(c => c.id === id)
    if (!exists) return

    try {
      await store.updateStatus({ commentId: id, status })
      // Optional: update local normalized list if store does not refresh automatically.
    } catch (e) {
      console.log(e)
    }
  }

  const togglePin = async comment => {
    try {
      await store.toggleCommentPin(comment.id)

      // Keep UI responsive without reload.
      const raw = store.eventComments.find(x => x.id === comment.id)
      if (raw) raw.isPinned = !raw.isPinned

      // If your normalized mapping uses `is_pinned` based on `isPinned`,
      // this immediate toggle will reflect through computed normalization.
    } catch (e) {
      console.log(e)
    }
  }

  const toggleFavorite = async comment => {
    try {
      await store.toggleCommentFavorite(comment.id)

      const raw = store.eventComments.find(x => x.id === comment.id)
      if (raw) raw.isFavorite = !raw.isFavorite
    } catch (e) {
      console.log(e)
    }
  }

  const askDelete = comment => {
    commentToDelete.value = comment
    showDeleteConfirm.value = true
  }

  const confirmDelete = async () => {
    if (!commentToDelete.value) return

    try {
      await store.deleteComment(commentToDelete.value.id)

      // Remove from local state to keep UI snappy.
      store.eventComments = store.eventComments.filter(c => c.id !== commentToDelete.value.id)
      showDeleteConfirm.value = false
      commentToDelete.value = null

      ensureSelection()
    } catch (e) {
      console.log(e)
    }
  }

  const authorLabel = computed(() => {
    if (selectedComment.value?.author?.is_organizer) return 'Organizer'
    return 'Guest'
  })

  // Keep selection valid when filters change
  watch(filteredComments, () => {
    ensureSelection()
  })

  return {
    // Raw/Derived data
    eventComments,
    filteredComments,
    selectedComment,
    hasMore,

    // Filter state (for v-model)
    searchQuery,
    statusFilter,
    sortOrder,

    // UI state
    loading,
    loadingMore,
    error,
    isCreating,
    isDetailOpenOnMobile,
    selectedCommentId,
    showDeleteConfirm,

    // Actions
    loadFirstPage,
    refresh,
    loadMore,
    openCreate,
    closeCreate,
    selectComment,
    closeDetailOnMobile,
    onCommentCreated,
    updateStatus,
    togglePin,
    toggleFavorite,
    askDelete,
    confirmDelete,
    authorLabel
  }
}
