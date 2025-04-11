<script setup>
import { computed, onMounted, ref } from 'vue'
import { useEventCommentsStore } from '@/stores/useEventCommentsStore'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import { Form } from 'vee-validate'
import TextAreaField from '@/components/UI/form/TextAreaField.vue'
import { useUserStore } from '@/stores/useUserStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import CWMLoading from '@/components/UI/loading/CWMLoading.vue'
import { vInfiniteScroll } from '@vueuse/components'
import { useTemplateStore } from '@/stores/useTemplateStore'

const props = defineProps({
  origin: {
    type: String,
    required: false,
    default: 'admin',
  }
})

const page = ref(1)
const eventCommentValidationSchema = computed(() => {
  return toTypedSchema(
    zod.object({
      comment: zod.string(),
    })
  )
})
const userStore = useUserStore()
const commentStore = useEventCommentsStore()
const templateStore = useTemplateStore()
const creatingComment = ref(false)
const loadingComments = ref(false)
const notificationStore = useNotificationStore()
const loadingMore = ref(false)
const totalItems = ref(0)

const bgColorComputed = computed(() => {
  if (props.origin === 'admin') {
    return { backgroundColor: commentStore?.config?.backgroundColor ?? '' }
  }

  return { backgroundColor: templateStore?.event?.commentsConfig?.backgroundColor ?? '' }
})
const buttonColorComputed = computed(() => {
  if (props.origin === 'admin') {
    return { backgroundColor: commentStore?.config?.buttonColor ?? '' }
  }

  return { backgroundColor: templateStore?.event?.commentsConfig?.buttonColor ?? '' }
})
const buttonTextComputed = computed(() => {
  if (props.origin === 'admin') {
    return commentStore?.config?.buttonText ?? ''
  }

  return templateStore?.event?.commentsConfig?.buttonText ?? ''
})
const commentsTitle = computed(() => {
  if (props.origin === 'admin') {
    return commentStore?.config?.title ?? ''
  }

  return templateStore.event?.commentsConfig?.title ?? ''
})
const commentsSubtitle = computed(() => {
  if (props.origin === 'admin') {
    return commentStore?.config?.subTitle ?? ''
  }

  return templateStore?.event?.commentsConfig?.subTitle ?? ''
})

const userEventId = computed(() => {
  if (props.origin === 'admin') {
    return userStore.currentEventId
  }

  return templateStore.event.id
})


onMounted(() => {
  loadComments()
})

const loadComments = async (updatePage = true) => {
  try {
    loadingComments.value = true

    const response = await commentStore.loadComments(userEventId.value)

    if (response.status === 200) {
      commentStore.eventComments = response.data?.data ?? []

      if (props.origin === 'admin') {
        notificationStore.addNotification({
          type: 'success',
          message: 'Comment successfully loaded.!'
        })
      }


      if (updatePage) {
        page.value +=1
      }
      totalItems.value = response.data?.meta?.total ?? 10
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
      const response = await commentStore.loadMoreComments(userEventId.value, page.value)

      if (response.status === 200) {
        commentStore.eventComments = [...commentStore.eventComments, ...response.data?.data ?? []]
        page.value +=1
      } else {
        notificationStore.addNotification({
          type: 'error',
          message: 'Oops something went wrong!.'
        });

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

const computedUserId = computed(() => {
  if (props.origin === 'admin') {
    return userStore.userId
  }

  return templateStore.guest.id
})


const addComment = async () => {
  try {
    creatingComment.value = true

    const response = await commentStore.addComment({
      eventId: userEventId.value,
      userId: computedUserId.value,
      origin: props.origin,
    })

    if (response.status >= 200 && response.status < 300) {
      await loadComments(false)
      commentStore.currentComment.comment = ''
      if (props.origin === 'admin') {
        notificationStore.addNotification({
          type: 'success',
          message: 'Comment successfully added.!'
        })
      }
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

const onInvalidSubmit = (error) => {
  console.log('error', error)
}
</script>

<template>
  <section
    id="sectionComments"
    class="w-full h-full min-h-screen flex flex-col p-6 overflow-hidden md:pt-20 pb-20"
    :style="bgColorComputed"
  >
    <!-- Title -->
    <div class="comment-header text-center pb-4 flex-shrink-0">
      <h2 class="text-6xl font-gvibes font-bold text-purple-middle">{{ commentsTitle }}</h2>
      <p class="text-lg text-dark-blue mt-2">
        {{ commentsSubtitle }}
      </p>
    </div>

    <div class="flex flex-col gap-6">
      <Form
        :validation-schema="eventCommentValidationSchema"
        class="comment-form w-full max-w-2xl bg-white shadow p-6 rounded-lg flex flex-col gap-4 mx-auto"
        @submit="addComment"
        @invalid-submit="onInvalidSubmit"
      >
        <TextAreaField
          v-model="commentStore.currentComment.comment"
          name="comment"
          placeholder="Escribe tu comentario aquí..."
          show-error
          :class-input="`p-3 border text-gray-500 border-gray-300 rounded-lg focus:ring focus:ring-pink-300 resize-none`"
          :rows="2"
        />
        <button
          type="submit"
          class="bg-pink-500 text-white p-3 rounded-lg font-bold hover:bg-pink-600 transition"
          :style="buttonColorComputed"
          :disabled="creatingComment"
        >
          <CWMLoading
            v-if="creatingComment"
          ></CWMLoading>
          <span
            v-else
          >
            {{ buttonTextComputed }}
          </span>
        </button>
      </Form>

      <div class="comments-container">
        <div
          v-if="commentStore.eventComments.length > 0"
          class="previous-comments w-full max-w-4xl mx-auto"
        >
          <div
            v-infinite-scroll="onLoadMore"
            class="comments-list flex flex-col gap-4 flex-grow overflow-y-auto"
          >
            <div
              v-for="comment in commentStore.eventComments"
              :key="comment.id"
              class="comment-item p-4 border border-gray-200 bg-white shadow rounded-lg mr-1"
            >
              <div class="text-sm font-extralight flex items-center justify-between">
                <p class="text-gray-500">{{ comment.author }}</p>
                <p class="text-xs text-gray-400">{{ comment.createdAt }}</p>
              </div>
              <p class="text-gray-600 mt-2">{{ comment.comment }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.comment-form {
  margin-bottom: 2rem;
}

.comment-item {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.comment-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.whatsapp-links a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.comments-list {
  max-height: 385px;

  @media screen and (max-width: 1024px) {
    max-height: 285px;
  }
}

.flex-grow {
  scroll-behavior: smooth;
}

.flex-grow::-webkit-scrollbar {
  width: 8px;
}

.flex-grow::-webkit-scrollbar-track {
  background: #e5e5e5;
  border-radius: 8px;
}

.flex-grow::-webkit-scrollbar-thumb {
  background: #f1b1d1;
  border-radius: 8px;
}

.flex-grow::-webkit-scrollbar-thumb:hover {
  background: #db2777;
}

.flex-grow::-webkit-scrollbar-thumb:active {
  background: #be185d;
}
</style>
