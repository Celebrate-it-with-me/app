import { computed, ref } from 'vue'

export function useCommentsFilters(eventCommentsRef) {
  const searchQuery = ref('')
  const statusFilter = ref('all')
  const sortOrder = ref('newest')

  const filteredComments = computed(() => {
    let filtered = [...(eventCommentsRef?.value || [])]

    // Search
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      filtered = filtered.filter(c => {
        const author = (c.authorName || '').toLowerCase()
        const comment = (c.comment || '').toLowerCase()
        return author.includes(q) || comment.includes(q)
      })
    }

    // Status filter
    if (statusFilter.value !== 'all') {
      filtered = filtered.filter(c => (c.status || '').toLowerCase() === statusFilter.value)
    }

    // Sorting
    filtered.sort((a, b) => {
      if (sortOrder.value === 'pinned') {
        if (a.is_pinned && !b.is_pinned) return -1
        if (!a.is_pinned && b.is_pinned) return 1
      }

      const dateA = new Date(a.created_at)
      const dateB = new Date(b.created_at)

      return sortOrder.value === 'oldest' ? dateA - dateB : dateB - dateA
    })

    return filtered
  })

  return {
    // State
    searchQuery,
    statusFilter,
    sortOrder,

    // Derived
    filteredComments
  }
}
