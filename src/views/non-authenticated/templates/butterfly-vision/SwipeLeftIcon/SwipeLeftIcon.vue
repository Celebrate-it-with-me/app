<script setup>
import SwipeLeft from '@/assets/images/Swipe/swipe-left.gif'

</script>

<template>
  <div class="swipe-left fixed w-36 h-36 left-5">
    <img :src="SwipeLeft" alt="Swipe Left" class="w-1/2 h-auto rounded-lg" />
  </div>
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
