<script setup lang="ts">
defineProps({
  galleryItem: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <a
    key="image1"
    :href="galleryItem.image"
    class="image_container w-[150px] h-[150px]"
    :data-sub-html="galleryItem.subHtml"
  >
    <img :src="galleryItem.thumb" :alt="galleryItem.title" class="rounded" />
  </a>
</template>

<style scoped>
.image_container {
  width: 150px;
  height: 150px;
}

@media screen and (min-width: 768px) {
  .image_container {
    width: 250px;
    height: 250px;
  }
}
</style>
