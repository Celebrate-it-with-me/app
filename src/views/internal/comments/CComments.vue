<template>
  <section class="comments-view max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full flex flex-col">
    <!-- Page Header -->
    <div class="relative mb-8">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 class="text-4xl font-black text-gray-900 tracking-tight mb-2">
            Event
            <span class="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600"
              >Comments</span
            >
          </h1>
          <p class="text-gray-500 font-medium">
            Manage comments from your event guests. You can view, hide, or delete comments as
            needed.
          </p>
        </div>

        <div class="flex flex-shrink-0">
          <CButton
            variant="gradient"
            class="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white shadow-xl shadow-purple-500/20 px-8 h-14 rounded-2xl transition-all hover:-translate-y-0.5 active:scale-95"
            @click="isCreating = true"
          >
            <PlusCircle class="w-5 h-5 mr-2" />
            <span class="font-bold">Add Comment</span>
          </CButton>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-grow min-h-0">
      <!-- Loading State -->
      <div
        v-if="loading"
        class="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm"
      >
        <CWMLoading class="w-12 h-12 text-rose mb-4" />
        <p class="text-gray-500 font-medium">Loading comments...</p>
      </div>

      <!-- Empty State (No comments at all) -->
      <div
        v-else-if="!eventComments.length && !isCreating"
        class="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm"
      >
        <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <MessageCircle class="w-12 h-12 text-gray-400" />
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-2">No comments yet</h3>
        <p class="text-gray-500 mb-8 text-center max-w-md">
          Add comments to communicate with your guests or keep notes about the event.
        </p>
        <CButton variant="gradient" class="px-8 h-12 rounded-xl" @click="isCreating = true">
          <PlusCircle class="w-5 h-5 mr-2" />
          Add First Comment
        </CButton>
      </div>

      <!-- Create Comment View (Full width or detail panel depending on state) -->
      <div
        v-else-if="isCreating && (!eventComments.length || isDetailOpenOnMobile)"
        class="h-full max-h-[700px]"
      >
        <!-- Mobile/Empty Back Button -->
        <button
          class="mb-4 flex items-center gap-2 text-gray-600 font-bold"
          @click="isCreating = false"
        >
          <ChevronLeft class="w-5 h-5" />
          Back to list
        </button>
        <CommentCreatePanel @comment-added="handleCommentCreated" @cancel="isCreating = false" />
      </div>

      <!-- Inbox Layout -->
      <div v-else class="flex flex-col h-[700px] gap-6">
        <!-- Filters Bar -->
        <CommentsFiltersBar
          v-model:search="searchQuery"
          v-model:status-filter="statusFilter"
          v-model:sort-order="sortOrder"
        />

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow min-h-0">
          <!-- Column A: List (Hidden on mobile when detail or creating is open) -->
          <div
            class="lg:col-span-5 h-full overflow-hidden"
            :class="{ 'hidden lg:block': isDetailOpenOnMobile || isCreating }"
          >
            <CommentsInboxList
              :comments="filteredComments"
              :selected-id="selectedCommentId"
              :loading-more="loadingMore"
              :has-more="hasMore"
              @select="selectComment"
              @toggle-pin="handleTogglePin"
              @toggle-favorite="handleToggleFavorite"
              @load-more="handleLoadMore"
            />
          </div>

          <!-- Column B: Details / Create Panel (Drawer-like on mobile) -->
          <div
            class="lg:col-span-7 h-full overflow-hidden"
            :class="{
              'fixed inset-0 z-50 p-4 bg-gray-100 lg:relative lg:inset-auto lg:p-0 lg:bg-transparent':
                isDetailOpenOnMobile || (isCreating && !isDetailOpenOnMobile),
              'hidden lg:block': !isDetailOpenOnMobile && !isCreating
            }"
          >
            <!-- Mobile Back Button -->
            <button
              v-if="isDetailOpenOnMobile || isCreating"
              class="lg:hidden mb-4 flex items-center gap-2 text-gray-600 font-bold"
              @click="isCreating ? (isCreating = false) : closeDetailOnMobile()"
            >
              <ChevronLeft class="w-5 h-5" />
              Back to list
            </button>

            <CommentCreatePanel
              v-if="isCreating"
              @comment-added="handleCommentCreated"
              @cancel="isCreating = false"
            />
            <CommentDetailsPanel
              v-else
              :comment="selectedComment"
              @update-status="handleUpdateStatus"
              @toggle-pin="handleTogglePin"
              @toggle-favorite="handleToggleFavorite"
              @delete="handleDeleteComment"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <CConfirmModal
      v-model="showDeleteConfirm"
      title="Delete Comment"
      message="Are you sure you want to delete this comment? This action cannot be undone."
      confirm-text="Delete"
      variant="danger"
      @confirm="confirmDelete"
    />
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

import CButton from '@/components/UI/buttons/CButton.vue'
import CWMLoading from '@/components/UI/loading/CWMLoading.vue'
import CConfirmModal from '@/components/UI/modals/CConfirmModal.vue'

import { MessageCircle, PlusCircle, ChevronLeft } from 'lucide-vue-next'

