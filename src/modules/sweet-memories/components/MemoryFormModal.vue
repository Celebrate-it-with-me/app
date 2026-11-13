<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiButton, UiField, UiInput, UiModal, UiSwitch, UiTextarea } from '@/ui'
import MemoriesDropzone from '@/modules/sweet-memories/components/MemoriesDropzone.vue'
import {
  MAX_DESCRIPTION,
  emptyMemoryForm,
  memoryToForm,
  validateMemoryForm
} from '@/modules/sweet-memories/utils/memories'

const props = defineProps({
  open: { type: Boolean, default: false },
  memory: { type: Object, default: null },
  saving: { type: Boolean, default: false },
  /** Server-side file error message, shown under the dropzone. */
  fileError: { type: String, default: '' }
})
const emit = defineEmits(['update:open', 'save'])
const { t } = useI18n()

const form = reactive(emptyMemoryForm())
const file = ref(null)
const errors = ref({})
const submitted = ref(false)
const editing = computed(() => !!props.memory)
const hasImage = () => !!file.value || !!props.memory?.imagePath

watch(
  () => props.open,
  open => {
    if (!open) return
    Object.assign(form, props.memory ? memoryToForm(props.memory) : emptyMemoryForm())
    file.value = null
    errors.value = {}
    submitted.value = false
  }
)
watch([form, file], () => {
  if (submitted.value) errors.value = validateMemoryForm(form, { hasImage: hasImage() })
})

const titleError = computed(() =>
  errors.value.title ? t(`app.memories.form.errors.title${errors.value.title === 'max' ? 'Max' : 'Required'}`) : ''
)
const yearError = computed(() => (errors.value.year ? t('app.memories.form.errors.yearRange') : ''))
const descriptionError = computed(() => (errors.value.description ? t('app.memories.form.errors.descriptionMax') : ''))
const imageError = computed(() => (errors.value.image ? t('app.memories.form.errors.imageRequired') : props.fileError))

function submit() {
  submitted.value = true
  errors.value = validateMemoryForm(form, { hasImage: hasImage() })
  if (Object.keys(errors.value).length) return
  emit('save', { form: { ...form }, file: file.value })
}
</script>

<template>
  <UiModal
    :open="open"
    :title="t(editing ? 'app.memories.form.editTitle' : 'app.memories.form.createTitle')"
    size="md"
    @update:open="emit('update:open', $event)"
  >
    <form id="memory-form" class="space-y-4" novalidate @submit.prevent="submit">
      <MemoriesDropzone v-model:file="file" :current-url="memory?.imagePath || ''" :error="imageError" />

      <UiField :label="t('app.memories.form.title')" :error="titleError" required>
        <UiInput
          v-model="form.title"
          :invalid="!!errors.title"
          :placeholder="t('app.memories.form.titlePlaceholder')"
          autocomplete="off"
        />
      </UiField>

      <UiField :label="t('app.memories.form.year')" :hint="t('app.memories.form.yearHint')" :error="yearError">
        <UiInput v-model="form.year" inputmode="numeric" maxlength="4" :invalid="!!errors.year" autocomplete="off" />
      </UiField>

      <UiField :label="t('app.memories.form.description')" :error="descriptionError">
        <UiTextarea
          v-model="form.description"
          :rows="3"
          :invalid="!!errors.description"
          :placeholder="t('app.memories.form.descriptionPlaceholder')"
        />
        <p class="mt-1 text-right text-xs" :class="form.description.length > MAX_DESCRIPTION ? 'text-danger-700' : 'text-ink-500'">
          {{ form.description.length }}/{{ MAX_DESCRIPTION }}
        </p>
      </UiField>

      <UiSwitch
        v-model="form.visible"
        :label="t('app.memories.form.visible')"
        :description="t(form.visible ? 'app.memories.form.visibleOn' : 'app.memories.form.visibleOff')"
      />
    </form>

    <template #footer>
      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <UiButton variant="secondary" :disabled="saving" @click="emit('update:open', false)">
          {{ t('app.memories.form.cancel') }}
        </UiButton>
        <UiButton type="submit" form="memory-form" :loading="saving">
          {{ t(editing ? 'app.memories.form.save' : 'app.memories.form.create') }}
        </UiButton>
      </div>
    </template>
  </UiModal>
</template>
