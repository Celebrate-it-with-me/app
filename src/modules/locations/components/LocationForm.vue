<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ImagePlus, X, Search } from 'lucide-vue-next'
import { UiModal, UiField, UiInput, UiSelect, UiTextarea, UiButton } from '@/ui'
import { loadGoogleLibraries } from '@/utils/googleMaps'
import LocationsService from '../services/LocationsService'
import { TYPES, MAX_IMAGES, emptyForm, formFromLocation, formFromPlace, formErrors, fileProblem } from '../utils/locationForm'

const props = defineProps({
  open: { type: Boolean, default: false },
  eventId: { type: [Number, String], required: true },
  location: { type: Object, default: null },
  saving: { type: Boolean, default: false }
})
const emit = defineEmits(['update:open', 'save'])
const { t } = useI18n()

const form = ref(emptyForm())
const errors = ref({})
const searchInput = ref(null)
const searchText = ref('')
const searchFailed = ref(false)
let autocomplete = null

// Pictures: those already saved (kept or dropped), new files, and Google photos picked.
const saved = ref([])
const removedIds = ref([])
const files = ref([])
const googleOffered = ref([])
const googlePicked = ref([])
const googleLoading = ref(false)
const imageError = ref('')

const options = TYPES.map(type => ({ value: type, label: t(`app.locations.types.${type}`) }))
const keptSaved = computed(() => saved.value.filter(image => !removedIds.value.includes(image.id)))
const total = computed(() => keptSaved.value.length + files.value.length + googlePicked.value.length)
const full = computed(() => total.value >= MAX_IMAGES)
const filePreviews = new Map()
const previewOf = file => {
  if (!filePreviews.has(file)) filePreviews.set(file, URL.createObjectURL(file))
  return filePreviews.get(file)
}

watch(
  () => props.open,
  open => {
    if (!open) return
    form.value = props.location ? formFromLocation(props.location) : emptyForm()
    saved.value = props.location?.images ?? []
    removedIds.value = []
    files.value = []
    googleOffered.value = []
    googlePicked.value = []
    errors.value = {}
    imageError.value = ''
    searchText.value = ''
    searchFailed.value = false
    nextTick(attachAutocomplete)
  }
)

/** Address search is an extra: if Google does not load, the fields below still work. */
async function attachAutocomplete() {
  if (autocomplete || !searchInput.value) return
  try {
    await loadGoogleLibraries('places')
    autocomplete = new window.google.maps.places.Autocomplete(searchInput.value, {
      fields: ['address_components', 'geometry', 'name', 'place_id', 'formatted_address']
    })
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (!place?.address_components) return
      form.value = { ...form.value, ...formFromPlace(place), directions: form.value.directions, type: form.value.type }
      googleOffered.value = []
      googlePicked.value = []
    })
  } catch {
    searchFailed.value = true
  }
}

async function loadGooglePhotos() {
  googleLoading.value = true
  imageError.value = ''
  try {
    googleOffered.value = (await LocationsService.googlePhotos(props.eventId, form.value.placeId)).map(photo => photo.url)
    if (!googleOffered.value.length) imageError.value = t('app.locations.noGooglePhotos')
  } catch {
    imageError.value = t('app.locations.noGooglePhotos')
  } finally {
    googleLoading.value = false
  }
}

function toggleGoogle(url) {
  imageError.value = ''
  if (googlePicked.value.includes(url)) googlePicked.value = googlePicked.value.filter(u => u !== url)
  else if (full.value) imageError.value = t('app.locations.imagesFull', { max: MAX_IMAGES })
  else googlePicked.value = [...googlePicked.value, url]
}

function addFiles(list) {
  imageError.value = ''
  for (const file of list) {
    if (full.value) return (imageError.value = t('app.locations.imagesFull', { max: MAX_IMAGES }))
    const problem = fileProblem(file)
    if (problem) return (imageError.value = t(`app.locations.file.${problem}`, { name: file.name }))
    files.value.push(file)
  }
}

function submit() {
  errors.value = formErrors(form.value)
  if (Object.keys(errors.value).length) return
  emit('save', {
    form: { ...form.value },
    files: [...files.value],
    googlePhotos: [...googlePicked.value],
    removedImageIds: [...removedIds.value]
  })
}

const err = key => (errors.value[key] ? t(errors.value[key]) : '')
</script>

