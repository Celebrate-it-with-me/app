<template>
  <section class="py-24 px-4 bg-gradient-to-br from-purple-50/30 via-white to-pink-50/30 dark:from-gray-900 dark:via-gray-800/50 dark:to-purple-900/20 relative overflow-hidden">
    <!-- Enhanced Background Elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full blur-3xl opacity-60 animate-pulse"></div>
      <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-l from-primary/10 to-secondary/10 rounded-full blur-3xl opacity-50 animate-pulse" style="animation-delay: 3s;"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-pink-200/10 to-purple-200/10 rounded-full blur-2xl opacity-40"></div>

      <!-- Floating camera icons -->
      <div class="absolute top-20 right-20 w-6 h-6 bg-primary/20 rounded-lg animate-bounce" style="animation-delay: 1s;">
        <svg class="w-full h-full text-primary/60" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="absolute bottom-32 left-16 w-4 h-4 bg-secondary/30 rounded-full animate-pulse" style="animation-delay: 2s;"></div>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto">
      <!-- Header Section -->
      <div class="text-center mb-20 animate-fadeIn">
        <div class="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20 backdrop-blur-sm mb-6">
          <Camera class="w-4 h-4 text-accent mr-2" />
          <span class="text-sm font-semibold text-accent">Gallery</span>
          <span class="text-sm text-gray-600 dark:text-gray-300">Real celebrations</span>
        </div>

        <CHeading :level="2" weight="bold" class="mb-6 text-4xl sm:text-5xl lg:text-6xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
          Inspiring Event
          <span class="block bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent">Gallery</span>
        </CHeading>
        <p class="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
          Discover breathtaking celebrations created by our community. Get inspired by
          <span class="font-semibold text-primary">real events</span> planned with our platform.
        </p>
      </div>

      <!-- Enhanced Gallery Carousel -->
      <div class="relative">
        <!-- Navigation Buttons -->
        <div class="absolute top-1/2 -left-4 sm:-left-6 transform -translate-y-1/2 z-20">
          <button
            @click="prevImage"
            class="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl hover:shadow-2xl border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Previous image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <div class="overflow-hidden rounded-3xl">
          <div
            class="flex transition-transform duration-700 ease-out"
            :style="{ transform: `translateX(-${currentIndex * (100 / visibleImages)}%)` }"
          >
            <div
              v-for="(image, index) in galleryImages"
              :key="index"
              :style="{ width: `${100 / visibleImages}%` }"
              class="px-3"
            >
              <div class="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <!-- Image with enhanced effects -->
                <div class="relative overflow-hidden">
                  <img
                    :src="image.src"
                    :alt="image.alt"
                    class="w-full object-cover h-72 sm:h-96 transition-all duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <!-- Gradient overlay -->
                  <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <!-- Floating badge -->
                  <div class="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-3 py-1 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                    <span class="text-xs font-semibold text-primary">View Details</span>
                  </div>
                </div>

                <!-- Enhanced caption -->
                <div class="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  <div class="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-2">{{ image.caption }}</h3>
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span class="text-sm text-gray-600 dark:text-gray-400">Recently planned</span>
                      </div>
                      <div class="flex items-center gap-1">
                        <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">4.9</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="absolute top-1/2 -right-4 sm:-right-6 transform -translate-y-1/2 z-20">
          <button
            @click="nextImage"
            class="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl hover:shadow-2xl border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Next image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- Enhanced Dots Indicator -->
        <div class="flex justify-center mt-8 gap-3">
          <button
            v-for="(_, index) in Math.ceil(galleryImages.length / visibleImages)"
            :key="index"
            @click="goToSlide(index)"
            :class="[
              'transition-all duration-300 focus:outline-none rounded-full',
              currentIndex === index
                ? 'w-8 h-3 bg-gradient-to-r from-primary to-secondary'
                : 'w-3 h-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 hover:scale-125'
            ]"
            :aria-label="`Go to slide ${index + 1}`"
          ></button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import CHeading from '@/components/UI/headings/CHeading.vue'
import { Camera } from 'lucide-vue-next'

// Gallery images data
const galleryImages = [
  {
    src: new URL('@/assets/images/external/gallery-1.jpg', import.meta.url).href,
    alt: "Quinceañera celebration with elegant decorations",
    caption: "Elegant Quinceañera Celebration"
  },
  {
    src: new URL('@/assets/images/external/gallery-2.jpg', import.meta.url).href,
    alt: "Sweet 16 party with friends and family",
    caption: "Memorable Sweet 16 Party"
  },
  {
    src: new URL('@/assets/images/external/gallery-3.jpg', import.meta.url).href,
    alt: "Wedding reception with beautiful floral arrangements",
    caption: "Romantic Wedding Reception"
  },
  {
    src: new URL('@/assets/images/external/gallery-1.jpg', import.meta.url).href,
    alt: "Birthday party with colorful decorations",
    caption: "Colorful Birthday Celebration"
  },
  {
    src: new URL('@/assets/images/external/gallery-2.jpg', import.meta.url).href,
    alt: "Anniversary celebration with elegant setup",
    caption: "Elegant Anniversary Event"
  }
]

// Responsive visible images
const windowWidth = ref(window.innerWidth)
const currentIndex = ref(0)

const visibleImages = computed(() => {
  if (windowWidth.value < 640) return 1 // Mobile: 1 image
  if (windowWidth.value < 1024) return 2 // Tablet: 2 images
  return 3 // Desktop: 3 images
})

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth
}

const nextImage = () => {
  const maxIndex = Math.ceil(galleryImages.length / visibleImages.value) - 1
  currentIndex.value = currentIndex.value >= maxIndex ? 0 : currentIndex.value + 1
}

const prevImage = () => {
  const maxIndex = Math.ceil(galleryImages.length / visibleImages.value) - 1
  currentIndex.value = currentIndex.value <= 0 ? maxIndex : currentIndex.value - 1
}

const goToSlide = (index) => {
  currentIndex.value = index
}

onMounted(() => {
  window.addEventListener('resize', updateWindowWidth)

  // Auto-advance the gallery every 5 seconds
  const interval = setInterval(() => {
    nextImage()
  }, 5000)

  // Clean up
  return () => {
    window.removeEventListener('resize', updateWindowWidth)
    clearInterval(interval)
  }
})
</script>
