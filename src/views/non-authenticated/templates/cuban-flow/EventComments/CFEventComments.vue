<script setup>
import { computed, onMounted, ref } from 'vue'
import { Pin, Heart } from 'lucide-vue-next'
import { useEventCommentsStore } from '@/stores/useEventCommentsStore'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import { Form } from 'vee-validate'
import TextAreaField from '@/components/UI/form/TextAreaField.vue'
import { useNotificationStore } from '@/stores/useNotificationStore'
import CWMLoading from '@/components/UI/loading/CWMLoading.vue'
import { vInfiniteScroll } from '@vueuse/components'
import { useTemplateStore } from '@/stores/useTemplateStore'
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
  return 'Que tu crees!?'
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
    class="w-full min-h-screen flex flex-col px-6 pt-16 md:pt-24 pb-24 overflow-hidden bg-red-50"
  >
    <!-- Header -->
    <div class="text-center pb-6 flex-shrink-0">
      <h2
        class="text-5xl md:text-6xl font-gvibes font-bold text-transparent bg-clip-text bg-gradient-to-l from-blue-800 to-red-800 drop-shadow-sm"
      >
        {{ commentsTitle }}
      </h2>

      <p class="text-base md:text-lg text-gray-700 mt-3 max-w-2xl mx-auto">
        {{ commentsSubtitle }}
      </p>
    </div>

    <div class="flex flex-col gap-8">
      <!-- Form -->
      <Form
        :validation-schema="eventCommentValidationSchema"
        class="w-full max-w-2xl mx-auto bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 flex flex-col gap-4"
        @submit="addComment"
        @invalid-submit="onInvalidSubmit"
      >
        <p class="text-sm text-gray-700 font-semibold">Tu mensaje</p>

        <TextAreaField
          v-model="commentStore.currentComment.comment"
          name="comment"
          placeholder="Escribe tu comentario aquí..."
          :show-error="meta.submitCount > 0 || meta.touched"
          :rows="3"
          :class-input="`
            w-full
            bg-white
            border border-gray-300
            rounded-xl
            px-4 py-3
            text-gray-800
            placeholder:text-gray-400
            focus:outline-none
            focus:ring-2
            focus:ring-blue-800/20
            focus:border-blue-800
            resize-none
          `"
        />

        <button
          type="submit"
          class="w-full py-3 rounded-xl font-semibold text-white shadow-md bg-gradient-to-l from-blue-800 to-red-800 hover:opacity-95 active:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
          :disabled="creatingComment"
        >
          <CWMLoading v-if="creatingComment" />
          <span v-else>{{ buttonTextComputed }}</span>
        </button>

        <!-- Optional helper text for older users (clarity) -->
        <p class="text-xs text-gray-500">Presiona “Enviar” para dejar tu mensaje.</p>
      </Form>

      <!-- Comments list -->
      <div class="w-full max-w-4xl mx-auto">
        <div v-if="commentStore.eventComments.length > 0">
          <div
            v-infinite-scroll="[onLoadMore, { distance: 10 }]"
            class="comments-list flex flex-col gap-3 overflow-y-auto pr-1"
          >
            <div
              v-for="comment in sortedComments"
              :key="comment.id"
              class="p-4 border rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md"
              :class="[
                comment.isPinned ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'
              ]"
            >
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-2">
                  <p class="font-bold text-gray-800 text-sm">
                    {{ comment.author?.name || 'Invitado' }}
                  </p>
                  <span
                    v-if="comment.author?.type"
                    class="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500"
                  >
                    {{ comment.author.type }}
                  </span>
                  <div v-if="comment.isPinned" class="flex items-center text-blue-600">
                    <Pin class="w-3 h-3 fill-current" />
                  </div>
                  <div v-if="comment.isFavorite" class="flex items-center text-pink-500">
                    <Heart class="w-3 h-3 fill-current" />
                  </div>
                </div>
                <p class="text-[10px] text-gray-400 font-medium">
                  {{ comment.createdAt }}
                </p>
              </div>

              <p class="text-gray-700 text-sm leading-snug">
                {{ comment.comment }}
              </p>
            </div>

            <div v-if="loadingMore" class="flex justify-center py-4">
              <CWMLoading />
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="text-center text-gray-600 italic mt-4">
          Aún no hay mensajes. Sé el primero en dejarle un saludo ❤️💙
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.whatsapp-links a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.comments-list {
  max-height: 500px;

  @media screen and (max-width: 1024px) {
    max-height: 400px;
  }
}
</style>
