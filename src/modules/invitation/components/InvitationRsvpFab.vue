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
/** An RSVP that is off, or closed with nothing left to do, leaves the page without a button to nowhere. */
const actionable = computed(() => Boolean(rsvp.value) && rsvp.value.data?.isOpen !== false)
const answered = computed(() => {
  const status = rsvp.value?.data?.guest?.status
  return Boolean(status) && status !== 'pending'
})
const label = computed(() => tt(answered.value ? 'rsvp.change' : 'confirmCta'))
const ariaLabel = computed(() => `${label.value}: ${tt(answered.value ? 'rsvpFab.changeHint' : 'rsvpFab.confirmHint')}`)

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

let io = null
function observe() {
  const doc = globalThis.document
  const cover = doc.querySelector('#cover, .inv-cover')
  const target = doc.getElementById('rsvp')
  if (!('IntersectionObserver' in globalThis)) return
  io = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.target === cover) coverVisible.value = entry.isIntersecting
      else if (entry.target === target) rsvpAhead.value = !entry.isIntersecting && entry.boundingClientRect.top > 0
    }
    measureEnvironment()
  })
  if (cover) io.observe(cover)
  else coverVisible.value = false
  if (target) io.observe(target)
}

onMounted(() => nextTick(() => (measureEnvironment(), observe())))
onBeforeUnmount(() => io?.disconnect())

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
        class="inv-q inv-q--rsvp-fab pointer-events-auto min-w-44 shadow-pop"
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
