<script setup>
import CButton from '@/components/UI/buttons/CButton.vue'
import CModal from '@/components/UI/modals/CModal.vue'
import { PlusCircle } from 'lucide-vue-next'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import CTextarea from '@/components/UI/form2/CTextarea.vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import { Form } from 'vee-validate'
import { useEventCommentsStore } from '@/stores/useEventCommentsStore'

const emit = defineEmits(['commentAdded', 'close'])
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const validationSchema = computed(() => {
  return toTypedSchema(
    zod.object({
      comment: zod
        .string()
        .min(1, 'Comment cannot be empty')
        .max(500, 'Comment cannot exceed 500 characters')
    })
  )
})

const commentStore = useEventCommentsStore()
const showAddCommentModal = ref(false)
const loading = ref(false)

const newComment = reactive({
  text: ''
})

const createNewComment = async () => {
  try {
    loading.value = true

    const response = await commentStore.addNewComment(newComment.text)
    if (response.status >= 200 && response.status < 300) {
      await commentStore.loadNewComments()
      emit('close')
    } else {
      console.error('Failed to add comment:', response.error)
    }
  } catch (error) {
    console.error('Validation failed:', error)
  } finally {
    loading.value = false
  }
}

const onInvalidSubmit = e => {
  console.error('Form submission failed due to validation errors', e)
}

const handleCancelNewComment = () => {
  newComment.text = ''
  emit('close')
}

watch(
  () => props.show,
  newValue => {
    showAddCommentModal.value = newValue
})

onMounted(() => {
  showAddCommentModal.value = props.show
})
</script>

<template>
  <CModal v-if="showAddCommentModal" v-model="showAddCommentModal" :show-footer="false">
    <template #title>
      <div class="flex items-center">
        <PlusCircle class="w-5 h-5 mr-2 text-rose" />
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Add New Comment</h3>
      </div>
    </template>

    <Form
      :validation-schema="validationSchema"
      @submit="createNewComment"
      @invalid-submit="onInvalidSubmit"
    >
      <div class="py-4">
        <div class="mb-4">
          <CTextarea
            id="new-comment"
            v-model="newComment.text"
            show-error
            label="New Comment"
            name="comment"
            placeholder="Enter your comment here..."
          />
        </div>
      </div>

      <div class="flex justify-end space-x-3">
        <CButton variant="outline" @click="handleCancelNewComment">Cancel</CButton>
        <CButton variant="primary" type="submit" :disabled="!newComment.text.trim() || loading">
          Add Comment
        </CButton>
      </div>
    </Form>
  </CModal>
</template>

<style scoped></style>
