<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Clock, MapPin, MoreHorizontal, Navigation, Trash2 } from 'lucide-vue-next'
import { UiDropdown, useToast } from '@/ui'
import { addressLines, fullAddress, imageFor, mapsUrl } from '../utils/placeCard'

const props = defineProps({
  place: { type: Object, required: true },
  /** "7:00 p.m. – 1:00 a.m.", or '' to draw no chip. */
  schedule: { type: String, default: '' },
  canEdit: { type: Boolean, default: false },
  /** Offer to turn an "other place" into the reception. */
  suggestReception: { type: Boolean, default: false }
})
const emit = defineEmits(['edit', 'remove', 'retype'])
const { t } = useI18n()
const { success, error: showError } = useToast()

const mapFailed = ref(false)
const image = computed(() => imageFor(props.place, import.meta.env.VITE_GOOGLE_MAPS_API_KEY, mapFailed.value))
const lines = computed(() => addressLines(props.place))

async function copyAddress() {
  try {
    await navigator.clipboard.writeText(fullAddress(props.place))
    success(t('app.locations.copied'))
  } catch {
    showError(t('app.locations.copyError'))
  }
}

const PILL =
  'relative inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold transition-colors touch-target focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 max-md:flex-1'
const PRIMARY = `${PILL} bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800`
const SECONDARY = `${PILL} border border-cream-300 bg-white text-ink-900 hover:bg-cream-100 active:bg-cream-200`
</script>

<template>
  <article class="relative overflow-hidden rounded-xl border border-line bg-white shadow-card md:grid md:grid-cols-[180px_minmax(0,1fr)]" data-testid="location-card">
    <div class="relative h-[110px] bg-cream-100 md:h-auto md:min-h-[150px]" data-testid="location-image" :data-kind="image.kind">
      <img v-if="image.src" :src="image.src" alt="" class="absolute inset-0 h-full w-full object-cover" loading="lazy" @error="image.kind === 'map' && (mapFailed = true)" />
      <div v-else class="loc-streets absolute inset-0 flex items-center justify-center" aria-hidden="true">
        <span class="flex h-10 w-10 items-center justify-center rounded-full bg-white text-rose-600 shadow-sm">
          <MapPin class="h-5 w-5" />
        </span>
      </div>
    </div>

    <div class="flex min-w-0 flex-col gap-1.5 p-4 sm:px-[18px] sm:py-4">
      <div class="flex flex-wrap items-center gap-2">
        <h3 class="min-w-0 font-heading text-xl leading-tight text-ink-900">{{ place.name }}</h3>
        <span v-if="schedule" class="inline-flex items-center gap-1 rounded-full bg-cream-100 px-2.5 py-0.5 text-xs font-semibold text-ink-700" data-testid="location-schedule">
          <Clock class="h-3 w-3" aria-hidden="true" />
          {{ schedule }}
        </span>
        <UiDropdown v-if="canEdit" :items="[{ label: t('app.locations.remove'), icon: Trash2, danger: true, onSelect: () => emit('remove', place) }]">
          <template #trigger>
            <button
              type="button"
              class="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-500 transition-colors touch-target hover:bg-black/5 hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-rose-600 max-md:absolute max-md:right-2.5 max-md:top-2.5 max-md:bg-white/90 max-md:text-ink-900 max-md:shadow-sm md:ml-auto"
              :aria-label="t('app.locations.actionsFor', { name: place.name })"
              data-testid="location-more"
            >
              <MoreHorizontal class="h-5 w-5" aria-hidden="true" />
            </button>
          </template>
        </UiDropdown>
      </div>

      <p class="text-sm text-ink-700" data-testid="location-address">
        <span class="block">{{ lines[0] }}</span>
        <span v-if="lines[1]" class="block">{{ lines[1] }}</span>
      </p>
      <p v-if="place.directions" class="text-sm italic text-ink-500">{{ place.directions }}</p>

      <p v-if="canEdit && suggestReception" class="flex flex-wrap items-center gap-x-2 text-sm text-ink-500" data-testid="location-suggestion">
        {{ t('app.locations.suggestReception') }}
        <button type="button" class="font-semibold text-rose-600 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-rose-600" @click="emit('retype', place)">
          {{ t('app.locations.suggestAction') }}
        </button>
      </p>

      <div class="mt-2 flex flex-wrap gap-2">
        <a :href="mapsUrl(place)" target="_blank" rel="noopener noreferrer" :class="PRIMARY" data-testid="location-directions">
          <Navigation class="h-3.5 w-3.5" aria-hidden="true" />
          {{ t('app.locations.directionsAction') }}
        </a>
        <button type="button" :class="SECONDARY" data-testid="location-copy" @click="copyAddress">{{ t('app.locations.copyAddress') }}</button>
        <button v-if="canEdit" type="button" :class="SECONDARY" data-testid="location-edit" @click="emit('edit', place)">{{ t('app.locations.edit') }}</button>
      </div>
    </div>
  </article>
</template>

<style scoped>
/* A grid of streets in the colours of the page: the place has no photo and no map. */
.loc-streets {
  background-color: var(--color-cream-100);
  background-image:
    linear-gradient(115deg, transparent 46%, var(--color-cream-300) 46% 50%, transparent 50%),
    repeating-linear-gradient(0deg, transparent 0 22px, var(--color-cream-200) 22px 24px),
    repeating-linear-gradient(90deg, transparent 0 28px, var(--color-cream-200) 28px 30px);
}
</style>
