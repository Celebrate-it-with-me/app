<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Shirt, ImagePlus, X } from 'lucide-vue-next'
import { UiPageHeader, UiCard, UiField, UiTextarea, UiButton, UiSkeleton, UiModal, useToast } from '@/ui'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import DressCodeService from '../services/DressCodeService'
import DressCodeColors from '../components/DressCodeColors.vue'
import {
  TYPES,
  MAX_IMAGES,
  DESCRIPTION_MAX,
  emptyForm,
  formFromApi,
  bankFor,
  bankUrl,
  fileProblem,
  buildFormData
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

const dirty = computed(() => {
  const base = formFromApi(saved.value)
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
  return (
    !saved.value?.id ||
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
  <div class="mx-auto max-w-5xl">
    <UiPageHeader :title="t('app.dressCode.title')" :subtitle="t('app.dressCode.subtitle')" />

    <div v-if="loading" class="mt-6 space-y-4">
      <UiSkeleton class="h-40" />
      <UiSkeleton class="h-56" />
    </div>

    <div v-else class="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <form class="space-y-6" novalidate @submit.prevent="save">
        <UiCard :title="t('app.dressCode.styleTitle')" heading-level="h2">
          <fieldset :disabled="!canEdit">
            <legend class="sr-only">{{ t('app.dressCode.styleTitle') }}</legend>
            <div class="grid gap-3 sm:grid-cols-2">
              <label
                v-for="type in TYPES"
                :key="type"
                class="flex cursor-pointer flex-col rounded-xl border p-3 transition-colors focus-within:ring-2 focus-within:ring-rose-600"
                :class="form.dressCodeType === type ? 'border-rose-600 bg-rose-50' : 'border-line-strong bg-white hover:border-rose-300'"
              >
                <input v-model="form.dressCodeType" type="radio" name="dress-type" :value="type" class="sr-only" />
                <span class="font-medium text-ink-900">{{ t(`app.dressCode.types.${type}.name`) }}</span>
                <span class="mt-0.5 text-sm text-ink-500">{{ t(`app.dressCode.types.${type}.hint`) }}</span>
              </label>
            </div>
            <p v-if="typeError" class="mt-2 text-sm text-danger-700" role="alert">{{ typeError }}</p>

            <UiField class="mt-5" :label="t('app.dressCode.description')" :hint="t('app.dressCode.descriptionHint')">
              <UiTextarea v-model="form.description" :rows="3" :maxlength="DESCRIPTION_MAX" />
            </UiField>
          </fieldset>
        </UiCard>

        <UiCard :title="t('app.dressCode.colorsTitle')" heading-level="h2">
          <div class="space-y-6">
            <DressCodeColors
              v-model="form.reservedColors"
              :disabled="!canEdit"
              :label="t('app.dressCode.reserved')"
              :hint="t(isQuince ? 'app.dressCode.reservedHintQuince' : 'app.dressCode.reservedHintWedding')"
            />
            <DressCodeColors
              v-model="form.suggestedColors"
              :disabled="!canEdit"
              :label="t('app.dressCode.suggested')"
              :hint="t('app.dressCode.suggestedHint')"
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

        <div v-if="canEdit" class="flex flex-wrap items-center gap-3">
          <UiButton type="submit" :loading="saving" :disabled="!dirty">{{ t('app.dressCode.save') }}</UiButton>
          <UiButton v-if="saved?.id" variant="ghost" :disabled="saving" @click="confirmDelete = true">
            {{ t('app.dressCode.remove') }}
          </UiButton>
        </div>
        <p v-else class="text-sm text-ink-500">{{ t('app.dressCode.readOnly') }}</p>
      </form>

      <aside class="lg:sticky lg:top-6 lg:self-start" :aria-label="t('app.dressCode.previewTitle')">
        <UiCard :title="t('app.dressCode.previewTitle')" :subtitle="t('app.dressCode.previewSubtitle')" heading-level="h2">
          <div v-if="form.dressCodeType" class="text-center">
            <Shirt class="mx-auto h-6 w-6 text-rose-600" aria-hidden="true" />
            <p class="mt-2 font-heading text-2xl text-ink-900">{{ t(`app.dressCode.types.${form.dressCodeType}.name`) }}</p>
            <p v-if="form.description" class="mt-2 text-sm text-ink-700">{{ form.description }}</p>
            <div v-for="group in ['reservedColors', 'suggestedColors']" :key="group">
              <template v-if="form[group].length">
                <p class="mt-4 text-xs text-ink-500">
                  {{ t(group === 'reservedColors' ? (isQuince ? 'app.dressCode.previewReservedQuince' : 'app.dressCode.previewReservedWedding') : 'app.dressCode.previewSuggested') }}
                </p>
                <ul class="mt-2 flex flex-wrap justify-center gap-2">
                  <li v-for="hex in form[group]" :key="hex" class="h-8 w-8 rounded-full ring-1 ring-ink-900/15" :style="{ backgroundColor: hex }" />
                </ul>
              </template>
            </div>
          </div>
          <p v-else class="text-sm text-ink-500">{{ t('app.dressCode.previewEmpty') }}</p>
        </UiCard>
      </aside>
    </div>

    <UiModal v-model:open="confirmDelete" :title="t('app.dressCode.removeTitle')" size="sm">
      <p class="text-ink-700">{{ t('app.dressCode.removeBody') }}</p>
      <template #footer>
        <UiButton variant="ghost" @click="confirmDelete = false">{{ t('app.dressCode.cancel') }}</UiButton>
        <UiButton variant="danger" :loading="saving" @click="remove">{{ t('app.dressCode.remove') }}</UiButton>
      </template>
    </UiModal>
  </div>
</template>
