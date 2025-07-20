<script setup>
import MargaritaGif from '@/assets/images/Itinerario/margarita.gif'
import CeremonyGif from '@/assets/images/Itinerario/ceremony.gif'
import FoodGif from '@/assets/images/Itinerario/food-delivery.gif'
import DanceGif from '@/assets/images/Itinerario/dance.gif'
import DanceFloor from '@/assets/images/Itinerario/dance-floor.gif'

// Importar las imágenes de fondo directamente
import itinerarioBg from '@/assets/images/img/itinerario_bg_2.jpg'
import itinerarioBgLarge from '@/assets/images/img/itinerario_bg_large.jpg'
</script>

<template>
  <div
    id="sectionItinerario"
    class="itinerario-container mx-auto flex justify-center w-full min-h-screen p-2 md:p-8"
    :style="{
      backgroundImage: `url(${itinerarioBg})`
    }"
  >
    <div
      class="timeline-container relative w-full md:w-3/4 wrap overflow-hidden py-10 px-2 bg-gray-200/40 rounded-lg"
    >
      <h2 class="text-gray-900 text-center mb-2 font-bold text-5xl font-gvibes">Itinerario</h2>
      <div
        class="border-2-2 absolute border-opacity-20 border-gray-700 h-full border"
        style="left: 50%"
      ></div>
      <!-- right timeline -->
      <div class="flex flex-col justify-between h-full">
        <div class="mb-8 flex justify-between items-center w-full right-timeline">
          <div class="order-1 w-5/12 flex justify-center items-center">
            <img
              :src="MargaritaGif"
              alt="Margarita"
              class="h-auto rounded-lg w-24 h-24"
            />
          </div>
          <div class="z-20 flex items-center order-1 bg-gray-800 shadow-xl w-8 h-8 rounded-full">
            <h1 class="mx-auto font-semibold text-lg text-white">1</h1>
          </div>
          <div class="order-1 bg-[#baa7fb] rounded-lg shadow-xl w-5/12 px-2 py-2">
            <h3 class="font-bold text-[#111827] text-md">Cocktail</h3>
            <p class="text-sm font-medium leading-snug tracking-wide text-[#111827] text-opacity-100">
              7:00pm-8:00pm
            </p>
          </div>
        </div>

        <!-- left timeline -->
        <div class="mb-8 flex justify-between flex-row-reverse items-center w-full left-timeline">
          <div class="order-1 w-5/12 flex justify-center items-center">
            <img
              :src="CeremonyGif"
              alt="Ceremonia"
              class="w-24 h-24 h-auto rounded-lg"
            />
          </div>
          <div class="z-20 flex items-center order-1 bg-gray-800 shadow-xl w-8 h-8 rounded-full">
            <h1 class="mx-auto text-white font-semibold text-lg">2</h1>
          </div>
          <div class="order-1 bg-[#baa7fb] rounded-lg shadow-xl w-5/12 px-2 py-2">
            <h3 class="font-bold text-[#111827] text-xl">Ceremonia</h3>
            <p class="text-sm font-medium leading-snug tracking-wide text-[#111827] text-opacity-100">
              8:00pm-9:30pm
            </p>
          </div>
        </div>

        <!-- right timeline -->
        <div class="mb-8 flex justify-between items-center w-full right-timeline">
          <div class="order-1 w-5/12 flex justify-center items-center">
            <img
              :src="FoodGif"
              alt="Cena"
              class="w-24 h-24 h-auto rounded-lg"
            />
          </div>
          <div class="z-20 flex items-center order-1 bg-gray-800 shadow-xl w-8 h-8 rounded-full">
            <h1 class="mx-auto font-semibold text-lg text-white">3</h1>
          </div>
          <div class="order-1 bg-[#baa7fb] rounded-lg shadow-xl w-5/12 px-2 py-2">
            <h3 class="font-bold text-[#111827] text-lg">Cena</h3>
            <p class="text-sm leading-snug tracking-wide text-[#111827] text-opacity-100">
              9:30pm-10:30pm
            </p>
          </div>
        </div>

        <!-- left timeline -->
        <div class="mb-8 flex justify-between flex-row-reverse items-center w-full left-timeline">
          <div class="order-1 w-5/12 flex justify-center items-center">
            <img
              :src="DanceGif"
              alt="Baile Sorpresa"
              class="w-24 h-24 h-auto rounded-lg"
            />
          </div>
          <div class="z-20 flex items-center order-1 bg-gray-800 shadow-xl w-8 h-8 rounded-full">
            <h1 class="mx-auto text-white font-semibold text-lg">4</h1>
          </div>
          <div class="order-1 bg-[#baa7fb] rounded-lg shadow-xl w-5/12 px-2 py-2">
            <h3 class="font-bold text-[#111827] text-lg">Baile Sorpresa</h3>
            <p class="text-sm font-medium leading-snug tracking-wide text-[#111827] text-opacity-100">
              10:30pm-11:00pm
            </p>
          </div>
        </div>

        <div class="mb-8 flex justify-between items-center w-full right-timeline">
          <div class="order-1 w-5/12 flex justify-center items-center">
            <img
              :src="DanceFloor"
              alt="Dance Floor"
              class="w-24 h-24 h-auto rounded-lg"
            />
          </div>
          <div class="z-20 flex items-center order-1 bg-gray-800 shadow-xl w-8 h-8 rounded-full">
            <h1 class="mx-auto font-semibold text-lg text-white">5</h1>
          </div>
          <div class="order-1 bg-[#baa7fb] rounded-lg shadow-xl w-5/12 px-2 py-2">
            <h3 class="font-bold text-[#111827] text-lg">Hora Loca</h3>
            <p class="text-sm leading-snug tracking-wide text-[#111827] text-opacity-100">11:00pm</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.itinerario-container {
  position: relative;
  min-height: 100vh;
  width: 100%;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  /* Fallback color */
  background-color: #fbb3cd; /* bg-pink-300 */
}

.timeline-container {
  position: relative;
  z-index: 3;
}

/* Media queries para responsive */
@media screen and (min-width: 768px) {
  .itinerario-container {
    background-size: 100% auto;
  }
}

@media screen and (min-width: 1024px) {
  .itinerario-container {
    background-image: v-bind('`url(${itinerarioBgLarge})`') !important;
    background-size: cover;
  }
}

/* Específico para iOS Safari - usa scroll en lugar de fixed */
@supports (-webkit-touch-callout: none) {
  .itinerario-container {
    background-attachment: scroll;
  }
}

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
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
