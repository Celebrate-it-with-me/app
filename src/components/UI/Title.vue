<script setup>
  const props = defineProps({
    classes: {
      type: String,
      required: false,
      default: "text-4xl md:text-6xl font-bold leading-tight mb-6"
    },
    level: {
      type: String,
      default: 'h1',
      validator: (value) => ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(value)
    }
  })
</script>

<template>
  <component
    :is="level"
    :class="classes"
    v-bind="$attrs"
  >
    <slot />
  </component>
</template>

<style scoped>

</style>
