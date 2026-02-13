<script setup>
import { computed, onMounted, ref } from 'vue'
import { Pin, Heart, Send, MessageSquareText } from 'lucide-vue-next'
import { useEventCommentsStore } from '@/stores/useEventCommentsStore'
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
  return 'Enviar'
})

const commentsTitle = computed(() => {
  return 'Mensajes para Isabella'
})
const commentsSubtitle = computed(() => {
  return 'Déjale un mensaje, buenos deseos o un recuerdo bonito para Isabella.'
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
    class="w-full min-h-screen flex flex-col px-6 pt-16 md:pt-24 pb-24 overflow-hidden bg-gradient-to-b from-white via-[#E0F2F1] to-[#B2DFDB]"
  >
    <!-- Header -->
    <div class="text-center pb-10 flex-shrink-0">
      <h2
        class="text-5xl md:text-7xl font-gvibes font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#123B5A] via-[#2F6F8F] to-[#7FB9C9] drop-shadow-sm leading-tight"
      >
        {{ commentsTitle }}
      </h2>

      <p class="text-lg md:text-xl text-[#2F6F8F] mt-4 max-w-2xl mx-auto font-medium">
        {{ commentsSubtitle }}
      </p>
    </div>

    <div class="flex flex-col gap-10">
      <!-- Form -->
      <Form
        :validation-schema="eventCommentValidationSchema"
        class="w-full max-w-2xl mx-auto bg-white/60 backdrop-blur-md rounded-3xl p-6 md:p-10 shadow-xl border border-[#7FB9C9]/30 flex flex-col gap-6"
        @submit="addComment"
        @invalid-submit="onInvalidSubmit"
      >
        <div class="flex flex-col gap-2">
          <p class="text-sm text-[#123B5A] font-bold uppercase tracking-wider">Tu mensaje</p>

          <TextAreaField
            v-model="commentStore.currentComment.comment"
            name="comment"
            placeholder="Escribe tu mensaje aquí..."
            :show-error="meta.submitCount > 0 || meta.touched"
            :rows="4"
            :class-input="`
              w-full
              bg-white/40
              border border-[#7FB9C9]/50
              rounded-2xl
              px-5 py-4
              text-[#123B5A]
              placeholder:text-slate-400
              focus:outline-none
              focus:ring-4
              focus:ring-[#7FB9C9]/20
              focus:border-[#2F6F8F]
              resize-none
              transition-all
            `"
          />
        </div>

        <div class="flex flex-col gap-3">
          <button
            type="submit"
            class="group flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-bold text-white shadow-lg bg-gradient-to-r from-[#123B5A] via-[#2F6F8F] to-[#7FB9C9] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            :disabled="creatingComment"
          >
            <CWMLoading v-if="creatingComment" />
            <template v-else>
              <span>{{ buttonTextComputed }}</span>
              <Send class="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </template>
          </button>

          <p class="text-xs text-[#2F6F8F]/70 text-center font-medium">
            Presiona “Enviar” para dejar tu mensaje.
          </p>
        </div>
      </Form>

      <!-- Comments list -->
      <div class="w-full max-w-4xl mx-auto">
        <div v-if="commentStore.eventComments.length > 0">
          <div
            v-infinite-scroll="[onLoadMore, { distance: 10 }]"
            class="comments-list flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar"
          >
            <div
              v-for="comment in sortedComments"
              :key="comment.id"
              class="relative flex gap-4 p-5 rounded-3xl bg-white/70 backdrop-blur-sm border border-[#7FB9C9]/20 shadow-sm transition-all duration-300 hover:shadow-md hover:border-[#7FB9C9]/40"
              :class="[comment.isPinned ? 'ring-1 ring-blue-400/30' : '']"
            >
              <!-- Avatar -->
              <div class="flex-shrink-0">
                <div
                  class="w-12 h-12 rounded-full bg-gradient-to-br from-[#E0F2F1] to-[#B2DFDB] border-2 border-white shadow-sm flex items-center justify-center text-[#123B5A] font-bold text-lg"
                >
                  {{ (comment.author?.name || 'I').charAt(0).toUpperCase() }}
                </div>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2 mb-2">
                  <div class="flex items-center gap-3">
                    <p class="font-bold text-[#123B5A] text-base truncate">
                      {{ comment.author?.name || 'Invitado' }}
                    </p>
                    <div
                      v-if="comment.isPinned"
                      class="flex items-center text-blue-500"
                      title="Pinned"
                    >
                      <Pin class="w-4 h-4 fill-current" />
                    </div>
                    <div
                      v-if="comment.isFavorite"
                      class="flex items-center text-rose-400"
                      title="Favorite"
                    >
                      <Heart class="w-4 h-4 fill-current" />
                    </div>
                  </div>
                  <p class="text-[11px] text-[#2F6F8F]/60 font-semibold whitespace-nowrap">
                    {{ comment.createdAt }}
                  </p>
                </div>

                <p class="text-[#123B5A]/90 text-sm leading-relaxed">
                  {{ comment.comment }}
                </p>
              </div>
            </div>

            <div v-if="loadingMore" class="flex justify-center py-6">
              <CWMLoading />
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div
          v-else
          class="flex flex-col items-center justify-center p-12 text-center bg-white/40 backdrop-blur-sm rounded-3xl border border-dashed border-[#7FB9C9]/50"
        >
          <div
            class="w-16 h-16 rounded-full bg-[#E0F2F1] flex items-center justify-center text-[#2F6F8F] mb-4"
          >
            <MessageSquareText class="w-8 h-8" />
          </div>
          <p class="text-lg font-bold text-[#123B5A]">Todavía no hay mensajes</p>
          <p class="text-[#2F6F8F] mt-1">Sé el primero en dejarle un recuerdo bonito.</p>
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
  max-height: 600px;
  scrollbar-width: thin;
  scrollbar-color: #7fb9c9 transparent;

  @media screen and (max-width: 1024px) {
    max-height: 500px;
  }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #7fb9c9;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #2f6f8f;
}
</style>
