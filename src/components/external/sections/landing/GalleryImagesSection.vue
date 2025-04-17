<template>
  <section class="py-half px-4 bg-gradient-to-b from-white to-pink-50 dark:from-gray-900 dark:to-gray-800">
    <div class="max-w-7xl mx-auto text-center mb-12">
      <CHeading :level="2" weight="bold" class="mb-2">
        Inspiring Event Gallery
      </CHeading>
      <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        See how others have created their perfect celebrations
      </p>
    </div>

    <div class="grid gap-6 md:grid-cols-3 max-w-7xl mx-auto">
      <img
        src="@/assets/images/external/gallery-1.jpg"
        alt="Quinceañera"
        class="rounded-xl w-full object-cover h-64 shadow-md"
      />
      <img
        src="@/assets/images/external/gallery-2.jpg"
        alt="Sweet 16"
        class="rounded-xl w-full object-cover h-64 shadow-md"
      />
      <img
        src="@/assets/images/external/gallery-3.jpg"
        alt="Wedding"
        class="rounded-xl w-full object-cover h-64 shadow-md"
      />
    </div>
  </section>
</template>

<script setup>
import CHeading from '@/components/UI/headings/CHeading.vue'
</script>
