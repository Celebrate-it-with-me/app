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
    class="relative block overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg shadow-[#123B5A]/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
    :data-sub-html="galleryItem.subHtml"
  >
    <div class="w-full relative overflow-hidden aspect-[4/3]">
      <img
        :src="galleryItem.thumb"
        :alt="galleryItem.title"
        class="w-full h-full object-cover rounded-t-2xl transform transition-transform duration-700 group-hover:scale-110"
      />
      <!-- Soft Gradient Overlay -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500"
      ></div>

      <!-- Expand Icon -->
      <div
        class="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
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
          class="w-4 h-4 text-[#2F6F8F]"
        >
          <polyline points="15 3 21 3 21 9" />
          <polyline points="9 21 3 21 3 15" />
          <line x1="21" y1="3" x2="14" y2="10" />
          <line x1="3" y1="21" x2="10" y2="14" />
        </svg>
      </div>
    </div>

    <!-- Caption Area -->
    <div v-if="galleryItem.title" class="p-4 bg-white/80 backdrop-blur-sm">
      <h3
        class="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#123B5A] via-[#2F6F8F] to-[#7FB9C9] truncate"
      >
        {{ galleryItem.title }}
      </h3>
      <p v-if="galleryItem.year || galleryItem.date" class="text-sm text-[#123B5A]/60 mt-1">
        {{ galleryItem.year || galleryItem.date }}
      </p>
    </div>
  </a>
</template>

<style scoped></style>
