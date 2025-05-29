<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { MessageSquare, UserRound, PlusCircle, AlertCircle, Loader2, ArrowUpRight } from 'lucide-vue-next'
import CButton from '@/components/UI/buttons/CButton.vue'
import CInput from '@/components/UI/form2/CInput.vue'
import { useCommentsStore } from '@/stores/useCommentsStore'
import { useUserStore } from '@/stores/useUserStore'

// Store initialization
const commentsStore = useCommentsStore()
const userStore = useUserStore()

// Component state
const hasError = ref(false)
const errorMessage = ref('')
const intervalId = ref(null)
const isAddingComment = ref(false)
const newComment = ref('')

// Computed properties
const comments = computed(() => commentsStore.comments)
const isLoading = computed(() => commentsStore.isLoading)

/**
 * Load comments from the API
 */
const loadComments = async () => {
  // Don't fetch if no active event
  if (!userStore.activeEvent) return

  hasError.value = false

  try {
    const response = await commentsStore.loadLatestComments({ limit: 5 })

    if (response.status !== 200) {
      hasError.value = true
      errorMessage.value = response.message || 'Failed to load comments'
      console.error('Error loading comments:', response)
    }
  } catch (error) {
    hasError.value = true
    errorMessage.value = error.message || 'An unexpected error occurred'
    console.error('Error loading comments:', error)
  }
}

/**
 * Add a new comment
 */
const addComment = async () => {
  if (!newComment.value.trim()) return

  try {
    const response = await commentsStore.addComment({
      content: newComment.value
    })

    if (response.status === 200 || response.status === 201) {
      newComment.value = ''
      isAddingComment.value = false
    } else {
      console.error('Error adding comment:', response)
    }
  } catch (error) {
    console.error('Error adding comment:', error)
  }
}

/**
 * Format date for display
 */
const formatDate = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffDay > 0) {
    return diffDay === 1 ? 'Yesterday' : `${diffDay} days ago`
  } else if (diffHour > 0) {
    return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`
  } else if (diffMin > 0) {
    return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`
  } else {
    return 'Just now'
  }
}

/**
 * Navigate to the comments page
 */
const goToCommentsPage = () => {
  // router.push({ name: 'comments' }) // enable when route is ready
}

onMounted(async () => {
  await loadComments()

  // Set up auto-refresh every minute
  intervalId.value = setInterval(async () => {
    await loadComments()
  }, 60000)
})

onBeforeUnmount(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
    intervalId.value = null
  }
})
</script>

<template>
  <section class="bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2 text-purple-600 font-semibold text-sm bg-purple-50 dark:bg-purple-950 px-3 py-1 rounded-full">
        <MessageSquare class="w-4 h-4" />
        Latest Comments
      </div>
      <CButton
        variant="outline"
        size="sm"
        class="rounded-full flex items-center gap-1"
        @click="isAddingComment = !isAddingComment"
      >
        <PlusCircle v-if="!isAddingComment" class="w-4 h-4" />
        <span>{{ isAddingComment ? 'Cancel' : 'Add Comment' }}</span>
      </CButton>
    </div>

    <!-- Add comment form -->
    <div v-if="isAddingComment" class="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
      <CInput
        v-model="newComment"
        name="comment"
        placeholder="Write your comment..."
        class="w-full mb-3"
      />
      <div class="flex justify-end">
        <CButton
          @click="addComment"
          variant="primary"
          :disabled="!newComment.trim()"
        >
          Post Comment
        </CButton>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading && comments.length === 0" class="py-8 flex flex-col items-center justify-center">
      <Loader2 class="w-8 h-8 text-purple-500 animate-spin mb-2" />
      <p class="text-gray-500 text-sm">Loading comments...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="hasError" class="py-8 flex flex-col items-center justify-center">
      <AlertCircle class="w-8 h-8 text-red-500 mb-2" />
      <p class="text-red-500 text-sm font-medium">{{ errorMessage }}</p>
      <button
        @click="loadComments"
        class="mt-3 text-purple-600 hover:text-purple-800 text-sm font-medium"
      >
        Try again
      </button>
    </div>

    <!-- Empty state -->
    <div v-else-if="comments.length === 0" class="py-8 flex flex-col items-center justify-center">
      <MessageSquare class="w-8 h-8 text-gray-400 mb-2" />
      <p class="text-gray-500 text-sm">No comments yet</p>
      <button
        @click="isAddingComment = true"
        class="mt-3 text-purple-600 hover:text-purple-800 text-sm font-medium"
      >
        Add the first comment
      </button>
    </div>

    <!-- Comments list -->
    <ul v-else class="space-y-4 text-sm min-h-[200px]">
      <li
        v-for="comment in comments"
        :key="comment.id"
        class="border-b border-gray-100 dark:border-gray-800 last:border-0 pb-3 last:pb-0"
      >
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0">
            <div v-if="comment.user.avatar" class="w-8 h-8 rounded-full overflow-hidden">
              <img :src="comment.user.avatar" alt="User avatar" class="w-full h-full object-cover" />
            </div>
            <div v-else class="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <UserRound class="w-4 h-4 text-purple-600 dark:text-purple-300" />
            </div>
          </div>
          <div class="flex-grow">
            <div class="flex justify-between items-start">
              <div class="font-medium text-gray-900 dark:text-white">{{ comment.user.name }}</div>
              <div class="text-xs text-gray-500">{{ formatDate(comment.createdAt) }}</div>
            </div>
            <p class="text-gray-700 dark:text-gray-300 mt-1">{{ comment.content }}</p>
          </div>
        </div>
      </li>

      <!-- Loading indicator when refreshing with existing data -->
      <div v-if="isLoading" class="flex items-center justify-center pt-2">
        <Loader2 class="w-4 h-4 text-purple-500 animate-spin" />
        <span class="ml-2 text-xs text-gray-500">Refreshing...</span>
      </div>
    </ul>

    <!-- View all comments link -->
    <div class="mt-4 text-right">
      <a @click="goToCommentsPage" class="text-purple-600 hover:text-purple-800 text-sm font-medium inline-flex items-center cursor-pointer">
        View All Comments
        <ArrowUpRight class="w-3 h-3 ml-1" />
      </a>
    </div>
  </section>
</template>
