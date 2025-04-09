<script setup lang="ts">
import LightGallery from 'lightgallery/vue'
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';

import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-thumbnail.css';
import 'lightgallery/css/lg-zoom.css';

// If you are using scss you can skip the css imports below and use scss instead
import styles from 'lightgallery/scss/lightgallery.scss';
import SweetMemoriesItemGallery
  from '@/views/non-authenticated/templates/butterfly-vision/SweetMemories/SweetMemoriesItemGallery.vue'

defineProps({
  memories: {
    type: Array,
    required: true
  }
})

const plugins = [lgThumbnail, lgZoom]

const onInit = () => {
  console.log('lightGallery has been initialized');
}

const onBeforeSlide = () => {
  console.log('calling before slide');
}

</script>

<template>
<LightGallery
  :settings="{ speed: 500, plugins: plugins }"
  @onInit="onInit"
  @onBeforeSlide="onBeforeSlide"
  class="sweet-memories-content flex flex-wrap items-center justify-center gap-6"
>
  <SweetMemoriesItemGallery
    v-for="(item, index) in memories"
    :gallery-item="item"
    :key="index"
  />
</LightGallery>
</template>
