<script setup lang="ts">
import { ZoomIn } from 'lucide-vue-next';

const props = defineProps({
  galleryItem: {
    type: Object,
    required: true
  }
})

console.log('SweetMemoriesItemGallery - galleryItem:', props.galleryItem);

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
      <div class="click-overlay">
        <span class="click-text">Haz clic para ampliar</span>
      </div>
      <div class="mobile-indicator">
        <ZoomIn class="zoom-icon" size="14" />
        <span>Ampliar</span>
      </div>
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

.click-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 12px;
}

.click-text {
  color: white;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 4px;
}

.image_container:hover .click-overlay {
  opacity: 1;
}

@media screen and (min-width: 768px) {
  .image_container {
    width: 250px;
    height: 250px;
  }
}

/* Medium-sized devices (tablets) */
@media screen and (min-width: 641px) and (max-width: 767px) {
  .image_container {
    width: 200px;
    height: 200px;
  }
}

/* Mobile indicator styling */
.mobile-indicator {
  position: absolute;
  bottom: 15px;
  right: 15px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 500;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 4px;
  display: none; /* Hidden by default */
}

.zoom-icon {
  stroke-width: 2.5;
}

/* Small devices (phones) */
@media screen and (max-width: 640px) {
  .image_container {
    width: 100%;
    max-width: 300px;
    height: 200px;
    position: relative;
  }

  .click-text {
    font-size: 12px;
    padding: 6px;
  }

  /* Show mobile indicator on phones */
  .mobile-indicator {
    display: flex;
  }
}
</style>
