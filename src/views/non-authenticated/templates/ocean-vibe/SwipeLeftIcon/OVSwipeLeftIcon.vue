<script setup>
import SwipeLeft from '@/assets/images/Swipe/swipe-left.gif'
import { onMounted, onUnmounted, ref } from 'vue'

const showSwipe = ref(true)
let scrollContainer = null

const handleScroll = () => {
  const scrollY = scrollContainer?.scrollTop ?? 0
  showSwipe.value = scrollY <= 200
}

onMounted(() => {
  scrollContainer = document.querySelector('main')
  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', handleScroll)
    handleScroll()
  }
})

onUnmounted(() => {
  if (scrollContainer) {
    scrollContainer.removeEventListener('scroll', handleScroll)
  }
})
</script>

<template>
  <transition name="fade">
    <div v-if="showSwipe" class="swipe-left fixed w-36 h-36 left-5 z-50">
      <img :src="SwipeLeft" alt="Swipe Left" class="w-1/2 h-auto rounded-lg" />
    </div>
  </transition>
</template>

<style scoped>
.swipe-left {
  bottom: -30px;
  left: 0;
}

.swipe-left img {
  transform: rotate(90deg);
}
</style>
