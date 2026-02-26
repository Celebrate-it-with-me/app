<script setup>
import { computed, onMounted, ref } from 'vue'
import { Pin, Heart } from 'lucide-vue-next'
import { useEventCommentsStore } from '@/modules/comments/stores/useEventCommentsStore'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import { Form } from 'vee-validate'
import TextAreaField from '@/components/UI/form/TextAreaField.vue'
import { useNotificationStore } from '@/stores/useNotificationStore'
import CWMLoading from '@/components/UI/loading/CWMLoading.vue'
import { vInfiniteScroll } from '@vueuse/components'
import { useTemplateStore } from '@/stores/publicEvents/useTemplateStore'
import { useForm } from 'vee-validate'

const { meta } = useForm()

defineProps({
  origin: {
    type: String,
    required: false,
    default: 'admin'
  }
})

const page = ref(1)
const eventCommentValidationSchema = computed(() => {
  return toTypedSchema(
    zod.object({
      comment: zod.string()
    })
  )
})
const commentStore = useEventCommentsStore()
const templateStore = useTemplateStore()
const creatingComment = ref(false)
const loadingComments = ref(false)
const notificationStore = useNotificationStore()
const loadingMore = ref(false)
const totalItems = ref(0)

const buttonTextComputed = computed(() => {
  return 'Enviar!'
})

const commentsTitle = computed(() => {
  return 'Palabras para Recordar!'
})
const commentsSubtitle = computed(() => {
  return 'Dejale tus comentarios, buenos deseos o saludos a Isabella'
})

onMounted(async () => {
  await loadComments()
})

const loadComments = async (updatePage = true) => {
  try {
    loadingComments.value = true

    const response = await commentStore.loadPublicComments(templateStore.eventId)

    if (response.status === 200) {
      commentStore.eventComments = response.data?.data ?? []

      if (updatePage) {
        page.value = (response.data?.meta?.current_page ?? 1) + 1
      }
      totalItems.value = response.data?.meta?.total ?? 0
    } else {
      notificationStore.addNotification({
        type: 'error',
        message: 'Oops something went wrong!.'
      })
    }
  } catch (e) {
    console.log(e)
  } finally {
    loadingComments.value = false
  }
}

const onLoadMore = async () => {
  try {
    if (canLoadMore.value) {
      loadingMore.value = true
      const response = await commentStore.loadMoreCommentsPublic(templateStore.eventId, page.value)

      if (response.status === 200) {
        commentStore.eventComments = [...commentStore.eventComments, ...(response.data?.data ?? [])]
        page.value += 1
      } else {
        notificationStore.addNotification({
          type: 'error',
          message: 'Oops something went wrong!.'
        })
      }
    }
  } catch (e) {
    console.error(e)
  } finally {
    loadingMore.value = false
  }
}

const canLoadMore = computed(() => {
  return !loadingMore.value && commentStore.eventComments.length < totalItems.value
})

const addComment = async () => {
  try {
    creatingComment.value = true

    const response = await commentStore.addNewCommentPublic(
      templateStore.eventId,
      templateStore.guest?.accessCode || 0,
      commentStore.currentComment.comment
    )

    if (response.status >= 200 && response.status < 300) {
      await loadComments(false)
      commentStore.currentComment.comment = ''
      notificationStore.addNotification({
        type: 'success',
        message: 'Comment successfully added.!'
      })
    } else {
      notificationStore.addNotification({
        type: 'error',
        message: 'Oops something went wrong!.'
      })
    }
  } catch (error) {
    console.error(error)
  } finally {
    creatingComment.value = false
  }
}

const sortedComments = computed(() => {
  return [...commentStore.eventComments].sort((a, b) => {
    // 1. Pinned primero
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
    // 2. Favorites después
    if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1
    // 3. Por ID descendente (más recientes primero si no son pinned/fav)
    return b.id - a.id
  })
})

const onInvalidSubmit = error => {
  console.log('error', error)
}
</script>

