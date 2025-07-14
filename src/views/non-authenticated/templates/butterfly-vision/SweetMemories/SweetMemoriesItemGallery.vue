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
    class="image_container"
    :data-sub-html="galleryItem.subHtml"
  >
    <div class="image-wrapper">
      <img
        :src="galleryItem.thumb"
        :alt="galleryItem.title"
        class="memory-image"
      />
    </div>
  </a>
</template>

<style scoped>
.image_container {
  width: 150px;
  height: 150px;
  margin: 8px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
}

.image-wrapper {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.memory-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  transition: transform 0.3s ease;
}

.image_container:hover .image-wrapper {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.image_container:hover .memory-image {
  transform: scale(1.05);
}

@media screen and (min-width: 768px) {
  .image_container {
    width: 250px;
    height: 250px;
  }
}

@media screen and (max-width: 640px) {
  .image_container {
    width: 100%;
    max-width: 300px;
    height: 200px;
  }
}
</style>
