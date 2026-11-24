<script setup>
/**
 * After a "yes": a small card to keep the date and to find the place. Only drawn when the API sent `calendar` with the
 * RSVP. One primary button (the calendar this guest most likely uses), the other format and the directions as quiet links.
 * Engine classes (`inv-rsvp-calendar*`) and theme variables only, so a package can dress it.
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

const { tt, invitation, formatDate } = useInvitationContext()
const route = useRoute()

const googleUrl = computed(() => safeHttpsUrl(props.calendar.google))
const ics = computed(() => icsUrl(route.params.slug, route.params.code, props.calendar))
/** The date and time that get saved, as the event's wall clock ("sáb, 2 ene · 7:00 p. m."). */
const when = computed(() => {
  const at = props.calendar.startsAt
  if (!at) return ''
  return `${formatDate(at, { weekday: 'short', day: 'numeric', month: 'short' })} · ${formatDate(at, { timeStyle: 'short' })}`
})
/**
 * Apple devices open an .ics straight in Calendar, so the file is the primary action there; everywhere else (Android,
 * Windows, the web) Google Calendar is one tap. Without a Google link the file is always primary.
 */
const appleDevice = computed(() => /iPhone|iPad|iPod|Macintosh/i.test(globalThis.navigator?.userAgent ?? ''))
const filePrimary = computed(() => !googleUrl.value || appleDevice.value)

const hasLocationsSection = computed(() => Boolean(invitation?.value?.sections?.some(item => item.type === 'locations')))
/** Without a locations section the main place's map link is the way to get there. */
const mapUrl = computed(() => safeHttpsUrl(props.calendar.location?.links?.google))
const showDirections = computed(() => hasLocationsSection.value || Boolean(mapUrl.value))

const LINK =
  'inv-rsvp-calendar__link inline-flex min-h-11 items-center justify-center gap-1.5 px-2 text-sm font-medium text-inv-primary-ink underline underline-offset-4 hover:text-inv-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inv-primary'

function goToLocations() {
  document.getElementById('locations')?.scrollIntoView({ behavior: globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ? 'auto' : 'smooth', block: 'start' })
}
</script>

<template>
  <section class="inv-rsvp-calendar mx-auto mt-8 max-w-md rounded-2xl bg-inv-surface px-5 py-5 text-center ring-1 ring-inv-ink/10" :aria-label="tt('rsvp.calendar.title')" data-rsvp-calendar>
    <p class="inv-rsvp-calendar__title flex items-center justify-center gap-2 font-inv-heading text-lg">
      <CalendarPlus class="h-5 w-5 text-inv-primary" aria-hidden="true" />
      {{ tt('rsvp.calendar.title') }}
    </p>
    <p v-if="when" class="inv-rsvp-calendar__when mt-1 text-inv-ink-soft" data-rsvp-calendar-when>{{ when }}</p>

    <div class="mt-4 flex flex-col items-stretch gap-1">
      <InvitationButton
        v-if="filePrimary"
        class="inv-rsvp-calendar__ics inv-rsvp-calendar__primary"
        :href="ics"
      >
        {{ tt('rsvp.calendar.download') }}
      </InvitationButton>
      <InvitationButton v-else class="inv-rsvp-calendar__google inv-rsvp-calendar__primary" :href="googleUrl" target="_blank" rel="noopener">
        {{ tt('saveTheDate.google') }}
      </InvitationButton>

      <!-- the other format, as a quiet link -->
      <a v-if="filePrimary && googleUrl" :class="[LINK, 'inv-rsvp-calendar__google']" :href="googleUrl" target="_blank" rel="noopener">{{ tt('saveTheDate.google') }}</a>
      <a v-else-if="!filePrimary" :class="[LINK, 'inv-rsvp-calendar__ics']" :href="ics">{{ tt('rsvp.calendar.download') }}</a>
    </div>

    <div v-if="showDirections" class="mt-3 border-t border-inv-ink/10 pt-2">
      <button v-if="hasLocationsSection" type="button" :class="[LINK, 'inv-rsvp-calendar__directions']" @click="goToLocations">
        <MapPin class="h-4 w-4" aria-hidden="true" />{{ tt('directions') }}
      </button>
      <a v-else :class="[LINK, 'inv-rsvp-calendar__directions']" :href="mapUrl" target="_blank" rel="noopener">
        <MapPin class="h-4 w-4" aria-hidden="true" />{{ tt('directions') }}
      </a>
    </div>
  </section>
</template>
