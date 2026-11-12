<script setup>
/**
 * Shared frame for every section: a flourish that draws itself, the heading, optional text and
 * a body slot. `variant` sets the band: plain paper, a warmer alternate, or the deep theme band.
 */
import { computed } from 'vue'
import InvitationFlourish from '../art/InvitationFlourish.vue'
import { useDrawOnView } from '../composables/useDrawOnView'

const props = defineProps({
  /** Anchor id, also used to label the section. */
  id: { type: String, required: true },
  title: { type: String, default: null },
  text: { type: String, default: null },
  /** plain | alt | deep */
  variant: { type: String, default: 'plain' }
})

const root = useDrawOnView()
const deep = computed(() => props.variant === 'deep')
const band = computed(
  () => ({ plain: '', alt: 'bg-inv-surface-alt', deep: 'bg-inv-deep text-inv-surface' })[props.variant]
)
</script>

<template>
  <section
    :id="id"
    ref="root"
    :aria-labelledby="title ? `${id}-title` : undefined"
    :class="['relative overflow-hidden px-6 py-20 sm:py-24', band]"
  >
    <slot name="decor" />
    <div class="relative mx-auto max-w-2xl text-center">
      <InvitationFlourish :class="deep ? 'brightness-125' : ''" />
      <h2
        v-if="title"
        :id="`${id}-title`"
        class="mt-6 font-inv-heading text-3xl leading-tight text-balance sm:text-[2.5rem]"
      >
        {{ title }}
      </h2>
      <p
        v-if="text"
        :class="['mx-auto mt-4 max-w-prose text-lg text-pretty', deep ? 'text-inv-surface/80' : 'text-inv-ink-soft']"
      >
        {{ text }}
      </p>
      <div class="mt-10"><slot /></div>
    </div>
  </section>
</template>
