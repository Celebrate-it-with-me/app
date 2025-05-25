<template>
  <section class="pt-24 pb-half bg-gradient-to-b from-pink-100 to-white dark:from-pink-50 dark:to-gray-900 py-section px-4 sm:px-12 overflow-hidden">
    <div class="max-w-7xl mx-auto grid md:grid-cols-2 items-center gap-10">
      <div class="animate-fadeIn">
        <h1 class="text-4xl sm:text-5xl font-display font-bold leading-tight text-gray-900 dark:text-white">
          Make Your Special Day <span class="bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text animate-gradient">Unforgettable</span>
        </h1>
        <p class="mt-4 text-base sm:text-lg text-gray-700 dark:text-gray-300 max-w-md">
          Plan, organize, and celebrate your quinceañeras, birthdays, and special events with our all-in-one event management platform.
        </p>
        <div class="mt-8 flex flex-wrap gap-4">
          <a href="#features" class="px-5 py-3 rounded-xl text-white bg-gradient-to-r from-pink-500 to-purple-500 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50">
            Explore Features
          </a>
          <a href="#pricing" class="px-5 py-3 rounded-xl border-2 border-pink-500 text-pink-500 hover:bg-pink-50 dark:hover:bg-gray-800 transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50">
            View Pricing
          </a>
        </div>
      </div>
      <div class="animate-slideInRight md:w-4/5 mx-auto">
        <CCard variant="gallery" class="transform hover:scale-105 transition-transform duration-500 shadow-xl">
          <template #image>
            <img
              :src="HeroImage"
              alt="Beautiful event venue decorated for a celebration"
              class="w-full h-full object-cover rounded-xl"
              loading="eager"
            />
          </template>
        </CCard>
      </div>
    </div>
  </section>
</template>

<script setup>
import HeroImage from '@/assets/images/external/hero-venue.jpg'
import CCard from '@/components/UI/cards/CCard.vue'
</script>
