<script setup>
import MargaritaGif from '@/assets/images/Itinerario/margarita.gif'
import CeremonyGif from '@/assets/images/Itinerario/ceremony.gif'
import FoodGif from '@/assets/images/Itinerario/food-delivery.gif'
import DanceGif from '@/assets/images/Itinerario/dance.gif'
import DanceFloor from '@/assets/images/Itinerario/dance-floor.gif'
import ItineraryBg from '@/assets/images/img/itinerario_bg_2.jpg'
</script>

<template>
  <div id="sectionItinerario" class="relative w-full min-h-screen overflow-hidden">
    <!-- Background Image Fixed (simulating static parallax) -->
    <div class="absolute inset-0 z-0">
      <img
        :src="ItineraryBg"
        alt="Background"
        class="w-full h-full object-cover object-center"
        style="transform: translateZ(0);"
      />
    </div>

    <!-- Content -->
    <div class="relative z-10 w-full h-full min-h-screen flex justify-center items-start py-10 px-4">
      <div class="w-full md:w-3/4 backdrop-blur-md bg-white/10 rounded-lg shadow-lg px-4 md:px-10 py-8">
        <h2 class="text-white text-center mb-8 font-bold text-5xl font-gvibes drop-shadow-lg">
          Itinerario
        </h2>

        <div class="border-l border-white/30 absolute left-1/2 top-0 h-full z-0"></div>

        <div class="flex flex-col gap-12 relative z-10">
          <!-- Step 1 -->
          <div class="flex items-center justify-between gap-4">
            <div class="w-1/2 flex justify-center">
              <img :src="MargaritaGif" alt="Margarita" class="w-20 h-20 rounded-lg object-contain" />
            </div>
            <div class="flex-shrink-0 bg-black text-white w-8 h-8 rounded-full flex items-center justify-center">
              1
            </div>
            <div class="w-1/2 bg-white/20 text-white rounded-lg px-4 py-3 shadow-md backdrop-blur">
              <h3 class="font-semibold text-lg">Cocktail</h3>
              <p class="text-sm">7:00pm–8:00pm</p>
            </div>
          </div>

          <!-- Step 2 -->
          <div class="flex items-center justify-between gap-4 flex-row-reverse">
            <div class="w-1/2 flex justify-center">
              <img :src="CeremonyGif" alt="Ceremony" class="w-20 h-20 rounded-lg object-contain" />
            </div>
            <div class="flex-shrink-0 bg-black text-white w-8 h-8 rounded-full flex items-center justify-center">
              2
            </div>
            <div class="w-1/2 bg-white/20 text-white rounded-lg px-4 py-3 shadow-md backdrop-blur">
              <h3 class="font-semibold text-lg">Ceremonia</h3>
              <p class="text-sm">8:00pm–9:30pm</p>
            </div>
          </div>

          <!-- Step 3 -->
          <div class="flex items-center justify-between gap-4">
            <div class="w-1/2 flex justify-center">
              <img :src="FoodGif" alt="Dinner" class="w-20 h-20 rounded-lg object-contain" />
            </div>
            <div class="flex-shrink-0 bg-black text-white w-8 h-8 rounded-full flex items-center justify-center">
              3
            </div>
            <div class="w-1/2 bg-white/20 text-white rounded-lg px-4 py-3 shadow-md backdrop-blur">
              <h3 class="font-semibold text-lg">Cena</h3>
              <p class="text-sm">9:30pm–10:30pm</p>
            </div>
          </div>

          <!-- Step 4 -->
          <div class="flex items-center justify-between gap-4 flex-row-reverse">
            <div class="w-1/2 flex justify-center">
              <img :src="DanceGif" alt="Baile" class="w-20 h-20 rounded-lg object-contain" />
            </div>
            <div class="flex-shrink-0 bg-black text-white w-8 h-8 rounded-full flex items-center justify-center">
              4
            </div>
            <div class="w-1/2 bg-white/20 text-white rounded-lg px-4 py-3 shadow-md backdrop-blur">
              <h3 class="font-semibold text-lg">Baile Sorpresa</h3>
              <p class="text-sm">10:30pm–11:00pm</p>
            </div>
          </div>

          <!-- Step 5 -->
          <div class="flex items-center justify-between gap-4">
            <div class="w-1/2 flex justify-center">
              <img :src="DanceFloor" alt="Hora Loca" class="w-20 h-20 rounded-lg object-contain" />
            </div>
            <div class="flex-shrink-0 bg-black text-white w-8 h-8 rounded-full flex items-center justify-center">
              5
            </div>
            <div class="w-1/2 bg-white/20 text-white rounded-lg px-4 py-3 shadow-md backdrop-blur">
              <h3 class="font-semibold text-lg">Hora Loca</h3>
              <p class="text-sm">11:00pm</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
