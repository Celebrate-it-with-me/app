<script setup>
import { computed, ref } from 'vue'
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
/** Description and section phrase said almost the same thing twice: show one, the description first. */
const intro = computed(() => data.value.description || props.section.text || '')
const hasRsvp = computed(() => invitation.value.sections.some(item => item.type === 'rsvp'))

/** Same-origin paths and https URLs only. */
const photoFailed = ref(false)
const image = computed(() => (!photoFailed.value && /^(\/(?!\/)|https?:\/\/)/.test(data.value.image ?? '') ? data.value.image : null))
/** Where the photo is centred when the frame crops it: `"40% 25%"` (the API validates it); anything else is the centre. */
const focus = computed(() => (/^\d{1,3}% \d{1,3}%$/.test(data.value.focus ?? '') ? data.value.focus : '50% 50%'))

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

/** Phone only: long names step down so the cover (and its button) still fit one screen. From `sm` up the size is fixed. */
const nameSize = computed(() => {
  const length = (data.value.eventName ?? '').length
  return length > 48 ? 'text-[1.75rem]' : length > 28 ? 'text-[2.25rem]' : 'text-[2.75rem]'
})
/** Phone only: with a long name the arch gives up some height so the button stays clear of the music bar. */
const archSize = computed(() => ((data.value.eventName ?? '').length > 28 ? 'h-44 w-36' : 'h-52 w-40'))
const guestSize = computed(() => ((invitation.value.guest.name ?? '').length > 26 ? 'text-[1.75rem]' : 'text-[2.25rem]'))

function goToRsvp() {
  document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <header
    class="inv-cover bg-pattern-lattice relative isolate flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 pb-20 pt-12 text-center sm:py-24"
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
      <div class="inv-arch inv-cover__media relative mb-8 sm:mb-10">
        <div
          :class="['relative flex items-center justify-center overflow-hidden rounded-t-full bg-inv-surface-alt shadow-pop ring-1 ring-inv-accent/60 sm:h-80 sm:w-64 lg:h-[26rem] lg:w-80', archSize]"
        >
          <img v-if="image" :src="image" alt="" class="h-full w-full object-cover" :style="{ objectPosition: focus }" @error="photoFailed = true" />
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

      <p v-if="section.title" style="--i: 2" class="inv-rise inv-cover__phrase font-inv-script text-[2.25rem] leading-tight text-inv-primary-ink sm:text-5xl">
        {{ section.title }}
      </p>
      <h1
        style="--i: 3"
        :class="['inv-rise inv-cover__name mt-2 font-inv-heading leading-[1.04] tracking-[-0.01em] text-balance sm:text-6xl lg:text-7xl', nameSize]"
      >
        {{ data.eventName }}
      </h1>
      <!-- one intro line: the event description, or the section phrase when there is none -->
      <p v-if="intro" style="--i: 4" class="inv-rise inv-cover__text inv-cover__description mt-2 max-w-md text-inv-ink-soft text-pretty sm:mt-5 sm:text-lg">
        {{ intro }}
      </p>

      <!-- date lockup -->
      <div style="--i: 5" class="inv-rise inv-cover__date mt-4 w-full sm:mt-8 max-w-sm">
        <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <p class="border-y border-inv-accent/50 py-2 sm:py-2.5 text-right text-sm font-medium uppercase tracking-[0.16em]">
            {{ parts.weekday }}
          </p>
          <p class="font-inv-heading text-5xl leading-none sm:text-7xl">{{ parts.day }}</p>
          <p class="border-y border-inv-accent/50 py-2 sm:py-2.5 text-left text-sm font-medium uppercase tracking-[0.16em]">
            {{ parts.month }}
          </p>
        </div>
        <p class="mt-2 text-inv-ink-soft sm:mt-3">{{ parts.year }} · {{ parts.time }}</p>
      </div>

      <!-- place card for the guest -->
      <div style="--i: 7" class="inv-rise inv-cover__guest mt-4 flex sm:mt-8 flex-col items-center">
        <p class="text-sm text-inv-ink-soft">{{ tt('invitedFor') }}</p>
        <p :class="['mt-1 font-inv-script leading-tight text-balance text-inv-primary-ink sm:text-5xl', guestSize]">{{ invitation.guest.name }}</p>
      </div>

      <InvitationButton v-if="hasRsvp" style="--i: 8" class="inv-rise inv-cover__cta mt-4 sm:mt-8" @click="goToRsvp">
        {{ tt('confirmCta') }}
      </InvitationButton>
    </div>
  </header>
</template>
