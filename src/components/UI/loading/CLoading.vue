<template>
  <div class="flex flex-col items-center justify-center gap-2 p-6">
    <Loader :class="`animate-spin size-${size} text-primary`" />
    <span
      class="text-gray-600 dark:text-gray-300"
      :class="textSize"
    >Loading...</span>
  </div>
</template>

<script setup>
import { Loader } from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: Number,
    default: 6
  }
})

const sizeToTextClassMap = [
  { maxSize: 6, class: 'text-sm' },
  { maxSize: 12, class: 'text-base' },
  { maxSize: 18, class: 'text-lg' },
  { maxSize: 24, class: 'text-xl' },
  { maxSize: 30, class: 'text-2xl' },
  { maxSize: Infinity, class: 'text-3xl' }
]

const getTextClass = (size) => {
  const matched = sizeToTextClassMap.find(item => size <= item.maxSize);
  return matched ? matched.class : 'text-3xl'
}

const textSize = computed(() => getTextClass(props.size))

</script>
