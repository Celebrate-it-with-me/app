import { ref } from 'vue'

export function useCommentSubmit({ store } = {}) {
  const loading = ref(false)

  /** Returns { ok } and never throws; the caller shows the feedback. */
  const submit = async commentText => {
    try {
      loading.value = true
      const response = await store.addNewComment(commentText)
      if (response?.status >= 200 && response?.status < 300) {
        await store.loadNewComments()
        return { ok: true }
      }
      return { ok: false }
    } catch {
      return { ok: false }
    } finally {
      loading.value = false
    }
  }

  return { loading, submit }
}