<template>
  <UiModal :open="open" :title="t(location ? 'app.locations.editTitle' : 'app.locations.addTitle')" size="lg" @update:open="emit('update:open', $event)">
    <form id="location-form" class="space-y-4" novalidate @submit.prevent="submit">
      <UiField :label="t('app.locations.fields.type')">
        <UiSelect v-model="form.type" :options="options" />
      </UiField>

      <UiField :label="t('app.locations.search')" :hint="searchFailed ? t('app.locations.searchOff') : t('app.locations.searchHint')">
        <div class="relative">
          <Search class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" aria-hidden="true" />
          <input
            ref="searchInput"
            v-model="searchText"
            type="text"
            autocomplete="off"
            class="h-11 w-full rounded-xl border border-line-strong bg-white pl-10 pr-3 text-base text-ink-900 placeholder:text-ink-500 focus-visible:outline-2 focus-visible:outline-rose-600"
            :placeholder="t('app.locations.searchPlaceholder')"
            @focus="attachAutocomplete"
          />
        </div>
      </UiField>

      <UiField :label="t('app.locations.fields.name')" :error="err('name')" required>
        <UiInput v-model="form.name" :invalid="!!errors.name" maxlength="120" />
      </UiField>
      <UiField :label="t('app.locations.fields.address')" :error="err('address')" required>
        <UiInput v-model="form.address" :invalid="!!errors.address" maxlength="255" autocomplete="off" />
      </UiField>
      <div class="grid gap-3 sm:grid-cols-2">
        <UiField :label="t('app.locations.fields.city')" :error="err('city')" required>
          <UiInput v-model="form.city" :invalid="!!errors.city" />
        </UiField>
        <UiField :label="t('app.locations.fields.state')">
          <UiInput v-model="form.state" />
        </UiField>
        <UiField :label="t('app.locations.fields.zipCode')">
          <UiInput v-model="form.zipCode" inputmode="numeric" />
        </UiField>
        <UiField :label="t('app.locations.fields.country')" :error="err('country')" required>
          <UiInput v-model="form.country" :invalid="!!errors.country" />
        </UiField>
      </div>

      <UiField :label="t('app.locations.fields.directions')" :hint="t('app.locations.directionsHint')">
        <UiTextarea v-model="form.directions" :rows="3" :maxlength="500" />
      </UiField>

      <fieldset class="space-y-3">
        <legend class="text-sm font-medium text-ink-900">{{ t('app.locations.imagesTitle') }}</legend>
        <p class="text-sm text-ink-500">{{ t('app.locations.imagesHint', { max: MAX_IMAGES }) }}</p>

        <ul v-if="keptSaved.length || files.length || googlePicked.length" class="grid grid-cols-3 gap-2 sm:grid-cols-4">
          <li v-for="image in keptSaved" :key="`s${image.id}`" class="relative aspect-[4/3] overflow-hidden rounded-lg bg-cream-100">
            <img :src="image.path" alt="" class="h-full w-full object-cover" />
            <button type="button" class="absolute right-1 top-1 rounded-full bg-white/90 p-1" :aria-label="t('app.locations.removePhoto')" @click="removedIds.push(image.id)">
              <X class="h-4 w-4" aria-hidden="true" />
            </button>
          </li>
          <li v-for="(file, index) in files" :key="`f${index}`" class="relative aspect-[4/3] overflow-hidden rounded-lg bg-cream-100">
            <img :src="previewOf(file)" alt="" class="h-full w-full object-cover" />
            <button type="button" class="absolute right-1 top-1 rounded-full bg-white/90 p-1" :aria-label="t('app.locations.removePhoto')" @click="files.splice(index, 1)">
              <X class="h-4 w-4" aria-hidden="true" />
            </button>
          </li>
          <li v-for="url in googlePicked" :key="url" class="relative aspect-[4/3] overflow-hidden rounded-lg bg-cream-100">
            <img :src="url" alt="" class="h-full w-full object-cover" />
            <button type="button" class="absolute right-1 top-1 rounded-full bg-white/90 p-1" :aria-label="t('app.locations.removePhoto')" @click="toggleGoogle(url)">
              <X class="h-4 w-4" aria-hidden="true" />
            </button>
          </li>
        </ul>

        <label
          class="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong px-4 py-4 text-sm text-ink-700 focus-within:ring-2 focus-within:ring-rose-600 hover:border-rose-300"
          :class="full ? 'pointer-events-none opacity-40' : ''"
        >
          <ImagePlus class="h-5 w-5" aria-hidden="true" />
          {{ t('app.locations.upload') }}
          <input type="file" class="sr-only" accept="image/jpeg,image/png,image/webp" multiple @change="addFiles($event.target.files), ($event.target.value = '')" />
        </label>

        <div v-if="form.placeId">
          <UiButton variant="secondary" size="sm" :loading="googleLoading" @click="loadGooglePhotos">{{ t('app.locations.googlePhotos') }}</UiButton>
          <ul v-if="googleOffered.length" class="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            <li v-for="url in googleOffered" :key="url">
              <button
                type="button"
                :aria-pressed="googlePicked.includes(url)"
                class="aspect-[4/3] w-full overflow-hidden rounded-lg ring-offset-2 focus-visible:ring-2 focus-visible:ring-rose-600"
                :class="googlePicked.includes(url) ? 'ring-2 ring-rose-600' : 'opacity-90 hover:opacity-100'"
                @click="toggleGoogle(url)"
              >
                <img :src="url" alt="" class="h-full w-full object-cover" loading="lazy" />
              </button>
            </li>
          </ul>
        </div>
        <p v-if="imageError" class="text-sm text-danger-700" role="alert">{{ imageError }}</p>
      </fieldset>
    </form>
    <template #footer>
      <UiButton variant="ghost" @click="emit('update:open', false)">{{ t('app.locations.cancel') }}</UiButton>
      <UiButton type="submit" form="location-form" :loading="saving">{{ t('app.locations.save') }}</UiButton>
    </template>
  </UiModal>
</template>
