<script setup lang="ts">
import { computed } from 'vue'
import LightGallery from 'lightgallery/vue'
import lgThumbnail from 'lightgallery/plugins/thumbnail'
import lgZoom from 'lightgallery/plugins/zoom'

import 'lightgallery/css/lightgallery.css'
import 'lightgallery/css/lg-thumbnail.css'
import 'lightgallery/css/lg-zoom.css'
import HNSweetMemoriesItemGallery
  from '@/views/non-authenticated/templates/habana-nights/SweetMemories/HNSweetMemoriesItemGallery.vue'

// If you are using scss you can skip the css imports below and use scss instead

const props = defineProps({
  memories: {
    type: Array,
    required: true
  }
})

const isMosaic = computed(() => props.memories.length >= 5)

const getItemClass = index => {
  if (isMosaic.value && index === 0) {
    return 'lg:col-span-2 lg:row-span-2 aspect-[16/10] lg:aspect-auto'
  }
  return 'aspect-[4/3]'
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
  <div class="gallery-container">
    <LightGallery
      :settings="gallerySettings"
      class="sweet-memories-content grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto"
      @on-init="onInit"
      @on-before-slide="onBeforeSlide"
    >
      <HNSweetMemoriesItemGallery
        v-for="(item, index) in memories"
        :key="index"
        :gallery-item="item"
        :class="getItemClass(index)"
      />
    </LightGallery>
  </div>
</template>
