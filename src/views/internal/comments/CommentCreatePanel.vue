<script setup>
import { computed, reactive, ref } from 'vue'
import { PlusCircle, X, Send } from 'lucide-vue-next'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import { Form, Field, ErrorMessage } from 'vee-validate'
import { useEventCommentsStore } from '@/stores/useEventCommentsStore'

// UI Components
import CButton from '@/components/UI/buttons/CButton.vue'
import CTextarea from '@/components/UI/form2/CTextarea.vue'

const emit = defineEmits(['commentAdded', 'cancel'])

const validationSchema = computed(() => {
  return toTypedSchema(
    zod.object({
      comment: zod
        .string()
        .min(1, 'Comment cannot be empty')
        .max(2000, 'Comment cannot exceed 2000 characters')
    })
  )
})

const commentStore = useEventCommentsStore()
const loading = ref(false)

const newComment = reactive({
  text: ''
})

const createNewComment = async () => {
  try {
    loading.value = true
    console.log('Creating new comment:', newComment.text)

    const response = await commentStore.addNewComment(newComment.text)
    if (response.status >= 200 && response.status < 300) {
      await commentStore.loadNewComments()
      newComment.text = ''
      emit('commentAdded')
    } else {
      console.error('Failed to add comment:', response.error)
    }
  } catch (error) {
    console.error('Validation failed:', error)
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  newComment.text = ''
  emit('cancel')
}
</script>

<template>
  <div class="h-full flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
    <!-- Header -->
    <div class="p-6 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-gray-50/50 to-white">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
          <PlusCircle class="w-6 h-6" />
        </div>
        <div>
          <h3 class="text-xl font-bold text-gray-900">New Comment</h3>
          <p class="text-sm text-gray-500 font-medium">Add a message to the event timeline</p>
        </div>
      </div>
      <button
        @click="handleCancel"
        class="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
      >
        <X class="w-5 h-5" />
      </button>
    </div>

    <!-- Form Body -->
    <div class="flex-grow p-6 overflow-y-auto">
      <Form
        :validation-schema="validationSchema"
        @submit="createNewComment"
        class="h-full flex flex-col"
      >
        <div class="flex-grow mb-6">
          <label for="new-comment" class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
            Comment Content
          </label>
          <div class="relative">
            <CTextarea
              id="new-comment"
              v-model="newComment.text"
              name="comment"
              placeholder="What's on your mind? Write a comment for the event..."
              class="min-h-[200px] text-lg"
              show-error
            />
          </div>
          <p class="mt-2 text-sm text-gray-400">
            {{ newComment.text.length }}/2000 characters
          </p>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-4 pt-6 border-t border-gray-50">
          <CButton
            variant="outline"
            type="button"
            class="px-6 h-12 rounded-xl border-gray-200 font-bold"
            @click="handleCancel"
          >
            Cancel
          </CButton>
          <CButton
            variant="gradient"
            type="submit"
            :disabled="!newComment.text.trim() || loading"
            class="px-8 h-12 rounded-xl shadow-lg shadow-purple-500/20"
          >
            <Send v-if="!loading" class="w-4 h-4 mr-2" />
            <span v-else class="w-4 h-4 mr-2 animate-spin border-2 border-white/30 border-t-white rounded-full"></span>
            {{ loading ? 'Posting...' : 'Post Comment' }}
          </CButton>
        </div>
      </Form>
    </div>

    <!-- Tips/Info -->
    <div class="p-6 bg-purple-50/50 border-t border-purple-100/50">
      <div class="flex gap-3 text-purple-700">
        <div class="flex-shrink-0 mt-0.5">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-xs leading-relaxed">
          <strong>Note:</strong> New comments are set to <span class="font-bold">Visible</span> by default. You can change the visibility or pin the comment once it's created.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-in {
  animation-duration: 0.3s;
}
</style>
