<script setup>
/**
 * The cover photo of the invitation (field `cover_photo` of the editor): upload, replace, remove and choose which part
 * of the photo stays visible. Contract: docs/plans/template-stage5-contract-draft.md, 3.4, 4.7 and 7. The photo goes to its
 * own endpoint (multipart); only the focus travels through the generic field save.
 *
 *   <CoverPhotoField :event-id="id" :field="field" @changed="value => (field.value = value)" />
 *
 * `field` is the entry of GET invitation `fields[]`: `{ label, help, aspect, minWidth, value: { url, thumbUrl, focus, width, height } | null }`.
 * `changed` carries the new value, or null when the photo was removed.
 */
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ImagePlus, Move, Trash2, Upload } from 'lucide-vue-next'
import { UiButton, UiModal, useToast } from '@/ui'
import TemplatePickerService from '../services/TemplatePickerService'
import CoverFocusPicker from './CoverFocusPicker.vue'
import { COVER_ACCEPT, COVER_ERRORS, errorCode, parseAspect, readImageSize, validateCoverFile, validateCoverWidth, writeErrorCode } from '../utils/templatePicker'

const props = defineProps({
  eventId: { type: [Number, String], required: true },
  field: { type: Object, required: true },
  disabled: { type: Boolean, default: false }
})
const emit = defineEmits(['changed'])

const { t, te, locale } = useI18n()
const toast = useToast()

const value = ref(props.field.value ?? null)
const input = ref(null)
const uploading = ref(false)
const removing = ref(false)
const savingFocus = ref(false)
const error = ref('')
const broken = ref(false)
const focusOpen = ref(false)
const focusDraft = ref('50% 50%')
const focusError = ref(false)
const focusMessage = ref('')
const removeOpen = ref(false)

watch(
  () => props.field.value,
  next => {
    value.value = next ?? null
    broken.value = false
  }
)

const minWidth = computed(() => props.field.minWidth || 0)
const aspect = computed(() => parseAspect(props.field.aspect) ?? 0.8)
const label = computed(() => textOf(props.field.label) || t('coverPhoto.title'))
const help = computed(() => textOf(props.field.help) || (minWidth.value ? t('coverPhoto.help', { min: minWidth.value }) : t('coverPhoto.helpNoMin')))
const shownUrl = computed(() => (value.value && !broken.value ? value.value.thumbUrl || value.value.url : null))
const busy = computed(() => uploading.value || removing.value || savingFocus.value)

function textOf(text) {
  if (!text) return ''
  return typeof text === 'string' ? text : text[locale.value] || text.es || text.en || ''
}

function message(code) {
  const known = COVER_ERRORS.includes(code) || ['package_no_cover_field', 'too_many_attempts', 'required', 'event_archived', 'forbidden', 'invalid_focus', 'template_locked'].includes(code)
  const key = `coverPhoto.errors.${known ? code : 'generic'}`
  return te(key) ? t(key, { min: minWidth.value || 960 }) : t('coverPhoto.errors.generic')
}

/**
 * The API's reason for a failed write: 422 `photo` / `focus` code, `event_archived`, 409 code, 403, 429 or the proxy's
 * 413 (too big for the server).
 */
function uploadCode(e) {
  const status = e?.response?.status
  if (status === 413) return 'too_large'
  return writeErrorCode(e, 'photo') ?? errorCode(e, 'focus')
}

function choose() {
  error.value = ''
  input.value?.click()
}

async function onPick(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  error.value = ''
  const invalid = validateCoverFile(file)
  if (invalid) return void (error.value = message(invalid))
  const size = await readImageSize(file)
  const small = validateCoverWidth(size?.width, minWidth.value)
  if (small) return void (error.value = message(small))

  uploading.value = true
  try {
    const next = await TemplatePickerService.uploadCover(props.eventId, file, '50% 50%')
    value.value = next
    broken.value = false
    emit('changed', next)
    toast.success(t('coverPhoto.saved'))
    openFocus()
  } catch (e) {
    error.value = message(uploadCode(e))
  } finally {
    uploading.value = false
  }
}

function openFocus() {
  focusDraft.value = value.value?.focus || '50% 50%'
  focusError.value = false
  focusMessage.value = ''
  focusOpen.value = true
}

async function saveFocus() {
  if (!value.value || focusDraft.value === (value.value.focus || '50% 50%')) {
    focusOpen.value = false
    return
  }
  savingFocus.value = true
  focusError.value = false
  try {
    await TemplatePickerService.saveFocus(props.eventId, focusDraft.value)
    value.value = { ...value.value, focus: focusDraft.value }
    emit('changed', value.value)
    focusOpen.value = false
  } catch (e) {
    focusError.value = true
    const code = uploadCode(e)
    focusMessage.value = ['event_archived', 'forbidden', 'invalid_focus', 'template_locked', 'too_many_attempts'].includes(code) ? message(code) : ''
  } finally {
    savingFocus.value = false
  }
}

