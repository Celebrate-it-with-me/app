<script setup>
import { computed } from 'vue'
import { Sparkles } from 'lucide-vue-next'
import { useInvitationContext } from '../composables/useInvitation'
import InvitationButton from './InvitationButton.vue'
import InvitationSprig from '../art/InvitationSprig.vue'

const props = defineProps({
  section: { type: Object, required: true }
})

const { invitation, tt, formatDate } = useInvitationContext()

const data = computed(() => props.section.data)
const event = computed(() => invitation.value.event)
const hasRsvp = computed(() => invitation.value.sections.some(item => item.type === 'rsvp'))

/** Same-origin paths and https URLs only. */
const image = computed(() => (/^(\/(?!\/)|https?:\/\/)/.test(data.value.image ?? '') ? data.value.image : null))

/** Lettering for the arch when there is no photo: XV for a quinceañera, & for a wedding. */
const emblem = computed(() => ({ quinceanera: 'XV', wedding: '&' })[event.value.typeSlug] ?? null)

/** The date as an invitation lockup: weekday | day | month, then year and time. */
const parts = computed(() => {
  const at = event.value.startsAt
  return {
    weekday: formatDate(at, { weekday: 'long' }),
    day: formatDate(at, { day: 'numeric' }),
    month: formatDate(at, { month: 'long' }),
    year: formatDate(at, { year: 'numeric' }),
    time: formatDate(at, { timeStyle: 'short' })
  }
})

function goToRsvp() {
  document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <header
    class="bg-pattern-lattice relative isolate flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 pb-16 pt-20 text-center sm:py-24"
  >
    <!-- warm light from the top, and two sprigs on opposite corners -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 -z-10"
      style="background: radial-gradient(ellipse 80% 55% at 50% 0%, color-mix(in oklab, var(--inv-primary) 11%, transparent), transparent 70%)"
    />
    <InvitationSprig
      class="inv-fade pointer-events-none absolute -left-8 -top-8 -z-10 h-48 w-48 text-inv-accent/80 sm:-left-4 sm:-top-4 sm:h-72 sm:w-72"
    />
    <InvitationSprig
      flip
      style="--i: 3"
      class="inv-fade pointer-events-none absolute -bottom-8 -right-8 -z-10 h-48 w-48 rotate-180 text-inv-accent/80 sm:-bottom-4 sm:-right-4 sm:h-72 sm:w-72"
    />

    <div class="relative mx-auto flex w-full max-w-xl flex-col items-center lg:max-w-2xl">
      <!-- arch window: the photo, or the lettering when there is none -->
      <div class="inv-arch relative mb-10">
        <div
          class="relative flex h-64 w-48 items-center justify-center overflow-hidden rounded-t-full bg-inv-surface-alt shadow-pop ring-1 ring-inv-accent/60 sm:h-80 sm:w-64 lg:h-[26rem] lg:w-80"
        >
          <img v-if="image" :src="image" alt="" class="h-full w-full object-cover" />
          <template v-else>
            <span
              aria-hidden="true"
              class="absolute inset-0"
              style="background: linear-gradient(to bottom, color-mix(in oklab, var(--inv-primary) 14%, transparent), color-mix(in oklab, var(--inv-accent) 18%, transparent))"
            />
            <span v-if="emblem" aria-hidden="true" class="relative font-inv-heading text-6xl text-inv-accent-ink">
              {{ emblem }}
            </span>
            <Sparkles v-else class="relative h-12 w-12 text-inv-accent-ink" aria-hidden="true" />
          </template>
        </div>
        <span aria-hidden="true" class="pointer-events-none absolute -inset-3 rounded-t-full border border-inv-accent/45" />
      </div>

      <p v-if="section.title" style="--i: 2" class="inv-rise font-inv-script text-[2.5rem] text-inv-primary-ink sm:text-5xl">
        {{ section.title }}
      </p>
      <h1
        style="--i: 3"
        class="inv-rise mt-2 font-inv-heading text-[2.75rem] leading-[1.04] tracking-[-0.01em] text-balance sm:text-6xl lg:text-7xl"
      >
        {{ data.eventName }}
      </h1>
      <p v-if="section.text" style="--i: 4" class="inv-rise mt-5 max-w-md text-lg text-inv-ink-soft text-pretty">
        {{ section.text }}
      </p>

      <!-- date lockup -->
      <div style="--i: 5" class="inv-rise mt-8 w-full max-w-sm">
        <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <p class="border-y border-inv-accent/50 py-2.5 text-right text-sm font-medium uppercase tracking-[0.16em]">
            {{ parts.weekday }}
          </p>
          <p class="font-inv-heading text-6xl leading-none sm:text-7xl">{{ parts.day }}</p>
          <p class="border-y border-inv-accent/50 py-2.5 text-left text-sm font-medium uppercase tracking-[0.16em]">
            {{ parts.month }}
          </p>
        </div>
        <p class="mt-3 text-inv-ink-soft">{{ parts.year }} · {{ parts.time }}</p>
      </div>

      <p v-if="data.description" style="--i: 6" class="inv-rise mt-7 max-w-md text-inv-ink-soft text-pretty">
        {{ data.description }}
      </p>

      <!-- place card for the guest -->
      <div style="--i: 7" class="inv-rise mt-8 flex flex-col items-center">
        <p class="text-sm text-inv-ink-soft">{{ tt('invitedFor') }}</p>
        <p class="mt-1 font-inv-script text-[2.5rem] leading-tight text-inv-primary-ink sm:text-5xl">{{ invitation.guest.name }}</p>
      </div>

      <InvitationButton v-if="hasRsvp" style="--i: 8" class="inv-rise mt-8" @click="goToRsvp">
        {{ tt('confirmCta') }}
      </InvitationButton>
    </div>
  </header>
</template>
