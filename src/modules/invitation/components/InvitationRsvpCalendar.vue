<script setup>
/**
 * After a "yes": a small card to keep the date (Google Calendar, .ics file) and to find the place. Only drawn when the API
 * sent `calendar` with the RSVP. Engine classes (`inv-rsvp-calendar*`) and theme variables only, so a package can dress it.
 */
import { computed } from 'vue'
import { CalendarPlus, MapPin } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import { useInvitationContext } from '../composables/useInvitation'
import { safeHttpsUrl } from '../composables/safeUrl'
import { icsUrl } from '../composables/calendarLinks'
import InvitationButton from './InvitationButton.vue'

const props = defineProps({
  calendar: { type: Object, required: true }
})

const { tt, invitation } = useInvitationContext()
const route = useRoute()

const googleUrl = computed(() => safeHttpsUrl(props.calendar.google))
const ics = computed(() => icsUrl(route.params.slug, route.params.code, props.calendar))
const hasLocationsSection = computed(() => Boolean(invitation?.value?.sections?.some(item => item.type === 'locations')))
/** Without a locations section the main place's map link is the way to get there. */
const mapUrl = computed(() => safeHttpsUrl(props.calendar.location?.links?.google))
const showDirections = computed(() => hasLocationsSection.value || Boolean(mapUrl.value))

function goToLocations() {
  document.getElementById('locations')?.scrollIntoView({ behavior: globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ? 'auto' : 'smooth', block: 'start' })
}
</script>

<template>
  <section class="inv-rsvp-calendar mx-auto mt-8 max-w-md rounded-2xl bg-inv-surface px-5 py-5 ring-1 ring-inv-ink/10" :aria-label="tt('rsvp.calendar.title')" data-rsvp-calendar>
    <p class="inv-rsvp-calendar__title flex items-center justify-center gap-2 font-inv-heading text-lg">
      <CalendarPlus class="h-5 w-5 text-inv-primary" aria-hidden="true" />
      {{ tt('rsvp.calendar.title') }}
    </p>
    <div class="mt-4 flex flex-col gap-3">
      <InvitationButton v-if="googleUrl" class="inv-rsvp-calendar__google" variant="outline" :href="googleUrl" target="_blank" rel="noopener">
        {{ tt('saveTheDate.google') }}
      </InvitationButton>
      <InvitationButton class="inv-rsvp-calendar__ics" variant="outline" :href="ics">{{ tt('rsvp.calendar.download') }}</InvitationButton>
      <InvitationButton
        v-if="showDirections"
        class="inv-rsvp-calendar__directions"
        variant="outline"
        v-bind="hasLocationsSection ? { onClick: goToLocations } : { href: mapUrl, target: '_blank', rel: 'noopener' }"
      >
        <MapPin class="h-4 w-4" aria-hidden="true" />
        {{ tt('directions') }}
      </InvitationButton>
    </div>
  </section>
</template>
