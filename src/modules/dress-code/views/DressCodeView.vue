<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ImagePlus, X } from 'lucide-vue-next'
import { UiPageHeader, UiCard, UiField, UiTextarea, UiButton, UiSkeleton, UiModal, useToast, UiPage } from '@/ui'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import DressCodeService from '../services/DressCodeService'
import { useFloatingBarSpace } from '@/composables/useFloatingBarSpace'
import DressCodeColors from '../components/DressCodeColors.vue'
import DressCodePreview from '../components/DressCodePreview.vue'
import {
  TYPES,
  MAX_IMAGES,
  DESCRIPTION_MAX,
  emptyForm,
  formFromApi,
  bankFor,
  bankUrl,
  fileProblem,
  buildFormData,
  normalizeColors
} from '../utils/dressCodeForm'

const { t } = useI18n()
const { success, error: showError } = useToast()
const eventsStore = useEventsStore()

const event = computed(() => eventsStore.activeEvent)
const canEdit = computed(() => ['owner', 'editor'].includes(event.value?.userRole))
const isQuince = computed(
  () => eventsStore.eventTypes.find(type => type.id === event.value?.eventType)?.slug !== 'wedding'
)

const loading = ref(true)
const saving = ref(false)
const confirmDelete = ref(false)
const saved = ref(null)
const form = ref(emptyForm())
const typeError = ref('')
const imageError = ref('')

// Pictures: uploads already saved (kept or dropped), bank picks, and files not yet sent.
const uploads = ref([])
const bankPicks = ref([])
const files = ref([])
const manifest = ref({})

const bank = computed(() => bankFor(manifest.value, form.value.dressCodeType))
const totalImages = computed(() => uploads.value.length + bankPicks.value.length + files.value.length)
const full = computed(() => totalImages.value >= MAX_IMAGES)

const previews = ref(new Map())
const filePreview = file => {
  if (!previews.value.has(file)) previews.value.set(file, URL.createObjectURL(file))
  return previews.value.get(file)
}

const guestImages = computed(() => [
  ...uploads.value.map(i => ({ id: `u${i.id}`, url: i.url })),
  ...bankPicks.value.map(key => ({ id: key, url: bankUrl(manifest.value, key) })).filter(i => i.url),
  ...files.value.map((f, i) => ({ id: `f${i}`, url: filePreview(f) }))
])

// Phones: the save bar sits above the bottom navigation, with the assistant's icon on its right.
const saveBar = ref(null)
useFloatingBarSpace(saveBar, { inline: true })