import CommentsFiltersBar from './CommentsFiltersBar.vue'
import CommentsInboxList from './CommentsInboxList.vue'
import CommentDetailsPanel from './CommentDetailsPanel.vue'
import CommentCreatePanel from './CommentCreatePanel.vue'

import { useEventCommentsStore } from '@/stores/useEventCommentsStore'

const commentsStore = useEventCommentsStore()

const loading = ref(false)
const loadingMore = ref(false)
const error = ref(null)
const isCreating = ref(false)
const showDeleteConfirm = ref(false)
const commentToDelete = ref(null)

const hasMore = computed(() => commentsStore.pageSelected < commentsStore.totalPages)

const selectedCommentId = ref(null)
const isDetailOpenOnMobile = ref(false)

const searchQuery = ref('')
const statusFilter = ref('all')
const sortOrder = ref('newest')

const eventComments = computed(() => {
  return commentsStore.eventComments.map(c => ({
    ...c,
    authorName: c.author?.name || 'Guest',
    status: c.status,
    is_pinned: c.isPinned || false,
    is_favorite: c.isFavorite || false,
    created_at: c.created_at || new Date().toISOString()
  }))
})

const filteredComments = computed(() => {
  let filtered = [...eventComments.value]

  // Search
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      c => c.authorName.toLowerCase().includes(q) || c.comment.toLowerCase().includes(q)
    )
  }

  // Status Filter
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(c => c.status?.toLowerCase() === statusFilter.value)
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

const selectedComment = computed(() => {
  return filteredComments.value.find(c => c.id === selectedCommentId.value) || null
})

const handleLoadMore = async () => {
  if (loadingMore.value || !hasMore.value) return

  loadingMore.value = true
  try {
    await commentsStore.loadNextPage()
  } catch (err) {
    console.error('Error loading more comments:', err)
  } finally {
    loadingMore.value = false
  }
}

// Methods
const loadComments = async () => {
  loading.value = true
  error.value = null
  commentsStore.pageSelected = 1

  try {
    await commentsStore.loadCommentsPaginated()
    if (filteredComments.value.length > 0 && !selectedCommentId.value) {
      selectedCommentId.value = filteredComments.value[0].id
    }
  } catch (err) {
    console.error('Error fetching comments:', err)
    error.value = 'Failed to load comments.'
  } finally {
    loading.value = false
  }
}

const selectComment = id => {
  selectedCommentId.value = id
  isDetailOpenOnMobile.value = true
  isCreating.value = false
}

const closeDetailOnMobile = () => {
  isDetailOpenOnMobile.value = false
}

const handleCommentCreated = async () => {
  isCreating.value = false
  await loadComments()
}

const handleUpdateStatus = async ({ id, status }) => {
  const comment = eventComments.value.find(c => c.id === id)
  if (comment) {
    try {
      await commentsStore.updateStatus({
        commentId: id,
        status
      })
    } catch (e) {
      console.log(e)
    }
  }
}

const handleTogglePin = async comment => {
  try {
    await commentsStore.toggleCommentPin(comment.id)
    // Update local state to preserve scroll position
    const c = commentsStore.eventComments.find(x => x.id === comment.id)
    if (c) c.isPinned = !c.isPinned

    // Optional: Sort after pinning? The backend sort usually handles this on refresh.
    // If we want immediate UI feedback without reload, we might need a local sort or just a reload.
    // Given it's organizer view, usually they want to see it pinned at the top.
    // Let's reload only the first page if we want to reset view, but that breaks infinite scroll state.
    // For now, let's keep it simple and just update the flag.
  } catch (e) {
    console.log(e)
  }
}

const handleToggleFavorite = async comment => {
  try {
    await commentsStore.toggleCommentFavorite(comment.id)

    const favoriteComment = commentsStore.eventComments.find(x => x.id === comment.id)
    if (favoriteComment) {
      favoriteComment.isFavorite = !favoriteComment.isFavorite
    }
  } catch (e) {
    console.log(e)
  }
}

const handleDeleteComment = comment => {
  console.log('checking delete comment', comment)
  commentToDelete.value = comment
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  if (commentToDelete.value) {
    await commentsStore.deleteComment(commentToDelete.value.id)
    // Remove from local state
    commentsStore.eventComments = commentsStore.eventComments.filter(
      c => c.id !== commentToDelete.value.id
    )

    showDeleteConfirm.value = false
    commentToDelete.value = null

    // Select another comment if one was deleted
    if (filteredComments.value.length > 0) {
      selectedCommentId.value = filteredComments.value[0].id
    } else {
      selectedCommentId.value = null
    }
  }
}

// Watchers
watch([searchQuery, statusFilter, sortOrder], () => {
  loadComments()
})

watch(filteredComments, newVal => {
  if (newVal.length > 0 && !newVal.find(c => c.id === selectedCommentId.value)) {
    selectedCommentId.value = newVal[0].id
  } else if (newVal.length === 0) {
    selectedCommentId.value = null
  }
})
</script>

<style scoped>
.comments-view {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
