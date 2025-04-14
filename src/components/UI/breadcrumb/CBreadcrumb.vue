<template>
  <nav class="text-sm text-gray-700 dark:text-gray-300" aria-label="Breadcrumb">
    <ol class="inline-flex items-center space-x-1 md:space-x-2">
      <li v-for="(item, index) in items" :key="index" class="inline-flex items-center">
        <span
          v-if="index !== 0"
          class="mx-1 text-gray-400 dark:text-gray-500"
        >/</span>
        <component
          :is="item.href ? 'a' : 'span'"
          :href="item.href"
          :class="[
            'inline-flex items-center gap-1',
            item.href ? 'text-primary hover:underline' : 'font-semibold text-gray-900 dark:text-white'
          ]"
        >
          <slot :name="`icon-${index}`" />
          {{ item.label }}
        </component>
      </li>
    </ol>
  </nav>
</template>

<script setup>
const props = defineProps({
  items: {
    type: Array,
    required: true
    // Format: [{ label: 'Home', href: '/' }, { label: 'Events' }]
  }
})
</script>

<style scoped>
/* Breadcrumb-specific styles if needed */
</style>
