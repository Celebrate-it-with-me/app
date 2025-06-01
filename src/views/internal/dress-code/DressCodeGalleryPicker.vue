<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['selected'])

const fallbackImages = {
  formal: [
    'https://images.unsplash.com/photo-1593032465171-8e4f3b1c5e4c?w=512&h=512&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1602810318664-d1c0842db9e9?w=512&h=512&fit=crop&auto=format'
  ],
  'semi-formal': [
    'https://images.unsplash.com/photo-1583225151808-65ee7b7c7a0e?w=512&h=512&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1533674689012-b93f34f1b6cd?w=512&h=512&fit=crop&auto=format'
  ],
  casual: [
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=512&h=512&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1521334884684-d80222895322?w=512&h=512&fit=crop&auto=format'
  ],
  thematic: [
    'https://images.unsplash.com/photo-1603349206294-37141d546af4?w=512&h=512&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1597633610907-94714a0f59a4?w=512&h=512&fit=crop&auto=format'
  ],
  'black-tie': [
    'https://images.unsplash.com/photo-1520975661595-6453be3f7070?w=512&h=512&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1602810318664-d1c0842db9e9?w=512&h=512&fit=crop&auto=format'
  ]
}


const images = computed(() => fallbackImages[props.type] ?? [])
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <div
      v-for="(image, index) in images"
      :key="index"
      class="relative group overflow-hidden rounded-md shadow-md cursor-pointer"
      @click="emit('selected', image)"
    >
      <img
        :src="image"
        alt="Reference"
        class="w-full h-48 object-cover transition-transform duration-200 group-hover:scale-105"
      />
    </div>
  </div>
</template>
