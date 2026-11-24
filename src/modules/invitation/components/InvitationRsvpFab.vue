<script setup>
/**
 * Floating "Confirmar asistencia" pill. It appears once the cover has scrolled away and goes again when the RSVP section
 * reaches the screen (or is already behind the guest), so the action is never more than one tap away in a long invitation.
 *
 * Package hook: the element carries the stable class `inv-q--rsvp-fab` and `data-inv-fab="rsvp"` (plus
 * `data-inv-system-ui`, so the integrity guard reads it as system UI). It is NOT drawn when the package already shows a
 * floating `<q-cta>` of its own (a `[data-q="cta"]` that is `position: fixed|sticky`, or inside one): two floating
 * buttons for the same action would be noise. `data-stack` tells a package how it sits: `none` | `phone` | `always`
 * (above the music bar when the bar is docked at the bottom).
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useInvitationContext } from '../composables/useInvitation'
import InvitationButton from './InvitationButton.vue'

const { invitation, tt } = useInvitationContext()

const rsvp = computed(() => invitation.value?.sections?.find(item => item.type === 'rsvp') ?? null)
const answered = computed(() => {
  const status = rsvp.value?.data?.guest?.status
  return Boolean(status) && status !== 'pending'
})
/**
 * An RSVP that is off, closed, or already answered leaves the page without a floating button: the guest who replied does
 * not need a nudge all the way down, and "Cambiar mi respuesta" lives in the RSVP card itself (R2A-003).
 */
const actionable = computed(() => Boolean(rsvp.value) && rsvp.value.data?.isOpen !== false && !answered.value)
const label = computed(() => tt('confirmCta'))
const ariaLabel = computed(() => `${label.value}: ${tt('rsvpFab.confirmHint')}`)

const coverVisible = ref(true)
/** The RSVP section is below the viewport (not on screen and not already passed). */
const rsvpAhead = ref(false)
const ownFloatingCta = ref(false)
/** How the music control is docked: none | phone (a bar below `sm`) | always. */
const stack = ref('none')

const shown = computed(() => actionable.value && !coverVisible.value && rsvpAhead.value && !ownFloatingCta.value)

const POSITION = {
  none: 'bottom-[max(1rem,env(safe-area-inset-bottom))]',
  phone: 'bottom-20 sm:bottom-[max(1rem,env(safe-area-inset-bottom))]',
  always: 'bottom-20'
}

const reducedMotion = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true

function floating(el) {
  for (let node = el; node && !node.classList?.contains('inv-root'); node = node.parentElement) {
    const position = globalThis.getComputedStyle(node).position
    if (position === 'fixed' || position === 'sticky') return true
  }
  return false
}

function measureEnvironment() {
  const root = globalThis.document
  ownFloatingCta.value = [...root.querySelectorAll('[data-q="cta"]')].some(floating)
  const music = root.querySelector('.inv-music')
  const variant = music?.getAttribute('data-variant')
  stack.value = !music || variant === 'button' ? 'none' : variant === 'bar' ? 'always' : 'phone'
}

let frame = 0
let cover = null
let measured = false
/**
 * Reads the live position of the cover and of the RSVP section. A scroll listener (one read per frame) instead of an
 * IntersectionObserver: that one stays silent when the guest jumps past the RSVP (an anchor, a fast flick) and the
 * state would go stale.
 */
function update() {
  frame = 0
  const doc = globalThis.document
  cover = cover?.isConnected ? cover : doc.querySelector('#cover, .inv-cover')
  const target = doc.getElementById('rsvp')
  const coverOn = cover ? cover.getBoundingClientRect().bottom > 0 : false
  const ahead = target ? target.getBoundingClientRect().top >= globalThis.innerHeight : false
  // The surroundings (music control, a package's own CTA) are only looked at when the verdict changes: no style reads per scroll frame.
  const changed = coverOn !== coverVisible.value || ahead !== rsvpAhead.value
  coverVisible.value = coverOn
  rsvpAhead.value = ahead
  if (changed || !measured) measureEnvironment()
  measured = true
}
function schedule() {
  if (!frame) frame = globalThis.requestAnimationFrame(update)
}

onMounted(() => {
  globalThis.addEventListener('scroll', schedule, { passive: true })
  globalThis.addEventListener('resize', schedule, { passive: true })
  nextTick(update)
})
onBeforeUnmount(() => {
  globalThis.removeEventListener('scroll', schedule)
  globalThis.removeEventListener('resize', schedule)
  globalThis.cancelAnimationFrame?.(frame)
})

/** Smooth scroll to the RSVP and focus its first control (without a second jump). */
function go() {
  const target = globalThis.document.getElementById('rsvp')
  if (!target) return
  target.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' })
  target.querySelector('input, button:not([disabled]), select, textarea, a[href]')?.focus({ preventScroll: true })
}
</script>

<template>
  <div :class="['inv-rsvp-fab pointer-events-none fixed inset-x-0 z-20 flex justify-center px-4', POSITION[stack]]" :data-stack="stack">
    <Transition
      enter-active-class="transition-[opacity,translate] duration-[220ms] ease-out motion-reduce:transition-none"
      enter-from-class="translate-y-3 opacity-0 motion-reduce:translate-y-0"
      leave-active-class="transition-[opacity,translate] duration-150 ease-out motion-reduce:transition-none"
      leave-to-class="translate-y-2 opacity-0 motion-reduce:translate-y-0"
    >
      <InvitationButton
        v-if="shown"
        class="inv-q--rsvp-fab pointer-events-auto min-w-44 shadow-pop"
        data-inv-fab="rsvp"
        data-inv-system-ui
        data-testid="invitation-rsvp-fab"
        :aria-label="ariaLabel"
        @click="go"
      >
        {{ label }}
      </InvitationButton>
    </Transition>
  </div>
</template>
