<script setup>
import {onMounted, ref} from "vue";
import {CWM_API} from "@/services/axios";
import {useRoute} from "vue-router";
import { Splide, SplideSlide } from '@splidejs/vue-splide';
import '@splidejs/splide/dist/css/splide.min.css';


const route = useRoute();

const images = ref([]);
const activeImage = ref({});
const loadingImages = ref(false);
const name = ref(route.params.name);
const options = ref({
  type: 'slide',
  perPage: 3,
  perMove: 1,
  pagination: false
});

onMounted(() => {
  getGalleryImages();
});

const getGalleryImages = async () => {
  loadingImages.value = true;
  try {
    const response = await CWM_API.post(`gallery/show-images/${name.value}`)
    const { data } = response;

    images.value = data.data ?? [];
    if (images.value.length) {
      setActiveImage();
    }

  } catch (error) {
    console.log(error)
  } finally {
    loadingImages.value = true;
  }
}

const setActiveImage = (id = null) => {
  if (!id) {
    activeImage.value = images.value[0];
  } else {
    let imageTemp = null;
    imageTemp = images.value.find((img) => img.id === id)

    if (imageTemp) {
      activeImage.value = imageTemp
    }
  }
}

</script>

<template>
  <div class="gallery-wrapper">
    <div v-if="activeImage" class="active-image">
      <img :src="activeImage.url" alt="activeImage.title">
    </div>
    <!-- This is the thumbnail slider -->
    <div class="carousel-container">
      <splide
          class="thumbnail-slider"
          :options="options"
      >
        <splide-slide v-for="(image, index) in images" :key="index">
          <img
              :src="image.thumbnail"
              :alt="image.title"
              @click="setActiveImage(image.id)"
          />
        </splide-slide>
      </splide>
    </div>
  </div>
</template>

<style scoped>
.gallery-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.active-image {
  padding: 12px;
  flex: 75%;
  margin-bottom: 10px;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(1.10) contrast(1.20) saturate(1.30);
  }
}

.thumbnail-slider {
  flex: 15%
}

.carousel-container{
  padding: 12px;
}

.splide__slide {
  /* Add space between slide items. Adjust as per need */
  margin-right: 8px;
  margin-left: 8px;
}

.splide__track {
  /* Adding Padding inside the carousel. Adjust as per need */
  padding: 15px;
}
</style>
