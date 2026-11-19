<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Download, Info } from 'lucide-vue-next'
import { UiButton, UiModal, UiRadioGroup, UiSelect, UiSwitch, useToast } from '@/ui'
import SeatingService from '@/modules/seating/services/SeatingService'
import { saveBlob } from '@/modules/roster/utils/roster'
import { exportErrorKey } from '@/modules/seating/utils/seating'

const props = defineProps({
  open: { type: Boolean, default: false },
  eventId: { type: [Number, String], required: true },
  /** Language the event is written in ('es' | 'en'): the default of the file. */
  eventLocale: { type: String, default: 'es' },
  /** False when the event has no menu configured: the dish summary would be empty. */
  hasMenu: { type: Boolean, default: true }
})
const emit = defineEmits(['update:open'])

const { t } = useI18n()
const { success, error: showError } = useToast()

const format = ref('xlsx')
const locale = ref('es')
const includePending = ref(false)
const busy = ref(false)
/** Last failure, shown inside the panel next to the button (toasts disappear). */
const failure = ref('')

watch(
  () => props.open,
  open => {
    if (!open) return
    format.value = 'xlsx'
    locale.value = props.eventLocale === 'en' ? 'en' : 'es'
    includePending.value = false
    failure.value = ''
  },
  { immediate: true }
)

const formatOptions = computed(() => [
  { value: 'xlsx', label: t('app.seating.export.xlsx'), description: t('app.seating.export.xlsxText') },
  { value: 'pdf', label: t('app.seating.export.pdf'), description: t('app.seating.export.pdfText') }
])
const localeOptions = computed(() => [
  { value: 'es', label: t('app.seating.export.langEs') },
  { value: 'en', label: t('app.seating.export.langEn') }
])

async function download() {
  if (busy.value) return
  busy.value = true
  failure.value = ''
  try {
    const { blob, filename } = await SeatingService.downloadCatering(props.eventId, {
      format: format.value,
      locale: locale.value,
      includePending: includePending.value
    })
    saveBlob(blob, filename)
    success(t('app.seating.export.done'))
    emit('update:open', false)
  } catch (e) {
    failure.value = t(`app.seating.export.errors.${exportErrorKey(e)}`)
    showError(failure.value)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <UiModal
    :open="open"
    :title="t('app.seating.export.title')"
    :description="t('app.seating.export.subtitle')"
    size="md"
    @update:open="val => emit('update:open', val)"
  >
    <div class="space-y-5">
      <p v-if="!hasMenu" class="flex items-start gap-2 rounded-lg bg-info-50 p-3 text-sm text-info-700" role="status">
        <Info class="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{{ t('app.seating.export.noMenu') }}</span>
      </p>

      <fieldset>
        <legend class="mb-2 text-sm font-semibold text-ink-700">{{ t('app.seating.export.format') }}</legend>
        <UiRadioGroup v-model="format" cards :options="formatOptions" />
      </fieldset>

      <UiSwitch
        v-model="includePending"
        :label="t('app.seating.export.pending')"
        :description="t('app.seating.export.pendingText')"
      />

      <div>
        <label for="seating-export-lang" class="mb-1.5 block text-sm font-semibold text-ink-700">{{ t('app.seating.export.language') }}</label>
        <UiSelect id="seating-export-lang" v-model="locale" :options="localeOptions" />
      </div>

      <p class="text-sm text-ink-500">{{ t('app.seating.export.contents') }}</p>
      <p v-if="failure" class="rounded-lg bg-danger-50 p-3 text-sm text-danger-700" role="alert">{{ failure }}</p>
    </div>

    <template #footer>
      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <UiButton variant="ghost" :disabled="busy" @click="emit('update:open', false)">{{ t('app.seating.cancel') }}</UiButton>
        <UiButton :loading="busy" @click="download">
          <Download class="h-4 w-4" aria-hidden="true" />
          {{ t(busy ? 'app.seating.export.downloading' : 'app.seating.export.download') }}
        </UiButton>
      </div>
    </template>
  </UiModal>
</template>
