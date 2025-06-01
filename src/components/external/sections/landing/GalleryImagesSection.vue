<template>
  <section
    class="py-half px-4 bg-gradient-to-b from-white to-pink-50 dark:from-gray-900 dark:to-gray-800"
  >
    <div class="max-w-7xl mx-auto text-center mb-12 animate-fadeIn">
      <CHeading :level="2" weight="bold" class="mb-2"> Inspiring Event Gallery </CHeading>
      <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        See how others have created their perfect celebrations
      </p>
    </div>

    <div class="max-w-7xl mx-auto relative">
      <!-- Gallery Controls -->
      <div class="absolute top-1/2 -left-4 sm:left-0 transform -translate-y-1/2 z-10">
        <button
          class="bg-white dark:bg-gray-800 rounded-full p-2 shadow-md hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500"
          aria-label="Previous image"
          @click="prevImage"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-gray-700 dark:text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      <div class="overflow-hidden px-4">
        <div
          class="flex transition-transform duration-500 ease-in-out"
          :style="{ transform: `translateX(-${currentIndex * (100 / visibleImages)}%)` }"
        >
          <div
            v-for="(image, index) in galleryImages"
            :key="index"
            :style="{ width: `${100 / visibleImages}%` }"
            class="px-2"
          >
            <div
              class="relative group overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
            >
              <img
                :src="image.src"
                :alt="image.alt"
                class="w-full object-cover h-64 sm:h-80 transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end"
              >
                <p class="text-white p-4 font-medium">{{ image.caption }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="absolute top-1/2 -right-4 sm:right-0 transform -translate-y-1/2 z-10">
        <button
          class="bg-white dark:bg-gray-800 rounded-full p-2 shadow-md hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500"
          aria-label="Next image"
          @click="nextImage"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-gray-700 dark:text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <!-- Dots Indicator -->
      <div class="flex justify-center mt-6 gap-2">
        <button
          v-for="(_, index) in Math.ceil(galleryImages.length / visibleImages)"
          :key="index"
          :class="[
            'w-2 h-2 rounded-full transition-all duration-300 focus:outline-none',
            currentIndex === index
              ? 'bg-primary w-4'
              : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
          ]"
          :aria-label="`Go to slide ${index + 1}`"
          @click="goToSlide(index)"
        ></button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import CHeading from '@/components/UI/headings/CHeading.vue'

// Gallery images data
const galleryImages = [
  {
    src: new URL('@/assets/images/external/gallery-1.jpg', import.meta.url).href,
    alt: 'Quinceañera celebration with elegant decorations',
    caption: 'Elegant Quinceañera Celebration'
  },
  {
    src: new URL('@/assets/images/external/gallery-2.jpg', import.meta.url).href,
    alt: 'Sweet 16 party with friends and family',
    caption: 'Memorable Sweet 16 Party'
  },
  {
    src: new URL('@/assets/images/external/gallery-3.jpg', import.meta.url).href,
    alt: 'Wedding reception with beautiful floral arrangements',
    caption: 'Romantic Wedding Reception'
  },
  {
    src: new URL('@/assets/images/external/gallery-1.jpg', import.meta.url).href,
    alt: 'Birthday party with colorful decorations',
    caption: 'Colorful Birthday Celebration'
  },
  {
    src: new URL('@/assets/images/external/gallery-2.jpg', import.meta.url).href,
    alt: 'Anniversary celebration with elegant setup',
    caption: 'Elegant Anniversary Event'
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

const goToSlide = index => {
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