async function remove() {
  removing.value = true
  try {
    await TemplatePickerService.removeCover(props.eventId)
    value.value = null
    emit('changed', null)
    removeOpen.value = false
    toast.success(t('coverPhoto.removed'))
  } catch (e) {
    toast.error(message(uploadCode(e)))
  } finally {
    removing.value = false
  }
}
</script>

<template>
  <div>
    <p class="text-base font-semibold text-ink-900">{{ label }}</p>
    <p :id="`cover-help-${eventId}`" class="mt-0.5 text-sm text-ink-500">{{ help }}</p>

    <div class="mt-3 flex items-start gap-4">
      <div
        class="relative w-32 shrink-0 overflow-hidden rounded-xl bg-cream-200 ring-1 ring-line sm:w-40"
        :style="{ aspectRatio: String(aspect) }"
      >
        <img
          v-if="shownUrl"
          :src="shownUrl"
          alt=""
          class="h-full w-full object-cover"
          :style="{ objectPosition: value.focus || '50% 50%' }"
          @error="broken = true"
        />
        <div v-else class="flex h-full w-full flex-col items-center justify-center gap-1.5 border-2 border-dashed border-line-strong px-2 text-center text-ink-500">
          <ImagePlus class="h-6 w-6" aria-hidden="true" />
          <span class="text-sm font-medium">{{ t('coverPhoto.empty') }}</span>
        </div>
        <div v-if="uploading" class="absolute inset-0 flex items-center justify-center bg-white/75 text-sm font-medium text-ink-700" role="status">
          {{ t('coverPhoto.uploading') }}
        </div>
      </div>

      <div class="flex min-w-0 flex-1 flex-col items-stretch gap-2">
        <p v-if="!value" class="text-sm text-ink-600">{{ t('coverPhoto.emptyHint') }}</p>
        <UiButton :variant="value ? 'secondary' : 'primary'" :loading="uploading" :disabled="disabled || busy" :aria-describedby="`cover-help-${eventId}`" @click="choose">
          <Upload class="h-4 w-4" aria-hidden="true" />
          {{ value ? t('coverPhoto.change') : t('coverPhoto.upload') }}
        </UiButton>
        <template v-if="value">
          <UiButton variant="ghost" :disabled="disabled || busy || !shownUrl" @click="openFocus">
            <Move class="h-4 w-4" aria-hidden="true" />
            {{ t('coverPhoto.adjust') }}
          </UiButton>
          <UiButton variant="ghost" :disabled="disabled || busy" @click="removeOpen = true">
            <Trash2 class="h-4 w-4" aria-hidden="true" />
            {{ t('coverPhoto.remove') }}
          </UiButton>
        </template>
        <input ref="input" type="file" class="sr-only" tabindex="-1" aria-hidden="true" :accept="COVER_ACCEPT" @change="onPick" />
      </div>
    </div>

    <p v-if="error" class="mt-3 rounded-xl bg-danger-50 p-3 text-sm text-danger-700" role="alert">{{ error }}</p>

    <UiModal v-model:open="focusOpen" :title="t('coverPhoto.focus.title')" :description="t('coverPhoto.focus.help')" size="md">
      <CoverFocusPicker v-if="value" v-model="focusDraft" :src="value.url" :width="value.width" :height="value.height" :aspect="field.aspect || '4:5'" />
      <p class="mt-3 text-center text-xs text-ink-500">{{ t('coverPhoto.focus.keyboard') }}</p>
      <p v-if="focusError" class="mt-3 rounded-xl bg-danger-50 p-3 text-sm text-danger-700" role="alert">{{ focusMessage || t('coverPhoto.focus.failed') }}</p>
      <template #footer>
        <UiButton variant="ghost" :disabled="savingFocus" @click="focusOpen = false">{{ t('coverPhoto.focus.cancel') }}</UiButton>
        <UiButton :loading="savingFocus" @click="saveFocus">{{ t('coverPhoto.focus.done') }}</UiButton>
      </template>
    </UiModal>

    <UiModal v-model:open="removeOpen" :title="t('coverPhoto.removeTitle')" :description="t('coverPhoto.removeText')" size="sm">
      <template #footer>
        <UiButton variant="ghost" :disabled="removing" @click="removeOpen = false">{{ t('coverPhoto.focus.cancel') }}</UiButton>
        <UiButton variant="danger" :loading="removing" @click="remove">{{ t('coverPhoto.removeConfirm') }}</UiButton>
      </template>
    </UiModal>
  </div>
</template>