<template>
  <section
    id="sectionComments"
    class="hn-parallax-section hn-comments-section relative w-full min-h-screen flex flex-col px-4 sm:px-6 lg:px-10 py-16 lg:py-20 overflow-hidden"
  >
    <!-- Background layer for parallax -->
    <div class="hn-parallax-bg hn-comments-bg absolute inset-0"></div>
    <div class="relative z-10 mx-auto w-full max-w-4xl">
      <div class="hn-comments-glass w-full">
        <!-- Header -->
        <div class="text-center pb-6 flex-shrink-0">
          <h2 class="hn-comments-title">
            {{ commentsTitle }}
          </h2>
          <div class="hn-title-divider"></div>
          <p class="hn-comments-subtitle">
            {{ commentsSubtitle }}
          </p>
        </div>

        <div class="flex flex-col gap-8">
          <!-- Form -->
          <Form
            :validation-schema="eventCommentValidationSchema"
            class="hn-comment-form w-full"
            @submit="addComment"
            @invalid-submit="onInvalidSubmit"
          >
            <p class="text-sm text-[#D4AF37] font-semibold font-montserrat mb-2">Tu mensaje</p>

            <TextAreaField
              v-model="commentStore.currentComment.comment"
              name="comment"
              placeholder="Escribe tu comentario aquí..."
              :show-error="meta.submitCount > 0 || meta.touched"
              :rows="3"
              :class-input="`
                hn-textarea-input
                w-full
                rounded-xl
                px-4 py-3
                resize-none
                text-[#0F172AD9]
              `"
            />

            <button
              type="submit"
              class="hn-submit-btn w-full py-3 rounded-xl font-semibold text-white mt-4"
              :disabled="creatingComment"
            >
              <CWMLoading v-if="creatingComment" />
              <span v-else>{{ buttonTextComputed }}</span>
            </button>

            <p class="text-xs text-gray-400 mt-2 font-montserrat">
              Presiona "Enviar" para dejar tu mensaje.
            </p>
          </Form>

          <!-- Comments list -->
          <div class="w-full">
            <div v-if="commentStore.eventComments.length > 0">
              <div
                v-infinite-scroll="[onLoadMore, { distance: 10 }]"
                class="comments-list flex flex-col gap-3 overflow-y-auto pr-1"
              >
                <div
                  v-for="comment in sortedComments"
                  :key="comment.id"
                  class="hn-comment-card p-4 rounded-xl transition-all duration-300"
                  :class="[comment.isPinned ? 'hn-comment-pinned' : '']"
                >
                  <div class="flex items-center justify-between mb-1">
                    <div class="flex items-center gap-2">
                      <p class="font-bold text-[#D4AF37] text-sm font-montserrat">
                        {{ comment.author?.name || 'Invitado' }}
                      </p>
                      <span
                        v-if="comment.author?.type"
                        class="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[rgba(212,175,55,0.15)] text-[#D4AF37]"
                      >
                        {{ comment.author.type }}
                      </span>
                      <div v-if="comment.isPinned" class="flex items-center text-[#D4AF37]">
                        <Pin class="w-3 h-3 fill-current" />
                      </div>
                      <div v-if="comment.isFavorite" class="flex items-center text-[#E85D4A]">
                        <Heart class="w-3 h-3 fill-current" />
                      </div>
                    </div>
                    <p class="text-[10px] text-gray-400 font-medium font-montserrat">
                      {{ comment.createdAt }}
                    </p>
                  </div>

                  <p class="text-gray-200 text-sm leading-snug font-montserrat">
                    {{ comment.comment }}
                  </p>
                </div>

                <div v-if="loadingMore" class="flex justify-center py-4">
                  <CWMLoading />
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div v-else class="text-center text-gray-400 italic mt-4 font-montserrat">
              Aún no hay mensajes. Sé el primero en dejarle un saludo ❤️💙
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hn-comments-section {
  background: #0f172a;
}

.hn-comments-bg {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
}

.hn-comments-glass {
  background: rgba(17, 24, 39, 0.52);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(212, 175, 55, 0.22);
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
  overflow: hidden;
  padding: 2.25rem 1.25rem;
}

@media (min-width: 640px) {
  .hn-comments-glass {
    padding: 2.75rem 2rem;
  }
}

@media (min-width: 1024px) {
  .hn-comments-glass {
    padding: 3.25rem 2.5rem;
  }
}

.hn-comments-title {
  font-family: 'Cinzel', serif;
  font-size: 2.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #d4af37;
  text-shadow: 0 2px 10px rgba(212, 175, 55, 0.3);
}

@media (min-width: 768px) {
  .hn-comments-title {
    font-size: 3rem;
  }
}

.hn-title-divider {
  width: 80px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #d4af37, transparent);
  margin: 1rem auto;
}

.hn-comments-subtitle {
  font-family: 'Montserrat', sans-serif;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  max-width: 32rem;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .hn-comments-subtitle {
    font-size: 1.125rem;
  }
}

.hn-comment-form {
  background: rgba(17, 24, 39, 0.4);
  border: 1px solid rgba(212, 175, 55, 0.15);
  border-radius: 12px;
  padding: 1.5rem;
}

.hn-textarea-input {
  background: rgba(15, 23, 42, 0.6) !important;
  border: 1px solid rgba(212, 175, 55, 0.25) !important;
  color: rgba(255, 255, 255, 0.92) !important;
  caret-color: rgba(212, 175, 55, 0.95) !important;
  font-family: 'Montserrat', sans-serif;
  transition: all 0.3s ease;
}

.hn-textarea-input :deep(textarea) {
  background: rgba(15, 23, 42, 0.6) !important;
  color: rgba(255, 255, 255, 0.92) !important;
  border: 1px solid rgba(212, 175, 55, 0.25) !important;
}

.hn-textarea-input::selection {
  background: rgba(212, 175, 55, 0.25) !important;
}

.hn-textarea-input:-webkit-autofill,
.hn-textarea-input:-webkit-autofill:hover,
.hn-textarea-input:-webkit-autofill:focus {
  -webkit-text-fill-color: rgba(255, 255, 255, 0.92) !important;
  -webkit-box-shadow: 0 0 0px 1000px rgba(15, 23, 42, 0.85) inset !important;
}

.hn-textarea-input::placeholder {
  color: rgba(148, 163, 184, 0.6) !important;
}

.hn-textarea-input:focus {
  border-color: rgba(212, 175, 55, 0.5) !important;
  box-shadow:
    0 0 0 3px rgba(212, 175, 55, 0.15),
    inset 0 0 20px rgba(212, 175, 55, 0.05) !important;
  outline: none !important;
}

.hn-submit-btn {
  background: linear-gradient(135deg, #d4af37 0%, #e85d4a 100%);
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  letter-spacing: 0.025em;
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
  transition: all 0.3s ease;
}

.hn-submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
}

.hn-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.hn-comment-card {
  background: rgba(17, 24, 39, 0.5);
  border: 1px solid rgba(212, 175, 55, 0.12);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.hn-comment-card:hover {
  border-color: rgba(212, 175, 55, 0.35);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.03),
    0 0 15px rgba(212, 175, 55, 0.08);
}

.hn-comment-pinned {
  border-color: rgba(69, 49, 0, 0.4);
  background: rgba(212, 175, 55, 0.08);
}

.comments-list {
  max-height: 500px;
}

@media screen and (max-width: 1024px) {
  .comments-list {
    max-height: 400px;
  }
}

.font-montserrat {
  font-family: 'Montserrat', sans-serif;
}
</style>
