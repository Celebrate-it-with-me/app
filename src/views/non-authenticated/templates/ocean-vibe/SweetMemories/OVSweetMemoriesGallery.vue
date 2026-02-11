<script setup lang="ts">
import { computed } from 'vue'
import LightGallery from 'lightgallery/vue'
import lgThumbnail from 'lightgallery/plugins/thumbnail'
import lgZoom from 'lightgallery/plugins/zoom'

import 'lightgallery/css/lightgallery.css'
import 'lightgallery/css/lg-thumbnail.css'
import 'lightgallery/css/lg-zoom.css'

// If you are using scss you can skip the css imports below and use scss instead
import OVSweetMemoriesItemGallery from '@/views/non-authenticated/templates/ocean-vibe/SweetMemories/OVSweetMemoriesItemGallery.vue'

defineProps({
  memories: {
    type: Array,
    required: true
  }
})

const getItemClass = () => {
  return 'row-span-1'
}

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
  <div class="gallery-container px-4">
    <LightGallery
      :settings="gallerySettings"
      class="sweet-memories-content grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto"
      @on-init="onInit"
      @on-before-slide="onBeforeSlide"
    >
      <OVSweetMemoriesItemGallery
        v-for="(item, index) in memories"
        :key="index"
        :gallery-item="item"
        :class="getItemClass()"
      />
    </LightGallery>
  </div>
</template>
