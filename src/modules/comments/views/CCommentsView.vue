<template>
  <section class="comments-view max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full flex flex-col">
    <!-- Page Header -->
    <div class="relative mb-8">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 class="text-4xl font-black text-gray-900 tracking-tight mb-2">
            Event
            <span
              class="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600"
            >
              Comments
            </span>
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
            @click="openCreate()"
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
        <CButton variant="gradient" class="px-8 h-12 rounded-xl" @click="openCreate()">
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
        <button class="mb-4 flex items-center gap-2 text-gray-600 font-bold" @click="closeCreate()">
          <ChevronLeft class="w-5 h-5" />
          Back to list
        </button>

        <CommentCreatePanelComponent
          @comment-added="handleCommentCreated"
          @cancel="closeCreate()"
        />
      </div>

      <!-- Inbox Layout -->
      <div v-else class="flex flex-col h-[700px] gap-6">
        <!-- Filters Bar -->
        <CommentsFiltersBarComponent
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
            <CommentsInboxListComponent
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
              @click="isCreating ? closeCreate() : closeDetailOnMobile()"
            >
              <ChevronLeft class="w-5 h-5" />
              Back to list
            </button>

            <CommentCreatePanelComponent
              v-if="isCreating"
              @comment-added="handleCommentCreated"
              @cancel="closeCreate()"
            />

            <CommentDetailsPanelComponent
              v-else
              :author-label="authorLabel"
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
// All comments in code are in English, as requested.

import { onMounted } from 'vue'

import CButton from '@/components/UI/buttons/CButton.vue'
import CWMLoading from '@/components/UI/loading/CWMLoading.vue'
import CConfirmModal from '@/components/UI/modals/CConfirmModal.vue'

import { MessageCircle, PlusCircle, ChevronLeft } from 'lucide-vue-next'

import { useEventCommentsStore } from '@/modules/comments/stores/useEventCommentsStore'
import { useCommentsAdminController } from '@/modules/comments/composables/useCommentsAdminController'

import CommentDetailsPanelComponent from '@/modules/comments/components/CommentDetailsPanelComponent.vue'
import CommentCreatePanelComponent from '@/modules/comments/components/CommentCreatePanelComponent.vue'
import CommentsInboxListComponent from '@/modules/comments/components/CommentsInboxListComponent.vue'
import CommentsFiltersBarComponent from '@/modules/comments/components/CommentsFiltersBarComponent.vue'

const commentsStore = useEventCommentsStore()

// Normalizer keeps the view components stable, even if backend data changes.
const normalizeComment = c => ({
  ...c,
  authorName: c.author?.name || 'Guest',
  status: c.status,
  is_pinned: c.isPinned || false,
  is_favorite: c.isFavorite || false,
  created_at: c.created_at || new Date().toISOString()
})

const ctrl = useCommentsAdminController({
  store: commentsStore,
  normalizeComment
})

// Expose only what the template needs (avoid ctrl.* in template)
const loading = ctrl.loading
const loadingMore = ctrl.loadingMore
const error = ctrl.error

const isCreating = ctrl.isCreating
const isDetailOpenOnMobile = ctrl.isDetailOpenOnMobile

const showDeleteConfirm = ctrl.showDeleteConfirm

const selectedCommentId = ctrl.selectedCommentId
const selectedComment = ctrl.selectedComment

const searchQuery = ctrl.searchQuery
const statusFilter = ctrl.statusFilter
const sortOrder = ctrl.sortOrder

const eventComments = ctrl.eventComments
const filteredComments = ctrl.filteredComments
const hasMore = ctrl.hasMore

const openCreate = ctrl.openCreate
const closeCreate = ctrl.closeCreate

const selectComment = ctrl.selectComment
const closeDetailOnMobile = ctrl.closeDetailOnMobile

const handleCommentCreated = ctrl.onCommentCreated
const handleUpdateStatus = ctrl.updateStatus
const handleTogglePin = ctrl.togglePin
const handleToggleFavorite = ctrl.toggleFavorite

const handleLoadMore = ctrl.loadMore
const handleDeleteComment = ctrl.askDelete
const confirmDelete = ctrl.confirmDelete
const authorLabel = ctrl.authorLabel

onMounted(() => {
  ctrl.loadFirstPage()
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
