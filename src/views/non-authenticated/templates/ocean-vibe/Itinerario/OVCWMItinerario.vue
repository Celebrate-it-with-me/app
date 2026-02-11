<script setup>
import { Martini, Sparkles, Utensils, Music } from 'lucide-vue-next'
</script>

<template>
  <div
    id="sectionItinerario"
    class="itinerario-container mx-auto flex justify-center w-full min-h-screen p-2 md:p-8"
  >
    <div
      class="timeline-container relative w-full md:w-3/4 wrap overflow-hidden pt-10 pb-20 px-2 bg-white/65 backdrop-blur-xs rounded-3xl border border-sky-200/40 shadow-xl shadow-sky-900/15"
    >
      <h2
        class="text-transparent bg-clip-text bg-gradient-to-b from-[#0b4a5a] to-[#1a7a8a] drop-shadow-[0_2px_2px_rgba(255,255,255,0.3)] text-center mb-10 font-bold text-5xl font-gvibes tracking-wide"
      >
        Itinerario
      </h2>
      <div class="absolute bg-sky-200/50 w-0.5 h-full left-1/2 transform -translate-x-1/2"></div>
      <!-- right timeline -->
      <div class="flex flex-col justify-between h-full relative">
        <div class="mb-12 flex justify-between items-center w-full right-timeline">
          <div class="order-1 w-5/12 flex justify-center items-center">
            <div
              class="p-4 bg-sky-100/40 rounded-full border border-sky-200/30 backdrop-blur-md shadow-sm"
            >
              <Martini class="w-10 h-10 text-sky-700/90" :stroke-width="2" />
            </div>
          </div>
          <div
            class="z-20 flex items-center order-1 bg-white border border-sky-200/80 shadow-md w-10 h-10 rounded-full"
          >
            <h1 class="mx-auto font-bold text-lg text-[#083d4a]">1</h1>
          </div>
          <div
            class="order-1 bg-white/60 backdrop-blur-md border border-sky-200/50 rounded-2xl shadow-lg shadow-sky-900/10 w-5/12 px-5 py-4 transition-all hover:bg-white/70"
          >
            <h3 class="font-semibold text-[#083d4a] text-xl">Cocktail</h3>
            <p class="text-sm font-medium leading-snug tracking-wide text-slate-800 mt-1">
              7:00pm - 8:00pm
            </p>
          </div>
        </div>

        <!-- left timeline -->
        <div class="mb-12 flex justify-between flex-row-reverse items-center w-full left-timeline">
          <div class="order-1 w-5/12 flex justify-center items-center">
            <div
              class="p-4 bg-sky-100/40 rounded-full border border-sky-200/30 backdrop-blur-md shadow-sm"
            >
              <Sparkles class="w-10 h-10 text-sky-700/90" :stroke-width="2" />
            </div>
          </div>
          <div
            class="z-20 flex items-center order-1 bg-white border border-sky-200/80 shadow-md w-10 h-10 rounded-full"
          >
            <h1 class="mx-auto text-[#083d4a] font-bold text-lg">2</h1>
          </div>
          <div
            class="order-1 bg-white/60 backdrop-blur-md border border-sky-200/50 rounded-2xl shadow-lg shadow-sky-900/10 w-5/12 px-5 py-4 transition-all hover:bg-white/70"
          >
            <h3 class="font-semibold text-[#083d4a] text-xl">Ceremonia</h3>
            <p class="text-sm font-medium leading-snug tracking-wide text-slate-800 mt-1">
              8:00pm - 9:30pm
            </p>
          </div>
        </div>

        <!-- right timeline -->
        <div class="mb-12 flex justify-between items-center w-full right-timeline">
          <div class="order-1 w-5/12 flex justify-center items-center">
            <div
              class="p-4 bg-sky-100/40 rounded-full border border-sky-200/30 backdrop-blur-md shadow-sm"
            >
              <Utensils class="w-10 h-10 text-sky-700/90" :stroke-width="2" />
            </div>
          </div>
          <div
            class="z-20 flex items-center order-1 bg-white border border-sky-200/80 shadow-md w-10 h-10 rounded-full"
          >
            <h1 class="mx-auto font-bold text-lg text-[#083d4a]">3</h1>
          </div>
          <div
            class="order-1 bg-white/60 backdrop-blur-md border border-sky-200/50 rounded-2xl shadow-lg shadow-sky-900/10 w-5/12 px-5 py-4 transition-all hover:bg-white/70"
          >
            <h3 class="font-semibold text-[#083d4a] text-xl">Cena</h3>
            <p class="text-sm font-medium leading-snug tracking-wide text-slate-800 mt-1">
              9:30pm - 10:30pm
            </p>
          </div>
        </div>

        <!-- left timeline -->
        <div class="mb-12 flex justify-between flex-row-reverse items-center w-full left-timeline">
          <div class="order-1 w-5/12 flex justify-center items-center">
            <div
              class="p-4 bg-sky-100/40 rounded-full border border-sky-200/30 backdrop-blur-md shadow-sm"
            >
              <Music class="w-10 h-10 text-sky-700/90" :stroke-width="2" />
            </div>
          </div>
          <div
            class="z-20 flex items-center order-1 bg-white border border-sky-200/80 shadow-md w-10 h-10 rounded-full"
          >
            <h1 class="mx-auto text-[#083d4a] font-bold text-lg">4</h1>
          </div>
          <div
            class="order-1 bg-white/60 backdrop-blur-md border border-sky-200/50 rounded-2xl shadow-lg shadow-sky-900/10 w-5/12 px-5 py-4 transition-all hover:bg-white/70"
          >
            <h3 class="font-semibold text-[#083d4a] text-xl">Baile Sorpresa</h3>
            <p class="text-sm font-medium leading-snug tracking-wide text-slate-800 mt-1">
              10:30pm - 11:00pm
            </p>
          </div>
        </div>

        <div class="mb-20 flex justify-between items-center w-full right-timeline">
          <div class="order-1 w-5/12 flex justify-center items-center">
            <div
              class="p-4 bg-sky-100/40 rounded-full border border-sky-200/30 backdrop-blur-md flex space-x-1 shadow-sm"
            >
              <Sparkles class="w-8 h-8 text-sky-700/90" :stroke-width="2" />
              <Music class="w-8 h-8 text-sky-700/90" :stroke-width="2" />
            </div>
          </div>
          <div
            class="z-20 flex items-center order-1 bg-white border border-sky-200/80 shadow-md w-10 h-10 rounded-full"
          >
            <h1 class="mx-auto font-bold text-lg text-[#083d4a]">5</h1>
          </div>
          <div
            class="order-1 bg-white/60 backdrop-blur-md border border-sky-200/50 rounded-2xl shadow-lg shadow-sky-900/10 w-5/12 px-5 py-4 transition-all hover:bg-white/70"
          >
            <h3 class="font-semibold text-[#083d4a] text-xl">Hora Loca</h3>
            <p class="text-sm font-medium leading-snug tracking-wide text-slate-800 mt-1">
              11:00pm
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.itinerario-container {
  background-image: url('@/assets/images/Itinerario/4.jpg');
  background-repeat: no-repeat;
  background-size: cover;
  background-attachment: fixed;
  background-position: center;
  min-height: 100vh;
  width: 100%;
  position: relative;
}

@media screen and (min-width: 768px) {
  .itinerario-container {
    background-size: 100% auto;
    background-position: center;
  }
}

@media screen and (min-width: 1024px) {
  .itinerario-container {
    background-image: url('@/assets/images/img/itinerario_bg_large.jpg');
    background-size: cover;
    background-position: center;
  }
}
</style>
