<script setup>
// All comments in code are in English, as requested.

import { computed } from 'vue'
import { PlusCircle, X, Send } from 'lucide-vue-next'
import { Form, useField } from 'vee-validate'

import { useEventCommentsStore } from '@/modules/comments/stores/useEventCommentsStore'
import { useCommentSubmit } from '@/modules/comments/composables/useCommentSubmit'

// UI Components
import CButton from '@/components/UI/buttons/CButton.vue'
import CTextarea from '@/components/UI/form2/CTextarea.vue'

const emit = defineEmits(['comment-added', 'cancel'])

const commentStore = useEventCommentsStore()

const { validationSchema, loading, submitError, submit } = useCommentSubmit({
  store: commentStore,
  maxLength: 2000
})

// Ensure the field is never undefined (CTextarea expects a String modelValue)
const {
  value: commentValue,
  resetField,
  meta
} = useField('comment', undefined, {
  initialValue: ''
})

// Extra safety: always provide a string to v-model
const commentModel = computed({
  get: () => commentValue.value ?? '',
  set: v => {
    commentValue.value = v ?? ''
  }
})

const charCount = computed(() => (commentModel.value || '').length)

const handleSubmit = async () => {
  const text = (commentModel.value || '').trim()
  if (!text) return

  const result = await submit(text)

  if (result.ok) {
    resetField()
    emit('comment-added')
  }
}

const handleCancel = () => {
  resetField()
  emit('cancel')
}
</script>

<template>
  <div
    class="h-full flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300"
  >
    <!-- Header -->
    <div
      class="p-6 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-gray-50/50 to-white"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600"
        >
          <PlusCircle class="w-6 h-6" />
        </div>
        <div>
          <h3 class="text-xl font-bold text-gray-900">New Comment</h3>
          <p class="text-sm text-gray-500 font-medium">Add a message to the event timeline</p>
        </div>
      </div>

      <button
        type="button"
        class="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
        @click="handleCancel"
      >
        <X class="w-5 h-5" />
      </button>
    </div>

    <!-- Form Body -->
    <div class="flex-grow p-6 overflow-y-auto">
      <Form
        :validation-schema="validationSchema"
        class="h-full flex flex-col"
        @submit="handleSubmit"
      >
        <div class="flex-grow mb-6">
          <label
            for="new-comment"
            class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider"
          >
            Comment Content
          </label>

          <div class="relative">
            <CTextarea
              id="new-comment"
              v-model="commentModel"
              name="comment"
              placeholder="What's on your mind? Write a comment for the event..."
              class="min-h-[200px] text-lg"
              show-error
            />
          </div>

          <p class="mt-2 text-sm text-gray-400">{{ charCount }}/2000 characters</p>

          <p v-if="submitError" class="mt-3 text-sm font-medium text-red-600">
            {{ submitError }}
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
            :disabled="!meta.valid || loading"
            class="px-8 h-12 rounded-xl shadow-lg shadow-purple-500/20"
          >
            <Send v-if="!loading" class="w-4 h-4 mr-2" />
            <span
              v-else
              class="w-4 h-4 mr-2 animate-spin border-2 border-white/30 border-t-white rounded-full"
            ></span>
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
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p class="text-xs leading-relaxed">
          <strong>Note:</strong> New comments are set to <span class="font-bold">Visible</span> by
          default. You can change the visibility or pin the comment once it's created.
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
