<script setup>
import { useRoute } from 'vue-router'
import { FwbButton } from 'flowbite-vue'
import { computed, ref } from 'vue'

const route = useRoute()

const name = ref(route.params.name)

const viewGalleryLink = computed(() => {
  return `/view-gallery/${name.value}`
})

const uploadImageLink = computed(() => {
  return `/upload-image/${name.value}`
})
</script>

<template>
  <main class="images-main">
    <div class="action-buttons-container">
      <div class="action-buttons">
        <router-link :to="viewGalleryLink">
          <fwb-button size="sm" class="image-btn"> View Gallery </fwb-button>
        </router-link>
        <router-link :to="uploadImageLink">
          <fwb-button size="sm" class="image-btn"> Upload Images </fwb-button>
        </router-link>
      </div>
    </div>
  </main>
</template>

<style scoped>
.images-main {
  background: url('../../public/images/bg4.webp') no-repeat center;
  background-size: cover;

  @media (max-width: 600px) {
    background: url('../../public/images/bg4.webp') no-repeat -360px center;
    background-size: cover;
  }
}
.action-buttons-container {
  display: flex;
  justify-content: center;
  height: 100vh;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
  align-items: center;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.image-btn {
  background: url('../../public/images/img.png');
  width: 125px;
  height: 50px;
  border: none;
}
</style>
