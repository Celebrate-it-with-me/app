<script setup>
import { onMounted } from 'vue'
import { useParallaxBackground } from '@/composables/useParallaxBackground'

import MargaritaGif from '@/assets/images/Itinerario/margarita.gif'
import CeremonyGif from '@/assets/images/Itinerario/ceremony.gif'
import FoodGif from '@/assets/images/Itinerario/food-delivery.gif'
import DanceGif from '@/assets/images/Itinerario/dance.gif'
import DanceFloor from '@/assets/images/Itinerario/dance-floor.gif'
import ItineraryBg from '@/assets/images/img/itinerario_bg_2.jpg'

// ⚠️ SOLO LLAMA UNA VEZ EL PARALLAX EN onMounted
onMounted(() => {
  useParallaxBackground('.parallax-bg', 0.3)
})
</script>

<template>
  <section id="sectionItinerario" class="relative w-full min-h-screen overflow-hidden">
    <!-- Fondo con efecto parallax -->
    <div
      class="parallax-bg absolute top-0 left-0 w-full h-[150%] bg-cover bg-center z-0"
      :style="`background-image: url('${ItineraryBg}')`"
    ></div>

    <!-- Contenido principal con overlay -->
    <div class="relative z-10 w-full min-h-screen bg-pink/60 p-2 md:p-8 flex justify-center">
      <div class="timeline-container w-full md:w-3/4 py-10 px-2 bg-white/60 rounded-lg">
        <h2 class="text-gray-900 text-center mb-2 font-bold text-5xl font-gvibes">Itinerario</h2>
        <div class="border-2-2 absolute border-opacity-20 border-gray-700 h-full border" style="left: 50%"></div>

        <div class="flex flex-col justify-between h-full">
          <!-- Paso 1 -->
          <div class="mb-8 flex justify-between items-center w-full right-timeline">
            <div class="order-1 w-5/12 flex justify-center items-center">
              <img :src="MargaritaGif" alt="Margarita" class="w-24 h-24 rounded-lg object-contain" />
            </div>
            <div class="z-20 flex items-center order-1 bg-gray-800 shadow-xl w-8 h-8 rounded-full">
              <h1 class="mx-auto font-semibold text-lg text-white">1</h1>
            </div>
            <div class="order-1 bg-[#baa7fb]/60 rounded-lg shadow-xl w-5/12 px-2 py-2">
              <h3 class="font-bold text-[#111827] text-md">Cocktail</h3>
              <p class="text-sm font-medium text-[#111827]">7:00pm–8:00pm</p>
            </div>
          </div>

          <!-- Paso 2 -->
          <div class="mb-8 flex justify-between flex-row-reverse items-center w-full left-timeline">
            <div class="order-1 w-5/12 flex justify-center items-center">
              <img :src="CeremonyGif" alt="Ceremony" class="w-24 h-24 rounded-lg object-contain" />
            </div>
            <div class="z-20 flex items-center order-1 bg-gray-800 shadow-xl w-8 h-8 rounded-full">
              <h1 class="mx-auto text-white font-semibold text-lg">2</h1>
            </div>
            <div class="order-1 bg-[#baa7fb]/60 rounded-lg shadow-xl w-5/12 px-2 py-2">
              <h3 class="font-bold text-[#111827] text-xl">Ceremonia</h3>
              <p class="text-sm font-medium text-[#111827]">8:00pm–9:30pm</p>
            </div>
          </div>

          <!-- Paso 3 -->
          <div class="mb-8 flex justify-between items-center w-full right-timeline">
            <div class="order-1 w-5/12 flex justify-center items-center">
              <img :src="FoodGif" alt="Dinner" class="w-24 h-24 rounded-lg object-contain" />
            </div>
            <div class="z-20 flex items-center order-1 bg-gray-800 shadow-xl w-8 h-8 rounded-full">
              <h1 class="mx-auto font-semibold text-lg text-white">3</h1>
            </div>
            <div class="order-1 bg-[#baa7fb]/60 rounded-lg shadow-xl w-5/12 px-2 py-2">
              <h3 class="font-bold text-[#111827] text-lg">Cena</h3>
              <p class="text-sm text-[#111827]">9:30pm–10:30pm</p>
            </div>
          </div>

          <!-- Paso 4 -->
          <div class="mb-8 flex justify-between flex-row-reverse items-center w-full left-timeline">
            <div class="order-1 w-5/12 flex justify-center items-center">
              <img :src="DanceGif" alt="Dance" class="w-24 h-24 rounded-lg object-contain" />
            </div>
            <div class="z-20 flex items-center order-1 bg-gray-800 shadow-xl w-8 h-8 rounded-full">
              <h1 class="mx-auto text-white font-semibold text-lg">4</h1>
            </div>
            <div class="order-1 bg-[#baa7fb]/60 rounded-lg shadow-xl w-5/12 px-2 py-2">
              <h3 class="font-bold text-[#111827] text-lg">Baile Sorpresa</h3>
              <p class="text-sm font-medium text-[#111827]">10:30pm–11:00pm</p>
            </div>
          </div>

          <!-- Paso 5 -->
          <div class="mb-8 flex justify-between items-center w-full right-timeline">
            <div class="order-1 w-5/12 flex justify-center items-center">
              <img :src="DanceFloor" alt="Hora Loca" class="w-24 h-24 rounded-lg object-contain" />
            </div>
            <div class="z-20 flex items-center order-1 bg-gray-800 shadow-xl w-8 h-8 rounded-full">
              <h1 class="mx-auto font-semibold text-lg text-white">5</h1>
            </div>
            <div class="order-1 bg-[#baa7fb]/60 rounded-lg shadow-xl w-5/12 px-2 py-2">
              <h3 class="font-bold text-[#111827] text-lg">Hora Loca</h3>
              <p class="text-sm text-[#111827]">11:00pm</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.parallax-bg {
  will-change: transform;
  pointer-events: none;
}
</style>
