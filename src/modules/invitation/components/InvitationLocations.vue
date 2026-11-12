<script setup>
import { computed, ref } from 'vue'
import { MapPin, Church, GlassWater } from 'lucide-vue-next'
import { useInvitationContext } from '../composables/useInvitation'
import { parseMoment } from '@/modules/timeline/utils/program'
import InvitationSection from './InvitationSection.vue'
import InvitationPanel from './InvitationPanel.vue'
import InvitationButton from './InvitationButton.vue'

const props = defineProps({
  section: { type: Object, required: true }
})

const { tt, locale } = useInvitationContext()

const icons = { ceremony: Church, reception: GlassWater, other: MapPin }
const cityLine = place => [place.city, place.state, place.zipCode].filter(Boolean).join(', ')

const places = computed(() => {
  const format = new Intl.DateTimeFormat(locale.value, { hour: 'numeric', minute: '2-digit' })
  return props.section.data.items.map((place, index) => ({
    ...place,
    key: `${index}-${place.name}`,
    icon: icons[place.type] ?? MapPin,
    time: place.startTime ? format.format(parseMoment(place.startTime)) : null
  }))
})

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
    <ul class="flex flex-col gap-6">
      <li v-for="place in places" :key="place.key">
        <InvitationPanel>
          <div class="flex flex-col items-center text-center">
            <span class="flex h-14 w-14 items-center justify-center rounded-full bg-inv-primary/10 text-inv-primary ring-1 ring-inv-accent/50">
              <component :is="place.icon" class="h-6 w-6" aria-hidden="true" />
            </span>
            <p class="mt-4 text-sm font-medium text-inv-ink-soft">
              {{ tt(`locations.types.${place.type}`) }}<template v-if="place.time"> · {{ tt('locations.at', { time: place.time }) }}</template>
            </p>
            <h3 class="mt-1 font-inv-heading text-2xl text-balance">{{ place.name }}</h3>
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

            <div class="mt-6 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
              <InvitationButton variant="outline" :href="place.links.google" target="_blank" rel="noopener">{{ tt('locations.google') }}</InvitationButton>
              <InvitationButton variant="outline" :href="place.links.apple" target="_blank" rel="noopener">{{ tt('locations.apple') }}</InvitationButton>
              <InvitationButton variant="outline" :href="place.links.waze" target="_blank" rel="noopener">{{ tt('locations.waze') }}</InvitationButton>
            </div>
            <button
              type="button"
              class="mt-4 min-h-11 text-sm font-medium text-inv-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-inv-primary"
              :aria-expanded="!!mapOpen[place.key]"
              @click="toggleMap(place.key)"
            >
              {{ tt(mapOpen[place.key] ? 'locations.hideMap' : 'locations.showMap') }}
            </button>
            <iframe
              v-if="mapOpen[place.key]"
              :src="mapSrc(place)"
              :title="tt('locations.map', { name: place.name })"
              class="mt-2 h-72 w-full rounded-xl border-0"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            />
          </div>
        </InvitationPanel>
      </li>
    </ul>
  </InvitationSection>
</template>
