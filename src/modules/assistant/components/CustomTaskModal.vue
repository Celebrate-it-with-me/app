<script setup>
import { computed, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiButton, UiField, UiInput, UiModal, UiTextarea, UiDateTimeField } from '@/ui'
import { validateCustomTask } from '../utils/assistant'

const props = defineProps({
  open: { type: Boolean, default: false },
  /** The custom task being edited, or null for a new one. */
  task: { type: Object, default: null },
  saving: { type: Boolean, default: false },
  /** Field errors from the API: `{ title?, notes?, dueDate? }` with the contract's codes. */
  serverErrors: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['update:open', 'save'])

const { t } = useI18n()
const form = reactive({ title: '', notes: '', dueDate: '' })
const errors = reactive({ title: '', notes: '', dueDate: '' })

watch(
  () => props.open,
  open => {
    if (!open) return
    form.title = props.task?.title ?? ''
    form.notes = props.task?.notes ?? ''
    form.dueDate = props.task?.dueDate ?? ''
    Object.assign(errors, { title: '', notes: '', dueDate: '' })
  }
)

const text = (field, code) => {
  if (!code) return ''
  const k = code === 'too_long' ? `${field}_too_long` : code
  return t(`app.assistant.custom.errors.${k}`)
}
watch(
  () => props.serverErrors,
  server => {
    for (const field of ['title', 'notes', 'dueDate']) if (server?.[field]) errors[field] = text(field, server[field])
  },
  { deep: true }
)

const heading = computed(() => (props.task ? t('app.assistant.custom.editTitle') : t('app.assistant.custom.newTitle')))

function submit() {
  const found = validateCustomTask(form)
  for (const field of ['title', 'notes', 'dueDate']) errors[field] = text(field, found[field])
  if (Object.keys(found).length) return
  emit('save', { title: form.title.trim(), notes: form.notes.trim(), dueDate: form.dueDate })
}
</script>

<template>
  <UiModal :open="open" :title="heading" :description="t('app.assistant.custom.modalHint')" size="md" @update:open="emit('update:open', $event)">
    <form id="custom-task-form" class="space-y-4" novalidate @submit.prevent="submit">
      <UiField :label="t('app.assistant.custom.titleLabel')" :error="errors.title" required>
        <UiInput v-model="form.title" maxlength="120" autocomplete="off" :placeholder="t('app.assistant.custom.titlePlaceholder')" />
      </UiField>
      <UiField :label="t('app.assistant.custom.notesLabel')" :hint="t('app.assistant.custom.optional')" :error="errors.notes">
        <UiTextarea v-model="form.notes" :rows="3" :maxlength="500" />
      </UiField>
      <UiField :label="t('app.assistant.custom.dueLabel')" :hint="t('app.assistant.custom.optional')" :error="errors.dueDate">
        <UiDateTimeField v-model="form.dueDate" mode="date" />
      </UiField>
    </form>
    <template #footer>
      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <UiButton variant="ghost" @click="emit('update:open', false)">{{ t('app.assistant.custom.cancel') }}</UiButton>
        <UiButton type="submit" form="custom-task-form" :loading="saving">{{ t('app.assistant.custom.save') }}</UiButton>
      </div>
    </template>
  </UiModal>
</template>
