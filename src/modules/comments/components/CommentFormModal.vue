<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiModal, UiField, UiTextarea, UiButton, useToast } from '@/ui'
import { useEventCommentsStore } from '@/modules/comments/stores/useEventCommentsStore'
import { useCommentSubmit } from '../composables/useCommentSubmit'
import { MAX_LENGTH, commentError } from '../utils/comments'

const props = defineProps({ open: { type: Boolean, default: false } })
const emit = defineEmits(['update:open', 'comment-added'])
const { t } = useI18n()
const { error: showError } = useToast()

const { loading, submit } = useCommentSubmit({ store: useEventCommentsStore() })

const text = ref('')
const touched = ref(false)
const errorKey = computed(() => (touched.value ? commentError(text.value) : ''))

watch(
  () => props.open,
  open => {
    if (open) {
      text.value = ''
      touched.value = false
    }
  }
)

async function onSubmit() {
  touched.value = true
  if (commentError(text.value)) return
  const result = await submit(text.value.trim())
  if (result.ok) {
    emit('update:open', false)
    emit('comment-added')
  } else {
    showError(t('app.comments.postError'))
  }
}
</script>

<template>
  <UiModal :open="open" :title="t('app.comments.formTitle')" :description="t('app.comments.formText')" @update:open="emit('update:open', $event)">
    <form id="comment-form" novalidate @submit.prevent="onSubmit">
      <UiField :label="t('app.comments.formLabel')" :error="errorKey ? t(errorKey) : ''" :hint="t('app.comments.characters', { n: text.length, max: MAX_LENGTH })">
        <UiTextarea v-model="text" :rows="6" :invalid="!!errorKey" :placeholder="t('app.comments.formPlaceholder')" />
      </UiField>
      <p class="mt-3 text-sm text-ink-500">{{ t('app.comments.formNote') }}</p>
    </form>
    <template #footer>
      <UiButton variant="secondary" @click="emit('update:open', false)">{{ t('app.comments.cancel') }}</UiButton>
      <UiButton type="submit" form="comment-form" :loading="loading">{{ loading ? t('app.comments.posting') : t('app.comments.post') }}</UiButton>
    </template>
  </UiModal>
</template>
