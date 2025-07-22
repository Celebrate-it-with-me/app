<script setup lang="ts">
import LightGallery from 'lightgallery/vue'
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-thumbnail.css';
import 'lightgallery/css/lg-zoom.css';

// If you are using scss you can skip the css imports below and use scss instead
import styles from 'lightgallery/scss/lightgallery.scss';
import SweetMemoriesItemGallery
  from '@/views/non-authenticated/templates/butterfly-vision/SweetMemories/SweetMemoriesItemGallery.vue'

const props = defineProps({
  memories: {
    type: Array,
    required: true
  }
})

// State management for gallery pagination
const currentPage = ref(0);
const itemsPerPage = ref(3);
const isHovering = ref(false);
const windowWidth = ref(window.innerWidth);

// Update itemsPerPage based on screen size
const updateItemsPerPage = () => {
  windowWidth.value = window.innerWidth;
  if (windowWidth.value < 640) {
    itemsPerPage.value = 1;
  } else if (windowWidth.value < 768) {
    itemsPerPage.value = 2;
  } else {
    itemsPerPage.value = 3;
  }
};

// Set up resize listener
onMounted(() => {
  updateItemsPerPage();
  window.addEventListener('resize', updateItemsPerPage);
});

// Clean up event listener
onUnmounted(() => {
  window.removeEventListener('resize', updateItemsPerPage);
});

// Compute total number of pages
const totalPages = computed(() => {
  if (!props.memories || props.memories.length === 0) return 0;
  return Math.ceil(props.memories.length / itemsPerPage.value);
});

// Compute current visible items
const visibleItems = computed(() => {
  const start = currentPage.value * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  const items = props.memories.slice(start, end);
  return items;
});

// Navigation methods
const nextPage = () => {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--;
  }
};

// Check if buttons should be disabled
const isPrevDisabled = computed(() => currentPage.value === 0);
const isNextDisabled = computed(() => currentPage.value >= totalPages.value - 1);

// Handle mouse events for desktop hover effect
const handleMouseEnter = () => {
  isHovering.value = true;
};

const handleMouseLeave = () => {
  isHovering.value = false;
};

// Reset to first page when memories change
watch(() => props.memories, () => {
  currentPage.value = 0;
}, { deep: true });

// LightGallery configuration
const plugins = [lgThumbnail, lgZoom]

const onInit = () => {
  console.log('lightGallery has been initialized');
}

const onBeforeSlide = () => {
  console.log('calling before slide');
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
  <div
    class="gallery-container relative"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Navigation buttons -->
    <button
      @click="prevPage"
      :disabled="isPrevDisabled"
      :class="[
        'nav-button prev-button',
        { 'hidden md:block': !isHovering && !isPrevDisabled },
        { 'opacity-50 cursor-not-allowed': isPrevDisabled }
      ]"
      aria-label="Previous images"
    >
      <span class="sr-only">Previous</span>
      <ChevronLeft class="w-7 h-7 text-gray-800" />
    </button>

    <!-- Gallery content with transition -->
    <div class="overflow-hidden">
      <transition-group name="fade" tag="div" class="transition-all duration-500 ease-in-out">
        <LightGallery
          :key="currentPage"
          :settings="gallerySettings"
          @onInit="onInit"
          @onBeforeSlide="onBeforeSlide"
          class="sweet-memories-content flex flex-wrap items-center justify-center gap-6"
        >
          <SweetMemoriesItemGallery
            v-for="(item, index) in visibleItems"
            :gallery-item="item"
            :key="`page-${currentPage}-item-${index}`"
          />
        </LightGallery>
      </transition-group>
    </div>

    <!-- Next button -->
    <button
      @click="nextPage"
      :disabled="isNextDisabled"
      :class="[
        'nav-button next-button',
        { 'hidden md:block': !isHovering && !isNextDisabled },
        { 'opacity-50 cursor-not-allowed': isNextDisabled }
      ]"
      aria-label="Next images"
    >
      <span class="sr-only">Next</span>
      <ChevronRight class="w-7 h-7 text-gray-800" />
    </button>

    <!-- Pagination indicator -->
    <div class="pagination-indicator mt-4 text-center">
      <span v-for="page in totalPages" :key="page"
        :class="['pagination-dot', { 'active': page - 1 === currentPage }]">
      </span>
    </div>
  </div>
</template>

<style scoped>
.gallery-container {
  position: relative;
  padding: 1rem;
  width: 100%;
}

/* Navigation buttons styling */
.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.nav-button:hover {
  background-color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.prev-button {
  left: 0;
}

.next-button {
  right: 0;
}

/* Pagination indicator styling */
.pagination-indicator {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 1rem;
}

.pagination-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.2);
  display: inline-block;
  transition: all 0.3s ease;
}

.pagination-dot.active {
  background-color: rgba(0, 0, 0, 0.6);
  transform: scale(1.2);
}

/* Fade transition effect */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .nav-button {
    display: flex !important; /* Always visible on mobile */
    width: 36px;
    height: 36px;
  }

  .prev-button {
    left: -5px;
  }

  .next-button {
    right: -5px;
  }
}

@media (max-width: 640px) {
  .sweet-memories-content {
    justify-content: center;
  }
}
</style>
