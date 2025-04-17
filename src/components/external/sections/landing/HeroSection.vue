<template>
  <section class="pt-24 pb-half bg-gradient-to-b from-pink-100 to-white dark:from-pink-50 dark:to-gray-900 py-section px-12">
    <div class="max-w-7xl mx-auto grid md:grid-cols-2 items-center gap-10">
      <div>
        <h1 class="text-4xl sm:text-5xl font-display font-bold leading-tight text-gray-900 dark:text-white">
          Make Your Special Day <span class="bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">Unforgettable</span>
        </h1>
        <p class="mt-4 text-base text-gray-700 dark:text-gray-300 max-w-md">
          Plan, organize, and celebrate your quinceañeras, birthdays, and special events with our all-in-one event management platform.
        </p>
        <div class="mt-6 flex gap-4">
          <button class="px-5 py-2 rounded-xl text-white bg-gradient-to-r from-pink-500 to-purple-500 shadow-md">Watch Demo</button>
          <button class="px-5 py-2 rounded-xl border border-pink-500 text-pink-500 hover:bg-pink-50 dark:hover:bg-gray-800">View Pricing</button>
        </div>
      </div>
      <CCard variant="gallery" class="md:w-3/5 mx-auto">
        <template #image>
          <img
            :src="HeroImage"
            alt="Venue"
            class="w-full h-full object-cover rounded-xl"

          />
        </template>
      </CCard>
    </div>
  </section>
</template>

<script setup>
import HeroImage from '@/assets/images/external/hero-venue.jpg'
import CCard from '@/components/UI/cards/CCard.vue'
</script>
