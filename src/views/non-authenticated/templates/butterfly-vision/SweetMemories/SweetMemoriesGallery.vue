<script setup lang="ts">
import LightGallery from 'lightgallery/vue'
import lgThumbnail from 'lightgallery/plugins/thumbnail'
import lgZoom from 'lightgallery/plugins/zoom'

import 'lightgallery/css/lightgallery.css'
import 'lightgallery/css/lg-thumbnail.css'
import 'lightgallery/css/lg-zoom.css'

// If you are using scss you can skip the css imports below and use scss instead
import styles from 'lightgallery/scss/lightgallery.scss'
import SweetMemoriesItemGallery from '@/views/non-authenticated/templates/butterfly-vision/SweetMemories/SweetMemoriesItemGallery.vue'

defineProps({
  memories: {
    type: Array,
    required: true
  }
})

const plugins = [lgThumbnail, lgZoom]

const onInit = () => {
  console.log('lightGallery has been initialized')
}

const onBeforeSlide = () => {
  console.log('calling before slide')
}

const gallerySettings = {
  speed: 500,
  plugins: plugins,
  thumbnail: true,
  showThumbByDefault: true,
  allowMediaOverlap: false,
  toggleThumb: true,
  licenseKey: 'your-license-key',
  download: false,
  counter: true,
  subHtmlSelectorRelative: true,
  appendSubHtmlTo: '.lg-item',
  mousewheel: true
}
</script>

<template>
  <div class="gallery-container">
    <LightGallery
      :settings="gallerySettings"
      class="sweet-memories-content flex flex-wrap items-center justify-center gap-6"
      @on-init="onInit"
      @on-before-slide="onBeforeSlide"
    >
      <SweetMemoriesItemGallery
        v-for="(item, index) in memories"
        :key="index"
        :gallery-item="item"
      />
    </LightGallery>
  </div>
</template>
