<template>
  <div v-if="images.length" :class="['relative w-full', width, 'mx-auto select-none']">
    <!-- Imagen -->
    <div
      :class="['overflow-hidden rounded-lg shadow-md relative', height]"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
    >
      <Transition :name="transitionEffect" mode="out-in">
        <img
          :key="images[currentPhoto]"
          :src="images[currentPhoto]"
          alt="Carousel Photo"
          class="object-cover w-full h-full"
        />
      </Transition>
    </div>

    <!-- Arrows -->
    <template v-if="showArrows && images.length > 1">
      <button
        @click="prevPhoto"
        class="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow hover:bg-gray-100"
      >
        <ChevronLeft class="w-5 h-5" />
      </button>

      <button
        @click="nextPhoto"
        class="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow hover:bg-gray-100"
      >
        <ChevronRight class="w-5 h-5" />
      </button>
    </template>

    <!-- Dots -->
    <div v-if="showDots && images.length > 1" class="flex justify-center mt-4 space-x-2">
      <button
        v-for="(photo, index) in images"
        :key="index"
        @click="goToPhoto(index)"
        :class="[
          'w-2.5 h-2.5 rounded-full',
          currentPhoto === index ? 'bg-primary' : 'bg-gray-300'
        ]"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps({
  images: {
    type: Array,
    required: true,
  },
  width: {
    type: String,
    default: 'max-w-3xl',
  },
  height: {
    type: String,
    default: 'h-64',
  },
  autoplay: {
    type: Boolean,
    default: false,
  },
  autoplayDelay: {
    type: Number,
    default: 5000, // 5 seconds
  },
  showDots: {
    type: Boolean,
    default: true,
  },
  showArrows: {
    type: Boolean,
    default: true,
  },
  transitionEffect: {
    type: String,
    default: 'fade', // Could be 'fade' or 'slide' (future)
  },
})

const currentPhoto = ref(0)
const autoplayInterval = ref(null)

const touchStartX = ref(0)
const touchEndX = ref(0)

const prevPhoto = () => {
  currentPhoto.value = currentPhoto.value === 0
    ? props.images.length - 1
    : currentPhoto.value - 1
}

const nextPhoto = () => {
  currentPhoto.value = currentPhoto.value === props.images.length - 1
    ? 0
    : currentPhoto.value + 1
}

const goToPhoto = (index) => {
  currentPhoto.value = index
}

// Swipe handlers
const handleTouchStart = (e) => {
  touchStartX.value = e.changedTouches[0].screenX
}

const handleTouchEnd = (e) => {
  touchEndX.value = e.changedTouches[0].screenX
  handleSwipe()
}

const handleSwipe = () => {
  const swipeDistance = touchStartX.value - touchEndX.value
  if (swipeDistance > 50) {
    nextPhoto()
  } else if (swipeDistance < -50) {
    prevPhoto()
  }
}

// Autoplay
onMounted(() => {
  if (props.autoplay) {
    autoplayInterval.value = setInterval(() => {
      nextPhoto()
    }, props.autoplayDelay)
  }
})

onUnmounted(() => {
  if (autoplayInterval.value) {
    clearInterval(autoplayInterval.value)
  }
})

// Reset current photo if images change
watch(() => props.images, () => {
  currentPhoto.value = 0
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
