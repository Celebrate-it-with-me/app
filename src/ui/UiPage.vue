<script setup>
import { computed } from 'vue'
import { cx } from './utils'

/**
 * The container of a panel screen. The title always starts at the same x on every screen (it never centers),
 * so moving between modules does not make the heading jump. `width` only decides how far the content may stretch:
 * - `form`: a single column of fields (2xl).
 * - `default`: lists and cards (3xl).
 * - `wide`: tables and grids; the whole column of the layout.
 */
const props = defineProps({
  width: { type: String, default: 'default', validator: value => ['form', 'default', 'wide'].includes(value) }
})

const WIDTHS = { form: 'max-w-2xl', default: 'max-w-3xl', wide: '' }
const classes = computed(() => cx('w-full', WIDTHS[props.width]))
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>
