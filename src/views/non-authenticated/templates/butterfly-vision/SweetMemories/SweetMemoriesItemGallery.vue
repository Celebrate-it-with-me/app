<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  galleryItem: {
    type: Object,
    required: true
  }
})

const imageUrl = computed(() => props.galleryItem.image)

const thumb = computed(() => props.galleryItem.thumb)

</script>

<template>
  <a
    key="image1"
    :href="imageUrl"
    class="w-[150px] h-[150px]"
  >
    <img
      :src="thumb"
      alt="Thumbnail 1"
      class="rounded"
    />
  </a>
</template>

<style scoped>

</style>
