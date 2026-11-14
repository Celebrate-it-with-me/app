<script setup>
import { computed, ref } from 'vue'
import { cx, initials, avatarTone } from './utils'

const props = defineProps({
  name: { type: String, default: '' },
  src: { type: String, default: '' },
  /** Text for the photo; the name when omitted. Ignored while the initials show. */
  alt: { type: String, default: '' },
  /** sm | md | lg | xl */
  size: { type: String, default: 'md' }
})

const SIZES = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg', xl: 'h-20 w-20 text-2xl' }
const failed = ref(false)
const showImage = computed(() => props.src && !failed.value)
</script>

<template>
  <span
    :class="
      cx(
        'inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full font-semibold',
        SIZES[size] ?? SIZES.md,
        !showImage && avatarTone(name)
      )
    "
    :title="name"
    :role="showImage ? undefined : 'img'"
    :aria-label="showImage ? undefined : name"
  >
    <img
      v-if="showImage"
      :src="src"
      :alt="alt || name"
      width="80"
      height="80"
      loading="lazy"
      decoding="async"
      class="h-full w-full rounded-full object-cover"
      @error="failed = true"
    />
    <span v-else aria-hidden="true">{{ initials(name) }}</span>
  </span>
</template>
