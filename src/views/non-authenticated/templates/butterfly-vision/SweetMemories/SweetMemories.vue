<script setup>
import { computed } from 'vue'
import SweetMemoriesGallery
  from '@/views/non-authenticated/templates/butterfly-vision/SweetMemories/SweetMemoriesGallery.vue'

const sweetMemories = computed(() => {
  return {
    backgroundColor: '#ffe2b1',
    isEnabled: true,
    title: 'Sweet Memories',
    subTitle: 'Little Moments, Big Memories',
    memoriesPhotos: [
      {
        image: 'http://dev.api.cwm.com/storage/images/sweet-memories/images/1234123.jpg',
        thumb: 'http://dev.api.cwm.com/storage/images/sweet-memories/thumbnails/1234123_thumb.jpg'
      },
      {
        image: 'http://dev.api.cwm.com/storage/images/sweet-memories/images/1234123.jpg',
        thumb: 'http://dev.api.cwm.com/storage/images/sweet-memories/thumbnails/1234123_thumb.jpg'
      },
      {
        image: 'http://dev.api.cwm.com/storage/images/sweet-memories/images/1234123.jpg',
        thumb: 'http://dev.api.cwm.com/storage/images/sweet-memories/thumbnails/1234123_thumb.jpg'
      },
      {
        image: 'http://dev.api.cwm.com/storage/images/sweet-memories/images/1234123.jpg',
        thumb: 'http://dev.api.cwm.com/storage/images/sweet-memories/thumbnails/1234123_thumb.jpg'
      },
      {
        image: 'http://dev.api.cwm.com/storage/images/sweet-memories/images/1234123.jpg',
        thumb: 'http://dev.api.cwm.com/storage/images/sweet-memories/thumbnails/1234123_thumb.jpg'
      },
    ]
  }
})

const generalStyles = computed(() => {
  let styles = {}

  if (sweetMemories.value.backgroundColor) {
    styles.backgroundColor = sweetMemories.value.backgroundColor
    //styles.backgroundImage = `url(${saveTheDate.value?.imageUrl})`
  }

  return styles
})

</script>

<template>
  <div
    v-if="sweetMemories?.isEnabled"
    class="sweet-memories w-full h-full flex flex-col justify-evenly items-center p-20 h-screen"
    :style="generalStyles"
  >
    <div class="sweet-titles">
      <h2 class="text-6xl font-gvibes font-bold gap-10 gradient-text" v-if="sweetMemories.title">
        {{ sweetMemories.title }}
      </h2>

      <h4
        class="relative text-2xl font-normal text-gray-600/70 text-center moments-title"
      >
        {{ sweetMemories.subTitle }}
      </h4>
    </div>

    <SweetMemoriesGallery
      :memories="sweetMemories.memoriesPhotos"
    />
  </div>
</template>

<style scoped>
.sweet-memories {
  background-repeat: repeat;
  background-size: auto;
  background-blend-mode: overlay;
  padding: 20px;
}


.moments-title::before {
  position: absolute;
  left: 50%;
  -webkit-transform: translateX(-50%);
  transform: translateX(-50%);
  bottom: -20px;
  width: 70%;
  height: 1px;
  content: "";
  background: #fdeab2;
}

.moments-title::after {
  position: absolute;
  left: 50%;
  -webkit-transform: translateX(-50%);
  transform: translateX(-50%);
  bottom: -10px;
  width: 100%;
  height: 1px;
  content: "";
  background: #fdeab2;
}

.lg-react-element {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
}
</style>
