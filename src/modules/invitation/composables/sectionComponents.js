/** Section type → component. Shared by the public invitation and the admin preview. */
import InvitationCover from '../components/InvitationCover.vue'
import InvitationLocations from '../components/InvitationLocations.vue'
import InvitationCountdown from '../components/InvitationCountdown.vue'
import InvitationSaveTheDate from '../components/InvitationSaveTheDate.vue'
import InvitationPadrinos from '../components/InvitationPadrinos.vue'
import InvitationItinerary from '../components/InvitationItinerary.vue'
import InvitationDressCode from '../components/InvitationDressCode.vue'
import InvitationRsvp from '../components/InvitationRsvp.vue'
import InvitationClosing from '../components/InvitationClosing.vue'

export const SECTION_COMPONENTS = {
  cover: InvitationCover,
  countdown: InvitationCountdown,
  save_the_date: InvitationSaveTheDate,
  itinerary: InvitationItinerary,
  locations: InvitationLocations,
  dress_code: InvitationDressCode,
  padrinos: InvitationPadrinos,
  rsvp: InvitationRsvp,
  closing: InvitationClosing
}
