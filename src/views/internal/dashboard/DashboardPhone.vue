<script setup>
/**
 * The invitation in miniature inside a phone frame (the Inicio's hero, 190 x 360 like the prototype). The screen is the
 * real cover (InvitationMiniature); while it loads, a skeleton with the shape of a cover (arch, title, button) so the
 * phone never reads as empty; when it cannot be drawn it shows the template's image or a calm stationery card.
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
    class="relative h-[360px] w-[190px] shrink-0 overflow-hidden rounded-[30px] border-[6px] border-ink-900 bg-ink-900 shadow-[0_18px_36px_rgba(43,36,32,0.25)]"
    data-testid="hero-phone"
  >
    <div class="h-full w-full overflow-hidden rounded-[24px] bg-cream-100">
      <InvitationMiniature :event-id="eventId" :live="live" :fallback-image="image" :name="name" :date-label="dateLabel" class="h-full">
        <template #skeleton>
          <div class="flex h-full w-full flex-col items-center justify-center gap-3 bg-cream-200 px-5 motion-safe:animate-pulse" data-testid="hero-phone-skeleton">
            <span class="h-2 w-16 rounded-full bg-cream-300"></span>
            <span class="h-28 w-24 rounded-t-full rounded-b-md bg-cream-300"></span>
            <span class="h-4 w-28 rounded-md bg-cream-300"></span>
            <span class="h-4 w-20 rounded-md bg-cream-300"></span>
            <span class="mt-1 h-6 w-24 rounded-full bg-cream-300"></span>
          </div>
        </template>
      </InvitationMiniature>
    </div>
  </div>
</template>
