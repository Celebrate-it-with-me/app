<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { MapPin, Church, GlassWater } from 'lucide-vue-next'
import { useInvitationContext } from '../composables/useInvitation'
import { safeHttpsUrl } from '../composables/safeUrl'
import { formatClock } from '../composables/wallClock'
import InvitationSection from './InvitationSection.vue'
import InvitationPanel from './InvitationPanel.vue'
import InvitationButton from './InvitationButton.vue'

const props = defineProps({
  section: { type: Object, required: true },
  /** cards (a panel per place, default) | list (no panel) */
  variant: { type: String, default: 'cards' },
  /** Show the "see map" toggle. */
  maps: { type: Boolean, default: true }
})

const { tt, locale } = useInvitationContext()

const icons = { ceremony: Church, reception: GlassWater, other: MapPin }
const cityLine = place => [place.city, place.state, place.zipCode].filter(Boolean).join(', ')

const places = computed(() => {
  const apple = prefersApple()
  return props.section.data.items.map((place, index) => {
    const apps = directionApps(place, apple)
    return {
      ...place,
      key: `${index}-${place.name}`,
      icon: icons[place.type] ?? MapPin,
      // "Lugar" says nothing: only ceremony and reception get a type label.
      typeLabel: place.type === 'other' ? null : tt(`locations.types.${place.type}`),
      time: place.startTime ? formatClock(place.startTime, locale.value) : null,
      primary: apps[0] ?? null,
      secondary: apps.slice(1),
      fullAddress: [place.address, cityLine(place)].filter(Boolean).join(', ')
    }
  })
})

/** Apple Maps first on iPhone, iPad and Mac, Google Maps first elsewhere; the rest follow as secondary apps. */
const prefersApple = () => typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent ?? '')
function directionApps(place, apple) {
  const all = [
    { id: 'google', href: safeHttpsUrl(place.links?.google) },
    { id: 'apple', href: safeHttpsUrl(place.links?.apple) },
    { id: 'waze', href: safeHttpsUrl(place.links?.waze) }
  ].filter(app => app.href)
  if (apple) all.sort((a, b) => (b.id === 'apple') - (a.id === 'apple'))
  return all
}

const copied = ref(null)
let copiedTimer = null
const canCopy = typeof navigator !== 'undefined' && !!navigator.clipboard?.writeText
async function copyAddress(place) {
  try {
    await navigator.clipboard.writeText(place.fullAddress)
    copied.value = place.key
    clearTimeout(copiedTimer)
    copiedTimer = setTimeout(() => (copied.value = null), 2500)
  } catch {
    copied.value = null
  }
}
onBeforeUnmount(() => clearTimeout(copiedTimer))

// The map is only loaded when a guest asks for it: no cost per view, and the buttons work without it.
const mapOpen = ref({})
const toggleMap = key => (mapOpen.value = { ...mapOpen.value, [key]: !mapOpen.value[key] })
const mapSrc = place => {
  const point = place.latitude !== null && place.longitude !== null
  const query = point ? `${place.latitude},${place.longitude}` : [place.name, place.address, place.city].filter(Boolean).join(', ')
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`
}
</script>

<template>
  <InvitationSection id="locations" :title="section.title" :text="section.text" variant="alt">
    <ul class="inv-locations flex flex-col gap-6" :data-variant="variant">
      <li v-for="place in places" :key="place.key" class="inv-locations__item">
        <component :is="variant === 'list' ? 'div' : InvitationPanel">
          <div class="flex flex-col items-center text-center">
            <span class="inv-badge flex h-14 w-14 items-center justify-center rounded-full bg-inv-primary/10 text-inv-primary ring-1 ring-inv-accent/50">
              <component :is="place.icon" class="h-6 w-6" aria-hidden="true" />
            </span>
            <p v-if="place.typeLabel || place.time" class="mt-4 text-sm font-medium text-inv-ink-soft">
              {{ place.typeLabel }}<template v-if="place.typeLabel && place.time"> · </template><template v-if="place.time">{{ tt('locations.at', { time: place.time }) }}</template>
            </p>
            <h3 class="inv-locations__name mt-1 font-inv-heading text-2xl text-balance">{{ place.name }}</h3>
            <p class="mt-2 text-inv-ink-soft">{{ place.address }}</p>
            <p class="text-inv-ink-soft">{{ cityLine(place) }}</p>
            <p v-if="place.directions" class="mt-4 max-w-sm text-inv-ink-soft text-pretty">
              <span class="font-medium">{{ tt('locations.directionsTitle') }}:</span> {{ place.directions }}
            </p>

            <ul v-if="place.images.length" class="mt-5 grid w-full grid-cols-2 gap-2 sm:grid-cols-3">
              <li v-for="(src, i) in place.images" :key="i" class="aspect-[4/3] overflow-hidden rounded-xl bg-inv-primary/10">
                <img :src="src" alt="" class="h-full w-full object-cover" loading="lazy" />
              </li>
            </ul>

            <div class="mt-6 flex w-full flex-col items-center gap-3">
              <InvitationButton v-if="place.primary" class="w-full sm:w-auto sm:min-w-56" :href="place.primary.href" target="_blank" rel="noopener" :aria-label="tt('locations.directionsIn', { name: place.name })">
                {{ tt('locations.directions') }} <span class="text-sm font-normal">· {{ tt(`locations.${place.primary.id}`) }}</span>
              </InvitationButton>
              <ul v-if="place.secondary.length" class="flex flex-wrap items-center justify-center gap-x-1" :aria-label="tt('locations.moreApps')">
                <li v-for="app in place.secondary" :key="app.id">
                  <a :href="app.href" target="_blank" rel="noopener" class="inline-flex min-h-11 items-center px-3 text-sm font-medium text-inv-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-inv-primary">{{ tt(`locations.${app.id}`) }}</a>
                </li>
              </ul>
              <div class="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                <button
                  v-if="canCopy && place.fullAddress"
                  type="button"
                  class="inline-flex min-h-11 items-center rounded-full border border-inv-primary/40 px-4 text-sm font-medium text-inv-primary hover:bg-inv-primary/10 focus-visible:outline-2 focus-visible:outline-inv-primary"
                  @click="copyAddress(place)"
                >
                  {{ tt('locations.copyAddress') }}
                </button>
                <button
                  v-if="maps"
                  type="button"
                  class="inline-flex min-h-11 items-center rounded-full border border-inv-primary/40 px-4 text-sm font-medium text-inv-primary hover:bg-inv-primary/10 focus-visible:outline-2 focus-visible:outline-inv-primary"
                  :aria-expanded="!!mapOpen[place.key]"
                  @click="toggleMap(place.key)"
                >
                  {{ tt(mapOpen[place.key] ? 'locations.hideMap' : 'locations.showMap') }}
                </button>
              </div>
              <p class="min-h-5 text-sm text-inv-ink-soft" role="status">{{ copied === place.key ? tt('locations.copied') : '' }}</p>
            </div>
            <iframe
              v-if="maps && mapOpen[place.key]"
              :src="mapSrc(place)"
              :title="tt('locations.map', { name: place.name })"
              class="mt-2 h-72 w-full rounded-xl border-0"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            />
          </div>
        </component>
      </li>
    </ul>
  </InvitationSection>
</template>
