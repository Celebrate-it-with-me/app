<script setup>
import Parallaxy from '@lucien144/vue3-parallaxy'

import MargaritaGif from '@/assets/images/Itinerario/margarita.gif'
import CeremonyGif from '@/assets/images/Itinerario/ceremony.gif'
import FoodGif from '@/assets/images/Itinerario/food-delivery.gif'
import DanceGif from '@/assets/images/Itinerario/dance.gif'
import DanceFloor from '@/assets/images/Itinerario/dance-floor.gif'
import ItineraryBg from '@/assets/images/img/itinerario_bg_2.jpg'
</script>

<template>
  <Parallaxy :speed="20" class="relative w-full min-h-screen overflow-hidden">
    <!-- Parallax background image -->
    <img
      slot="default"
      :src="ItineraryBg"
      alt="Background"
      class="absolute inset-0 w-full h-full object-cover object-center z-0"
    />

    <!-- Timeline content overlay -->
    <div class="relative z-10 mx-auto flex justify-center w-full min-h-screen p-2 md:p-8 bg-white/60">
      <div class="timeline-container relative w-full md:w-3/4 wrap overflow-hidden py-10 px-2 bg-[#e5e7eb]/60 rounded-lg">
        <h2 class="text-gray-900 text-center mb-2 font-bold text-5xl font-gvibes">
          Itinerario
        </h2>
        <div class="absolute border border-gray-700 border-opacity-20 h-full" style="left:50%"></div>

        <div class="flex flex-col justify-between h-full">
          <!-- Paso 1 – 5 -->
          <div v-for="(step, i) in [
            {img: MargaritaGif, label: 'Cocktail', time: '7:00pm–8:00pm'},
            {img: CeremonyGif, label: 'Ceremonia', time: '8:00pm–9:30pm'},
            {img: FoodGif, label: 'Cena', time: '9:30pm–10:30pm'},
            {img: DanceGif, label: 'Baile Sorpresa', time: '10:30pm–11:00pm'},
            {img: DanceFloor, label: 'Hora Loca', time: '11:00pm'}
          ]" :key="i"
               :class="['mb-8 flex justify-between items-center w-full', i % 2 === 1 ? 'flex-row-reverse left-timeline' : 'right-timeline']"
          >
            <div class="order-1 w-5/12 flex justify-center">
              <img :src="step.img" :alt="step.label" class="w-24 h-24 rounded-lg object-contain" />
            </div>
            <div class="z-20 flex items-center order-1 bg-gray-800 shadow-xl w-8 h-8 rounded-full">
              <h1 class="mx-auto font-semibold text-lg text-white">{{ i + 1 }}</h1>
            </div>
            <div class="order-1 bg-[#baa7fb]/60 rounded-lg shadow-xl w-5/12 px-2 py-2">
              <h3 class="font-bold text-[#111827] text-lg">{{ step.label }}</h3>
              <p class="text-sm font-medium text-[#111827]">{{ step.time }}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  </Parallaxy>
</template>

<style scoped>
.gold-metallic-animated {
  background: linear-gradient(
    45deg,
    #cebcfb 0%,
    #baa7fb 35%,
    #fffde7 50%,
    #bba8f6 65%,
    #e1d8ff 100%
  );
  background-size: 200% 200%;
}
@keyframes goldShimmer {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
</style>
