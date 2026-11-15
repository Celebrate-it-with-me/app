<script setup>
/**
 * Shared frame for every section: a flourish that draws itself, the heading, optional text and
 * a body slot. `variant` sets the band: plain paper, a warmer alternate, or the deep theme band.
 */
import { computed } from 'vue'
import InvitationFlourish from '../art/InvitationFlourish.vue'
import { useDrawOnView } from '../composables/useDrawOnView'
import { useFrame } from '../composables/frame'

const props = defineProps({
  /** Anchor id, also used to label the section. */
  id: { type: String, required: true },
  title: { type: String, default: null },
  text: { type: String, default: null },
  /** plain | alt | deep */
  variant: { type: String, default: 'plain' }
})

const frame = useFrame()
const root = useDrawOnView()
const deep = computed(() => props.variant === 'deep')
const band = computed(
  () => ({ plain: '', alt: 'bg-inv-surface-alt', deep: 'bg-inv-deep text-inv-surface' })[props.variant]
)
</script>

<template>
  <!-- Inside a template package the package draws heading, flourish and padding: only the body is ours. -->
  <slot v-if="frame === 'bare'" />
  <section
    v-else
    :id="frame === 'full' ? id : undefined"
    ref="root"
    :aria-labelledby="title && frame === 'full' ? `${id}-title` : undefined"
    :class="['inv-section relative overflow-hidden px-6 py-20 sm:py-24', band]"
  >
    <slot name="decor" />
    <div class="relative mx-auto max-w-2xl text-center">
      <InvitationFlourish class="inv-section__flourish" :class="deep ? 'brightness-125' : ''" />
      <h2
        v-if="title && frame !== 'no-title'"
        :id="frame === 'full' ? `${id}-title` : undefined"
        class="inv-section__heading mt-6 font-inv-heading text-3xl leading-tight text-balance sm:text-[2.5rem]"
      >
        {{ title }}
      </h2>
      <p
        v-if="text && frame !== 'no-title'"
        :class="['inv-section__text mx-auto mt-4 max-w-prose text-lg text-pretty', deep ? 'text-inv-surface/80' : 'text-inv-ink-soft']"
      >
        {{ text }}
      </p>
      <div class="inv-section__body mt-10"><slot /></div>
    </div>
  </section>
</template>
