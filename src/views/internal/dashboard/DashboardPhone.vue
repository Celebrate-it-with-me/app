<script setup>
/**
 * The invitation in miniature inside a phone frame. The screen is the real cover (InvitationMiniature); when it cannot
 * be drawn it shows the template's image or a calm stationery card from the brand tokens instead of an empty box.
 */
import InvitationMiniature from '@/modules/template-picker/components/InvitationMiniature.vue'

defineProps({
  eventId: { type: [Number, String], default: null },
  /** Preview image URL of the active template; fallback when the live view fails. */
  image: { type: String, default: '' },
  name: { type: String, default: '' },
  /** Already formatted date line for the fallback card. */
  dateLabel: { type: String, default: '' },
  /** false: no live view (roles that cannot call the preview endpoint). */
  live: { type: Boolean, default: true }
})
</script>

<template>
  <div
    class="relative aspect-[9/18.5] w-36 rounded-[2rem] bg-ink-900 p-1.5 shadow-pop sm:w-48 lg:w-40 xl:w-48 sm:rounded-[2.5rem] sm:p-2"
    data-testid="hero-phone"
  >
    <span class="absolute left-1/2 top-2.5 z-10 h-1.5 w-12 -translate-x-1/2 rounded-full bg-ink-700 sm:top-3.5 sm:h-2 sm:w-16" aria-hidden="true"></span>
    <div class="h-full w-full overflow-hidden rounded-[1.5rem] bg-cream-100 sm:rounded-[2rem]">
      <InvitationMiniature :event-id="eventId" :live="live" :fallback-image="image" :name="name" :date-label="dateLabel" class="h-full" />
    </div>
  </div>
</template>
