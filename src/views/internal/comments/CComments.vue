<template>
  <section class="comments-view">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Event Comments</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">
        Manage comments from your event guests. You can view, hide, or delete comments as needed.
      </p>
    </div>

    <!-- Comments Card -->
    <CCard class="mb-6">
      <template #header>
        <div class="flex items-center justify-end mt-4 mr-4">
          <CButton
            v-if="eventComments.length"
            variant="primary"
            size="sm"
            class="flex items-center"
            @click="showAddCommentModal = true"
          >
            <PlusCircle class="w-4 h-4 mr-1" />
            Add Comment
          </CButton>
        </div>
      </template>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-12">
        <CWMLoading class="w-12 h-12 text-rose mb-4" />
        <p class="text-gray-500 dark:text-gray-400">Loading comments...</p>
      </div>

      <!-- Error State -->
      <CAlert v-else-if="error" variant="error" class="mb-6">
        <template #icon>
          <AlertCircle class="w-5 h-5" />
        </template>
        <p>{{ error }}</p>
        <CButton variant="text" size="sm" class="mt-2" @click="loadComments">
          <RefreshCw class="w-4 h-4 mr-1" /> Try Again
        </CButton>
      </CAlert>

      <!-- Comments Table -->
      <CommentsTable v-if="eventComments.length" :event-comments="eventComments" />
      <div v-else class="flex flex-col items-center justify-center py-12">
        <MessageCircle class="w-16 h-16 text-gray-400 mb-4" />
        <h3 class="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
          No comments have been added to this event yet.
        </h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
          Add comments to communicate with your guests or keep notes about the event.
        </p>
        <CButton variant="gradient" class="mt-2" @click="showAddCommentModal = true">
          <PlusCircle class="w-4 h-4 mr-2" />
          Add First Comment
        </CButton>
      </div>
    </CCard>

    <!-- Add Comment Modal -->
    <AddCommentModal :show="showAddCommentModal" @close="handleClose" />
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

// UI Components
import CCard from '@/components/UI/cards/CCard.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CWMLoading from '@/components/UI/loading/CWMLoading.vue'
import CAlert from '@/components/UI/alerts/CAlert.vue'

// Icons
import { AlertCircle, MessageCircle, PlusCircle, RefreshCw } from 'lucide-vue-next'
import { useEventCommentsStore } from '@/stores/useEventCommentsStore'
import AddCommentModal from '@/views/internal/comments/AddCommentModal.vue'
import CommentsTable from '@/views/internal/comments/CommentsTable.vue'

// Define emits
const emit = defineEmits(['toggle-visibility', 'delete-comment', 'add-comment'])

const commentsStore = useEventCommentsStore()

// Reactive state
const loading = ref(false)
const error = ref(null)
const showAddCommentModal = ref(false)

const eventComments = computed(() => commentsStore.eventComments)

// Methods
const loadComments = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await commentsStore.loadNewComments()

    if (response) {
      console.log(response)
    } else {
      error.value = 'Failed to load comments. Please try again later.'
    }
  } catch (err) {
    console.error('Error fetching comments:', err)
    error.value = 'Failed to load comments. Please try again.'
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  showAddCommentModal.value = false
}

// Initialize
onMounted(async () => {
  await loadComments()
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
