<script setup lang="ts">
defineProps({
  galleryItem: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <a
    :href="galleryItem.image"
    class="relative block overflow-hidden rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-500 group bg-white"
    :data-sub-html="galleryItem.subHtml"
  >
    <div class="w-full h-full overflow-hidden relative">
      <img
        :src="galleryItem.thumb"
        :alt="galleryItem.title"
        class="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-[1.03] will-change-transform transform-gpu"
      />
      <!-- Hover Overlay -->
      <div
        class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      ></div>

      <!-- Expand Icon -->
      <div
        class="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition duration-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="w-4 h-4 text-blue-800"
        >
          <path d="m15 3 6 6-6 6M9 21l-6-6 6-6M21 3l-9 9M3 21l9-9" />
        </svg>
      </div>
    </div>
  </a>
</template>

<style scoped></style>
