<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ImagePlus } from 'lucide-vue-next'
import { UiButton } from '@/ui'
import { ALLOWED_TYPES, formatSize, validateFile } from '@/modules/sweet-memories/utils/memories'

const props = defineProps({
  /** Newly picked File, or null. */
  file: { type: Object, default: null },
  /** URL of the photo already saved (edit mode). */
  currentUrl: { type: String, default: '' },
  /** Error message coming from the form or the server. */
  error: { type: String, default: '' }
})
const emit = defineEmits(['update:file'])
const { t } = useI18n()

const input = ref(null)
const dragging = ref(false)
const localError = ref('')
const previewUrl = ref('')

const revoke = () => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = ''
}
watch(
  () => props.file,
  file => {
    revoke()
    if (file) previewUrl.value = URL.createObjectURL(file)
  },
  { immediate: true }
)
onBeforeUnmount(revoke)

const shown = computed(() => previewUrl.value || props.currentUrl)
const message = computed(() => localError.value || props.error)

function pick(file) {
  if (!file) return
  const code = validateFile(file)
  if (code) {
    localError.value = t(`app.memories.dropzone.errors.${code}`)
    return
  }
  localError.value = ''
  emit('update:file', file)
}

function onChange(event) {
  pick(event.target.files?.[0])
  event.target.value = ''
}
function onDrop(event) {
  dragging.value = false
  pick(event.dataTransfer?.files?.[0])
}
function clear() {
  localError.value = ''
  emit('update:file', null)
}
</script>

<template>
  <div>
    <span class="mb-1.5 block text-sm font-medium text-ink-900">{{ t('app.memories.dropzone.label') }}</span>

    <div v-if="shown" class="overflow-hidden rounded-xl border border-line bg-cream-100">
      <img :src="shown" :alt="t('app.memories.dropzone.preview')" class="mx-auto max-h-64 w-full object-contain" />
      <div class="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-white p-2">
        <p class="min-w-0 truncate pl-2 text-sm text-ink-700">
          <template v-if="file">{{ file.name }} · {{ formatSize(file.size) }}</template>
          <template v-else>{{ t('app.memories.dropzone.current') }}</template>
        </p>
        <div class="flex gap-2">
          <UiButton size="sm" variant="secondary" @click="input?.click()">{{ t('app.memories.dropzone.replace') }}</UiButton>
          <UiButton v-if="file" size="sm" variant="ghost" @click="clear">{{ t('app.memories.dropzone.remove') }}</UiButton>
        </div>
      </div>
    </div>

    <button
      v-else
      type="button"
      class="flex min-h-40 w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-8 text-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-rose-600"
      :class="dragging ? 'border-rose-600 bg-rose-50' : message ? 'border-danger-600 bg-white' : 'border-line-strong bg-white hover:bg-cream-100'"
      @click="input?.click()"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <ImagePlus class="h-8 w-8 text-rose-600" aria-hidden="true" />
      <span class="text-base font-medium text-ink-900">{{ t('app.memories.dropzone.choose') }}</span>
      <span class="hidden text-sm text-ink-500 sm:block">{{ t('app.memories.dropzone.drop') }}</span>
      <span class="text-sm text-ink-500">{{ t('app.memories.dropzone.hint') }}</span>
    </button>

    <input ref="input" type="file" class="sr-only" tabindex="-1" :accept="ALLOWED_TYPES.join(',')" @change="onChange" />
    <p v-if="message" class="mt-1.5 text-sm text-danger-700" role="alert">{{ message }}</p>
  </div>
</template>
