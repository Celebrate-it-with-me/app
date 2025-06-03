<script setup>
import { MessageCircle } from 'lucide-vue-next'
import CBadge from '@/components/UI/badges/CBadge.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import { ref } from 'vue'
import CConfirmModal from '@/components/UI/modals/CConfirmModal.vue'
import CModal from '@/components/UI/modals/CModal.vue'
import { useEventCommentsStore } from '@/stores/useEventCommentsStore'

const selectedComment = ref({})
const showDetailsModal = ref(false)
const confirmDeleteModal = ref(false)
const commentToDelete = ref(null)
const commentsStore = useEventCommentsStore()

const props = defineProps({
  eventComments: {
    type: Array,
    default: () => []
  }
})

const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const viewComment = comment => {
  selectedComment.value = comment
  showDetailsModal.value = true
}

const confirmDelete = comment => {
  commentToDelete.value = comment
  confirmDeleteModal.value = true
}

const toggleVisibility = async comment => {
  try {
    const response = await commentsStore.toggleCommentVisibility(comment.id)

    if (response.status === 200) {
      await commentsStore.loadNewComments()
    } else {
      console.error('Failed to toggle comment visibility:', response.error)
    }
  } catch (error) {
    console.error('Error toggling comment visibility:', error)
  }
}

const deleteComment = async () => {
  if (commentToDelete.value) {
    const response = await commentsStore.deleteComment(commentToDelete.value.id)

    if (response.status === 200) {
      await commentsStore.loadNewComments()
      confirmDeleteModal.value = false
    } else {
      console.error('Failed to delete comment:', response.error)
    }
  }
}
</script>

<template>
  <div class="overflow-x-auto">
    <table
      v-if="eventComments.length"
      class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
    >
      <thead class="bg-gray-50 dark:bg-gray-800">
        <tr>
          <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
            Author
          </th>
          <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
            Comment Preview
          </th>
          <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
            Date
          </th>
          <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
            Status
          </th>
          <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
            Actions
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
        <tr
          v-for="comment in eventComments"
          :key="comment.id"
          class="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
            {{ comment.author }}
          </td>
          <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs">
            {{ truncateText(comment.comment, 100) }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
            {{ comment.createdAt }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <CBadge :variant="comment.isApproved ? 'success' : 'gray'">
              {{ comment.isApproved ? 'Visible' : 'Hidden' }}
            </CBadge>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-left flex flex-start gap-2 text-sm">
            <CButton size="sm" variant="primary" @click="viewComment(comment)"> View </CButton>
            <CButton size="sm" variant="outline" @click="toggleVisibility(comment)">
              {{ comment.isApproved ? 'Hide' : 'Show' }}
            </CButton>
            <CButton
              size="sm"
              variant="outline"
              class="text-red-500"
              @click="confirmDelete(comment)"
            >
              Delete
            </CButton>
          </td>
        </tr>
      </tbody>
    </table>
    <!-- Comment Details Modal -->
    <CModal v-if="showDetailsModal" v-model="showDetailsModal">
      <template #title>
        <div class="flex items-center">
          <MessageCircle class="w-5 h-5 mr-2 text-rose" />
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Comment Details</h3>
        </div>
      </template>

      <div class="py-4">
        <div class="mb-4">
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Author Name</p>
          <p class="text-base text-gray-900 dark:text-white">{{ selectedComment.author }}</p>
        </div>

        <div class="mb-4">
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Date</p>
          <p class="text-base text-gray-900 dark:text-white">
            {{ selectedComment.createdAt }}
          </p>
        </div>

        <div>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Comment</p>
          <p class="text-base text-gray-900 dark:text-white whitespace-pre-wrap">
            {{ selectedComment.comment }}
          </p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <CButton @click="showDetailsModal = false">Close</CButton>
        </div>
      </template>
    </CModal>

    <!-- Confirm Delete Modal -->
    <CConfirmModal
      :model-value="confirmDeleteModal"
      title="Delete Comment"
      message="Are you sure you want to delete this comment? This action cannot be undone."
      @confirm="deleteComment()"
      @update:model-value="confirmDeleteModal = false"
    />
  </div>
</template>

<style scoped></style>
