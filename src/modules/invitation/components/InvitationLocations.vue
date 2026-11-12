<script setup>
import { MapPin } from 'lucide-vue-next'
import { useInvitationContext } from '../composables/useInvitation'
import InvitationSection from './InvitationSection.vue'
import InvitationPanel from './InvitationPanel.vue'
import InvitationButton from './InvitationButton.vue'

defineProps({
  section: { type: Object, required: true }
})

const { tt } = useInvitationContext()

const cityLine = place => [place.city, place.state, place.zipCode].filter(Boolean).join(', ')
</script>

<template>
  <InvitationSection id="locations" :title="section.title" :text="section.text" variant="alt">
    <ul class="flex flex-col gap-6">
      <li v-for="place in section.data.items" :key="place.mapsUrl">
        <InvitationPanel>
          <div class="flex flex-col items-center text-center">
            <span
              class="flex h-14 w-14 items-center justify-center rounded-full bg-inv-primary/10 text-inv-primary ring-1 ring-inv-accent/50"
            >
              <MapPin class="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 class="mt-4 font-inv-heading text-2xl text-balance">{{ place.name }}</h3>
            <p class="mt-2 text-inv-ink-soft">{{ place.address }}</p>
            <p class="text-inv-ink-soft">{{ cityLine(place) }}</p>
            <p v-if="place.notes" class="mt-4 max-w-sm text-inv-ink-soft text-pretty">{{ place.notes }}</p>
            <InvitationButton
              variant="outline"
              :href="place.mapsUrl"
              target="_blank"
              rel="noopener"
              class="mt-6 w-full sm:w-auto sm:min-w-56"
            >
              {{ tt('directions') }}
            </InvitationButton>
          </div>
        </InvitationPanel>
      </li>
    </ul>
  </InvitationSection>
</template>
