<script setup>
import { MapPin } from 'lucide-vue-next'
import { useInvitationContext } from '../composables/useInvitation'
import InvitationSection from './InvitationSection.vue'
import InvitationButton from './InvitationButton.vue'

defineProps({
  section: { type: Object, required: true }
})

const { tt } = useInvitationContext()

const cityLine = place => [place.city, place.state, place.zipCode].filter(Boolean).join(', ')
</script>

<template>
  <InvitationSection id="locations" :title="section.title" :text="section.text" alt>
    <ul class="flex flex-col gap-4">
      <li
        v-for="place in section.data.items"
        :key="place.mapsUrl"
        class="rounded-3xl bg-inv-surface p-6 text-left shadow-soft ring-1 ring-inv-ink/10"
      >
        <div class="flex items-start gap-3">
          <MapPin class="mt-1 h-5 w-5 shrink-0 text-inv-primary" aria-hidden="true" />
          <div class="min-w-0">
            <h3 class="font-inv-heading text-xl">{{ place.name }}</h3>
            <p class="mt-1 text-inv-ink-soft">{{ place.address }}</p>
            <p class="text-inv-ink-soft">{{ cityLine(place) }}</p>
            <p v-if="place.notes" class="mt-3 text-inv-ink-soft text-pretty">{{ place.notes }}</p>
          </div>
        </div>
        <InvitationButton variant="outline" :href="place.mapsUrl" target="_blank" rel="noopener" class="mt-5 w-full">
          {{ tt('directions') }}
        </InvitationButton>
      </li>
    </ul>
  </InvitationSection>
</template>
