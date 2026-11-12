<script setup>
import { computed } from 'vue'
import { useInvitationContext } from '../composables/useInvitation'
import InvitationButton from './InvitationButton.vue'

const props = defineProps({
  section: { type: Object, required: true }
})

const { invitation, tt, formatDate } = useInvitationContext()

const data = computed(() => props.section.data)
const event = computed(() => invitation.value.event)
const hasRsvp = computed(() => invitation.value.sections.some(item => item.type === 'rsvp'))

/** Monogram for the arch when there is no photo: XV for a quinceañera, & for a wedding. */
const emblem = computed(() => ({ quinceanera: 'XV', wedding: '&' })[event.value.typeSlug] ?? '✦')
const day = computed(() => formatDate(event.value.startsAt, { dateStyle: 'full' }))
const time = computed(() => formatDate(event.value.startsAt, { timeStyle: 'short' }))

function goToRsvp() {
  document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <header class="bg-pattern-lattice relative flex min-h-svh flex-col items-center justify-center px-6 py-14 text-center sm:py-20">
    <div class="ui-enter mx-auto flex w-full max-w-xl flex-col items-center">
      <img
        v-if="data.image"
        :src="data.image"
        alt=""
        class="mb-6 h-56 w-44 rounded-t-full sm:mb-8 sm:h-64 sm:w-48 object-cover shadow-card ring-1 ring-inv-accent/50 ring-offset-4 ring-offset-inv-surface"
      />
      <div
        v-else
        aria-hidden="true"
        class="mb-6 flex h-32 w-24 items-center sm:mb-8 sm:h-40 sm:w-32 justify-center rounded-t-full border border-inv-accent/60 font-inv-heading text-4xl text-inv-accent ring-1 ring-inv-accent/30 ring-offset-8 ring-offset-inv-surface"
      >
        {{ emblem }}
      </div>

      <p v-if="section.title" class="font-inv-heading text-xl text-inv-primary italic">{{ section.title }}</p>
      <h1 class="mt-3 font-inv-heading text-5xl leading-[1.05] text-balance sm:text-6xl">
        {{ data.eventName }}
      </h1>
      <p v-if="section.text" class="mt-5 max-w-md text-lg text-inv-ink-soft text-pretty">{{ section.text }}</p>

      <div class="mt-6 border-y border-inv-accent/40 px-8 py-4">
        <p class="font-inv-heading text-xl first-letter:uppercase">{{ day }}</p>
        <p class="mt-1 text-inv-ink-soft">{{ time }}</p>
      </div>

      <p v-if="data.description" class="mt-5 max-w-md text-inv-ink-soft text-pretty">{{ data.description }}</p>

      <p class="mt-6 rounded-full bg-inv-primary/10 px-4 py-1.5 text-sm font-medium text-inv-primary">
        {{ tt('invitedGuest', { name: invitation.guest.name }) }}
      </p>

      <InvitationButton v-if="hasRsvp" class="mt-6" @click="goToRsvp">{{ tt('confirmCta') }}</InvitationButton>
    </div>
  </header>
</template>
