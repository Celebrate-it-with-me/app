<script setup>
import { computed } from 'vue'
import { cx } from './utils'

/**
 * The container of a panel screen. Every screen uses the whole column of the layout, and the title
 * always starts at the same x (it never centers), so moving between modules does not make the heading jump.
 */
const classes = computed(() => cx('w-full'))
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>