// The indications grow with their text (no inner scroll).
const descBox = ref(null)
function fitDescription() {
  const el = descBox.value?.querySelector('textarea')
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight + (el.offsetHeight - el.clientHeight)}px`
}
watch(() => form.value.description, () => nextTick(fitDescription))
watch(loading, value => value || nextTick(fitDescription))
onMounted(() => window.addEventListener('resize', fitDescription))
onBeforeUnmount(() => window.removeEventListener('resize', fitDescription))

// Dirty = different from what was last saved (colours compared in their normalised spelling).
const dirty = computed(() => {
  const base = formFromApi(saved.value)
  const same = (a, b) => JSON.stringify(normalizeColors(a)) === JSON.stringify(normalizeColors(b))
  return (
    base.dressCodeType !== form.value.dressCodeType ||
    base.description !== form.value.description ||
    !same(base.reservedColors, form.value.reservedColors) ||
    !same(base.suggestedColors, form.value.suggestedColors) ||
    files.value.length > 0 ||
    uploads.value.length !== saved.value.images.filter(i => i.source === 'upload').length ||
    !same(
      [...bankPicks.value].sort(),
      saved.value.images.filter(i => i.source === 'bank').map(i => i.bankKey).sort()
    )
  )
})

function apply(data) {
  saved.value = data
  form.value = formFromApi(data)
  uploads.value = data.images.filter(i => i.source === 'upload')
  bankPicks.value = data.images.filter(i => i.source === 'bank').map(i => i.bankKey)
  files.value = []
}

async function load() {
  if (!event.value?.id) return
  loading.value = true
  try {
    apply(await DressCodeService.get(event.value.id))
  } catch {
    showError(t('app.dressCode.loadError'))
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (!eventsStore.eventTypes.length) eventsStore.loadEventsPlansAndType().catch(() => {})
  try {
    manifest.value = await (await fetch('/dress-code-bank/manifest.json')).json()
  } catch {
    manifest.value = {}
  }
  load()
})
watch(() => event.value?.id, load)
watch(() => form.value.dressCodeType, () => (typeError.value = ''))

function addFiles(list) {
  imageError.value = ''
  for (const file of list) {
    if (full.value) return (imageError.value = t('app.dressCode.imagesFull', { max: MAX_IMAGES }))
    const problem = fileProblem(file)
    if (problem) return (imageError.value = t(`app.dressCode.file.${problem}`, { name: file.name }))
    files.value.push(file)
  }
}

function toggleBank(key) {
  imageError.value = ''
  if (bankPicks.value.includes(key)) bankPicks.value = bankPicks.value.filter(k => k !== key)
  else if (full.value) imageError.value = t('app.dressCode.imagesFull', { max: MAX_IMAGES })
  else bankPicks.value = [...bankPicks.value, key]
}

async function save() {
  if (!form.value.dressCodeType) {
    typeError.value = t('app.dressCode.typeRequired')
    return
  }
  saving.value = true
  try {
    const body = buildFormData(form.value, {
      keepImageIds: uploads.value.map(i => i.id),
      bankImages: bankPicks.value,
      files: files.value
    })
    apply(await DressCodeService.save(event.value.id, body))
    success(t('app.dressCode.saved'))
  } catch (e) {
    const errors = e.response?.data?.errors
    if (errors?.dressCodeImages) imageError.value = errors.dressCodeImages[0]
    showError(t('app.dressCode.saveError'))
  } finally {
    saving.value = false
  }
}

async function remove() {
  saving.value = true
  try {
    await DressCodeService.remove(event.value.id)
    apply(await DressCodeService.get(event.value.id))
    confirmDelete.value = false
    success(t('app.dressCode.removed'))
  } catch {
    showError(t('app.dressCode.saveError'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UiPage>
    <UiPageHeader :title="t('app.dressCode.title')" :subtitle="t('app.dressCode.subtitle')" />

    <div v-if="loading" class="mt-6 space-y-4">
      <UiSkeleton class="h-40" />
      <UiSkeleton class="h-56" />
    </div>

    <div v-else class="mt-6 grid items-start gap-6 pb-36 md:pb-0 lg:grid-cols-[minmax(0,1fr)_300px]">
      <form class="min-w-0 space-y-6" novalidate @submit.prevent="save">
        <UiCard :title="t('app.dressCode.styleTitle')" heading-level="h2">
          <fieldset :disabled="!canEdit">
            <legend class="sr-only">{{ t('app.dressCode.styleTitle') }}</legend>
            <div class="grid grid-cols-2 gap-2 sm:gap-3">
              <label
                v-for="type in TYPES"
                :key="type"
                class="flex min-h-[52px] cursor-pointer flex-col items-center justify-center rounded-xl border px-2 py-2.5 text-center transition-colors sm:items-start sm:justify-start sm:p-3 sm:text-left focus-within:ring-2 focus-within:ring-rose-600"
                :class="form.dressCodeType === type ? 'border-rose-600 bg-rose-50' : 'border-line-strong bg-white hover:border-rose-300'"
              >
                <input v-model="form.dressCodeType" type="radio" name="dress-type" :value="type" class="sr-only" />
                <span class="font-medium text-ink-900">{{ t(`app.dressCode.types.${type}.name`) }}</span>
                <span class="mt-0.5 hidden text-sm text-ink-500 sm:block">{{ t(`app.dressCode.types.${type}.hint`) }}</span>
              </label>
            </div>
            <p class="mt-2.5 text-sm text-ink-500 sm:hidden" aria-live="polite" data-testid="dress-type-hint">
              <template v-if="form.dressCodeType">
                <b class="text-ink-900">{{ t(`app.dressCode.types.${form.dressCodeType}.name`) }}:</b>
                {{ t(`app.dressCode.types.${form.dressCodeType}.hint`) }}
              </template>
            </p>
            <p v-if="typeError" class="mt-2 text-sm text-danger-700" role="alert">{{ typeError }}</p>

            <UiField class="mt-5" :label="t('app.dressCode.description')" :hint="t('app.dressCode.descriptionHint')">
              <div ref="descBox">
                <UiTextarea v-model="form.description" :rows="3" :maxlength="DESCRIPTION_MAX" class="min-h-[5.5rem] resize-none overflow-hidden pb-7!" />
              </div>
            </UiField>
          </fieldset>
        </UiCard>

        <UiCard :title="t('app.dressCode.colorsTitle')" heading-level="h2">
          <div class="space-y-6">
            <DressCodeColors
              v-model="form.reservedColors"
              :other-colors="form.suggestedColors"
              :disabled="!canEdit"
              :label="t('app.dressCode.reserved')"
              :hint="t(isQuince ? 'app.dressCode.reservedHintQuince' : 'app.dressCode.reservedHintWedding')"
              :sheet-title="t('app.dressCode.addReservedTitle')"
              :blocked-reason="t('app.dressCode.inSuggested')"
            />
            <DressCodeColors
              v-model="form.suggestedColors"
              :other-colors="form.reservedColors"
              :disabled="!canEdit"
              :label="t('app.dressCode.suggested')"
              :hint="t('app.dressCode.suggestedHint')"
              :sheet-title="t('app.dressCode.addSuggestedTitle')"
              :blocked-reason="t('app.dressCode.inReserved')"
            />
          </div>
        </UiCard>

        <UiCard :title="t('app.dressCode.imagesTitle')" :subtitle="t('app.dressCode.imagesSubtitle', { max: MAX_IMAGES })" heading-level="h2">
          <ul v-if="guestImages.length" class="grid grid-cols-3 gap-3 sm:grid-cols-4">
            <li v-for="image in guestImages" :key="image.id" class="aspect-[3/4] overflow-hidden rounded-lg bg-cream-100">
              <img :src="image.url" alt="" class="h-full w-full object-cover" loading="lazy" />
            </li>
          </ul>

          <div v-if="canEdit" class="mt-4 space-y-4">
            <div v-if="uploads.length || files.length" class="flex flex-wrap gap-2">
              <button
                v-for="upload in uploads"
                :key="upload.id"
                type="button"
                class="flex items-center gap-1 rounded-full border border-line-strong px-3 py-1 text-sm text-ink-700 hover:border-rose-300"
                @click="uploads = uploads.filter(u => u.id !== upload.id)"
              >
                {{ upload.originalName || t('app.dressCode.photo') }}
                <X class="h-3.5 w-3.5" aria-hidden="true" />
                <span class="sr-only">{{ t('app.dressCode.removePhoto') }}</span>
              </button>
              <button
                v-for="(file, index) in files"
                :key="file.name + index"
                type="button"
                class="flex items-center gap-1 rounded-full border border-line-strong px-3 py-1 text-sm text-ink-700 hover:border-rose-300"
                @click="files.splice(index, 1)"
              >
                {{ file.name }}
                <X class="h-3.5 w-3.5" aria-hidden="true" />
                <span class="sr-only">{{ t('app.dressCode.removePhoto') }}</span>
              </button>
            </div>

            <label
              class="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong px-4 py-5 text-sm text-ink-700 focus-within:ring-2 focus-within:ring-rose-600 hover:border-rose-300"
              :class="full ? 'pointer-events-none opacity-40' : ''"
            >
              <ImagePlus class="h-5 w-5" aria-hidden="true" />
              {{ t('app.dressCode.upload') }}
              <input
                type="file"
                class="sr-only"
                accept="image/jpeg,image/png,image/webp"
                multiple
                @change="addFiles($event.target.files), ($event.target.value = '')"
              />
            </label>
            <p class="text-xs text-ink-500">{{ t('app.dressCode.uploadHint') }}</p>

            <div v-if="bank.length">
              <p class="text-sm font-medium text-ink-900">{{ t('app.dressCode.bankTitle') }}</p>
              <ul class="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-4">
                <li v-for="item in bank" :key="item.key">
                  <button
                    type="button"
                    :aria-pressed="bankPicks.includes(item.key)"
                    class="aspect-[3/4] w-full overflow-hidden rounded-lg ring-offset-2 transition-[opacity] focus-visible:ring-2 focus-visible:ring-rose-600"
                    :class="bankPicks.includes(item.key) ? 'ring-2 ring-rose-600' : 'opacity-90 hover:opacity-100'"
                    :title="item.credit"
                    @click="toggleBank(item.key)"
                  >
                    <img :src="item.url" alt="" class="h-full w-full object-cover" loading="lazy" />
                  </button>
                </li>
              </ul>
            </div>
            <p v-if="imageError" class="text-sm text-danger-700" role="alert">{{ imageError }}</p>
          </div>
        </UiCard>

        <div v-if="canEdit" class="hidden items-center gap-3 md:flex" data-testid="dress-save-row">
          <UiButton v-if="dirty" type="submit" :loading="saving">{{ t('app.dressCode.save') }}</UiButton>
          <span v-else class="text-sm text-ink-500" data-testid="dress-saved">&#10003; {{ t('app.dressCode.allSaved') }}</span>
        </div>
        <p v-else class="text-sm text-ink-500">{{ t('app.dressCode.readOnly') }}</p>

        <div v-if="canEdit && saved?.id" class="text-center">
          <button
            type="button"
            class="min-h-[44px] px-3 text-[13px] font-semibold text-danger-700 hover:underline focus-visible:outline-2 focus-visible:outline-rose-600 disabled:opacity-60"
            :disabled="saving"
            data-testid="dress-remove"
            @click="confirmDelete = true"
          >
            {{ t('app.dressCode.remove') }}
          </button>
        </div>
      </form>

      <aside class="sticky top-[88px] hidden lg:block" data-testid="dress-aside">
        <DressCodePreview :type="form.dressCodeType" :description="form.description" :reserved="form.reservedColors" :suggested="form.suggestedColors" />
      </aside>

    </div>

    <div
      v-if="canEdit && !loading"
      ref="saveBar"
      class="fixed bottom-[calc(76px+env(safe-area-inset-bottom,0px))] left-4 right-[4.5rem] z-20 flex items-center justify-between gap-3 rounded-[14px] border border-cream-200 bg-white px-3 py-2.5 shadow-card md:hidden"
      data-testid="dress-save-bar"
    >
      <span class="min-w-0 text-[13px] leading-tight" :class="dirty ? 'text-ink-900' : 'text-ink-500'">
        {{ dirty ? t('app.dressCode.unsaved') : `\u2713 ${t('app.dressCode.allSaved')}` }}
      </span>
      <UiButton :loading="saving" :disabled="!dirty" class="h-10 px-[18px]" @click="save">{{ t('app.dressCode.saveShort') }}</UiButton>
    </div>

    <UiModal v-model:open="confirmDelete" :title="t('app.dressCode.removeTitle')" size="sm">
      <p class="text-ink-700">{{ t('app.dressCode.removeBody') }}</p>
      <template #footer>
        <UiButton variant="ghost" @click="confirmDelete = false">{{ t('app.dressCode.cancel') }}</UiButton>
        <UiButton variant="danger" :loading="saving" @click="remove">{{ t('app.dressCode.remove') }}</UiButton>
      </template>
    </UiModal>
  </UiPage>
</template>
