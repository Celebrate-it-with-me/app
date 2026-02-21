// src/modules/comments/composables/useCommentSubmit.js
// All comments in code are in English, as requested.

import { computed, ref } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'

export function useCommentSubmit({ store, maxLength = 2000 } = {}) {
  const loading = ref(false)
  const submitError = ref(null)

  const validationSchema = computed(() => {
    return toTypedSchema(
      zod.object({
        comment: zod
          .string()
          .min(1, 'Comment cannot be empty')
          .max(maxLength, `Comment cannot exceed ${maxLength} characters`)
      })
    )
  })

  const submit = async commentText => {
    submitError.value = null

    try {
      loading.value = true

      const response = await store.addNewComment(commentText)

      if (response?.status >= 200 && response?.status < 300) {
        // Keep behavior consistent with your current flow.
        // If you later want to avoid refetch, you can push into store list instead.
        await store.loadNewComments()
        return { ok: true }
      }

      const message = response?.error || 'Failed to add comment.'
      submitError.value = message
      return { ok: false, error: message }
    } catch (err) {
      const message = err?.message || 'Failed to add comment.'
      submitError.value = message
      return { ok: false, error: message }
    } finally {
      loading.value = false
    }
  }

  return {
    validationSchema,
    loading,
    submitError,
    submit
  }
}
