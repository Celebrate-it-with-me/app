<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { MessageCircle, Plus, Search, SearchX } from 'lucide-vue-next'
import { UiPageHeader, UiCard, UiButton, UiSelect, UiSkeleton, UiEmptyState, UiModal } from '@/ui'
import { useEventCommentsStore } from '@/modules/comments/stores/useEventCommentsStore'
import { useCommentsAdminController } from '@/modules/comments/composables/useCommentsAdminController'
import CommentRow from '../components/CommentRow.vue'
import CommentDetails from '../components/CommentDetails.vue'
import CommentFormModal from '../components/CommentFormModal.vue'
import { SORTS, STATUS_FILTERS } from '../utils/comments'

const { t } = useI18n()
const commentsStore = useEventCommentsStore()

// Normalizer keeps the view components stable, even if backend data changes.
const normalizeComment = c => ({
  ...c,
  authorName: c.author?.name || t('app.comments.anonymous'),
  is_pinned: c.isPinned || false,
  is_favorite: c.isFavorite || false,
  created_at: c.created_at || new Date().toISOString()
})

const ctrl = useCommentsAdminController({ store: commentsStore, normalizeComment })
const {
  loading,
  loadingMore,
  isCreating,
  isDetailOpenOnMobile,
  showDeleteConfirm,
  selectedCommentId,
  selectedComment,
  searchQuery,
  statusFilter,
  sortOrder,
  eventComments,
  filteredComments,
  hasMore,
  authorLabel
} = ctrl

const statusOptions = computed(() => STATUS_FILTERS.map(value => ({ value, label: t(`app.comments.status.${value}`) })))
const sortOptions = computed(() => SORTS.map(value => ({ value, label: t(`app.comments.sort.${value}`) })))

// Details live in a side column on desktop and in a sheet on phones.
const desktop = ref(true)
let media = null
const syncMedia = () => {
  desktop.value = media.matches
}
const sheetOpen = computed(() => !desktop.value && isDetailOpenOnMobile.value && !!selectedComment.value)

onMounted(() => {
  media = window.matchMedia('(min-width: 1024px)')
  syncMedia()
  media.addEventListener('change', syncMedia)
  ctrl.loadFirstPage()
})
onBeforeUnmount(() => media?.removeEventListener('change', syncMedia))
</script>

<template>
  <div class="mx-auto max-w-6xl">
    <UiPageHeader :title="t('app.comments.title')" :subtitle="t('app.comments.subtitle')">
      <template #actions>
        <UiButton @click="ctrl.openCreate()">
          <Plus class="h-4 w-4" aria-hidden="true" />
          {{ t('app.comments.add') }}
        </UiButton>
      </template>
    </UiPageHeader>

    <div v-if="loading && !eventComments.length" class="mt-6 space-y-3">
      <UiSkeleton class="h-24" />
      <UiSkeleton class="h-24" />
      <UiSkeleton class="h-24" />
    </div>

    <UiEmptyState v-else-if="!eventComments.length" class="mt-8" :title="t('app.comments.emptyTitle')" :description="t('app.comments.emptyText')">
      <template #icon><MessageCircle class="h-6 w-6" aria-hidden="true" /></template>
      <UiButton @click="ctrl.openCreate()">{{ t('app.comments.addFirst') }}</UiButton>
    </UiEmptyState>

    <template v-else>
      <div class="mt-5 grid gap-3 sm:grid-cols-[1fr_12rem_12rem]">
        <div class="relative">
          <Search class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" aria-hidden="true" />
          <input
            v-model="searchQuery"
            type="search"
            autocomplete="off"
            :aria-label="t('app.comments.search')"
            :placeholder="t('app.comments.search')"
            class="h-11 w-full rounded-xl border border-line-strong bg-white pl-10 pr-3 text-base text-ink-900 placeholder:text-ink-500 focus-visible:outline-2 focus-visible:outline-rose-600"
          />
        </div>
        <UiSelect v-model="statusFilter" :options="statusOptions" :aria-label="t('app.comments.statusLabel')" />
        <UiSelect v-model="sortOrder" :options="sortOptions" :aria-label="t('app.comments.sortLabel')" />
      </div>

      <div class="mt-5 grid items-start gap-6 lg:grid-cols-12">
        <div class="lg:col-span-5">
          <UiCard padding="none" class="overflow-hidden">
            <UiEmptyState v-if="!filteredComments.length" compact :title="t('app.comments.noResultsTitle')" :description="t('app.comments.noResultsText')">
              <template #icon><SearchX class="h-6 w-6" aria-hidden="true" /></template>
            </UiEmptyState>
            <template v-else>
              <CommentRow
                v-for="comment in filteredComments"
                :key="comment.id"
                :comment="comment"
                :selected="desktop && selectedCommentId === comment.id"
                @select="ctrl.selectComment"
                @toggle-pin="ctrl.togglePin"
                @toggle-favorite="ctrl.toggleFavorite"
              />
            </template>
          </UiCard>
          <UiButton v-if="hasMore" variant="secondary" block class="mt-3" :loading="loadingMore" @click="ctrl.loadMore()">
            {{ loadingMore ? t('app.comments.loadingMore') : t('app.comments.loadMore') }}
          </UiButton>
        </div>

        <UiCard v-if="desktop && selectedComment" class="lg:sticky lg:top-4 lg:col-span-7">
          <CommentDetails
            :comment="selectedComment"
            :author-label="authorLabel"
            @update-status="ctrl.updateStatus"
            @toggle-pin="ctrl.togglePin"
            @toggle-favorite="ctrl.toggleFavorite"
            @delete="ctrl.askDelete"
          />
        </UiCard>
      </div>
    </template>

    <UiModal :open="sheetOpen" :title="t('app.comments.formLabel')" @update:open="open => !open && ctrl.closeDetailOnMobile()">
      <CommentDetails
        v-if="selectedComment"
        :comment="selectedComment"
        :author-label="authorLabel"
        @update-status="ctrl.updateStatus"
        @toggle-pin="ctrl.togglePin"
        @toggle-favorite="ctrl.toggleFavorite"
        @delete="ctrl.askDelete"
      />
    </UiModal>

    <CommentFormModal v-model:open="isCreating" @comment-added="ctrl.onCommentCreated" />

    <UiModal v-model:open="showDeleteConfirm" :title="t('app.comments.deleteTitle')" :description="t('app.comments.deleteText')" size="sm">
      <template #footer>
        <UiButton variant="secondary" @click="showDeleteConfirm = false">{{ t('app.comments.cancel') }}</UiButton>
        <UiButton variant="danger" @click="ctrl.confirmDelete()">{{ t('app.comments.delete') }}</UiButton>
      </template>
    </UiModal>
  </div>
</template>
