<script setup lang="ts">

import Title from '@/components/UI/Title.vue'
</script>

<template>
    <section class="relative bg-transparent text-white mt-10">
      <div class="container mx-auto flex flex-col items-center justify-between py-12 px-6 ">
        <!-- Text Content -->
        <div class="text-center md:text-center flex flex-col md:w-3/4">
          <Title level="h1" >
            Plan Events Effortlessly with <span class="text-yellow-300">Celebrate it with me</span>
          </Title>

          <Title level="h5" :classes="'text-lg md:text-xl text-gray-500 mb-8 mt-40'">
            Simplify planning for Weddings, Quinceañeras, and Birthdays.
            Save time, stay organized, and create unforgettable moments.
          </Title>

        </div>

        <div class="text-center md:w-3/4 flex justify-center gap-x-4">
          <button class="text-white font-semibold px-4 py-2 border border-blue-500 rounded-md hover:bg-blue-500 transition duration-300">
            Get started for free
          </button>
          <button class="text-gray-500 hover:text-white transition duration-300">
            Learn More
          </button>
        </div>
      </div>

      <!-- Decorative Shape -->
    </section>
  </template>


<style scoped>

</style>
