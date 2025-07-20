<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import MargaritaGif from '@/assets/images/Itinerario/margarita.gif'
import CeremonyGif from '@/assets/images/Itinerario/ceremony.gif'
import FoodGif from '@/assets/images/Itinerario/food-delivery.gif'
import DanceGif from '@/assets/images/Itinerario/dance.gif'
import DanceFloor from '@/assets/images/Itinerario/dance-floor.gif'
import ItineraryBg from '@/assets/images/img/itinerario_bg_2.jpg'

const parallaxRef = ref(null)
let ticking = false
const speed = 0.3

function onScroll() {
  if (!ticking && parallaxRef.value) {
    window.requestAnimationFrame(() => {
      const offset = window.scrollY * speed
      parallaxRef.value.style.transform = `translate3d(0, ${offset}px, 0)`
      ticking = false
    })
    ticking = true
  }
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <section id="sectionItinerario" class="relative w-full overflow-hidden">
    <!-- Parallax background -->
    <div
      ref="parallaxRef"
      class="absolute inset-0 bg-cover bg-center will-change-transform pointer-events-none"
      :style="`background-image: url('${ItineraryBg}'); height: 200vh;`"
    ></div>

    <!-- Content overlay -->
    <div class="relative z-10 min-h-screen flex items-center justify-center p-8">
      <div class="timeline-container w-full max-w-4xl bg-[#e5e7eb]/60 rounded-lg py-10 px-4">
        <h2 class="text-5xl font-gvibes font-bold text-gray-900 text-center mb-6">Itinerario</h2>
        <div class="absolute left-1/2 top-0 bottom-0 border border-gray-700 border-opacity-20"></div>

        <!-- Timeline steps -->
        <div class="flex flex-col gap-8">
          <div class="flex justify-between items-center">
            <div class="w-5/12 flex justify-center">
              <img :src="MargaritaGif" alt="Margarita" class="w-24 h-24 rounded-lg object-contain" />
            </div>
            <div class="w-8 h-8 flex items-center justify-center bg-gray-800 text-white rounded-full">1</div>
            <div class="w-5/12 bg-[#baa7fb]/60 p-2 rounded-lg">
              <h3 class="font-bold text-[#111827] text-md">Cocktail</h3>
              <p class="text-sm font-medium text-[#111827]">7:00pm–8:00pm</p>
            </div>
          </div>

          <div class="flex justify-between flex-row-reverse items-center">
            <div class="w-5/12 flex justify-center">
              <img :src="CeremonyGif" alt="Ceremony" class="w-24 h-24 rounded-lg object-contain" />
            </div>
            <div class="w-8 h-8 flex items-center justify-center bg-gray-800 text-white rounded-full">2</div>
            <div class="w-5/12 bg-[#baa7fb]/60 p-2 rounded-lg">
              <h3 class="font-bold text-[#111827] text-xl">Ceremonia</h3>
              <p class="text-sm font-medium text-[#111827]">8:00pm–9:30pm</p>
            </div>
          </div>

          <div class="flex justify-between items-center">
            <div class="w-5/12 flex justify-center">
              <img :src="FoodGif" alt="Dinner" class="w-24 h-24 rounded-lg object-contain" />
            </div>
            <div class="w-8 h-8 flex items-center justify-center bg-gray-800 text-white rounded-full">3</div>
            <div class="w-5/12 bg-[#baa7fb]/60 p-2 rounded-lg">
              <h3 class="font-bold text-[#111827] text-lg">Cena</h3>
              <p class="text-sm text-[#111827]">9:30pm–10:30pm</p>
            </div>
          </div>

          <div class="flex justify-between flex-row-reverse items-center">
            <div class="w-5/12 flex justify-center">
              <img :src="DanceGif" alt="Dance" class="w-24 h-24 rounded-lg object-contain" />
            </div>
            <div class="w-8 h-8 flex items-center justify-center bg-gray-800 text-white rounded-full">4</div>
            <div class="w-5/12 bg-[#baa7fb]/60 p-2 rounded-lg">
              <h3 class="font-bold text-[#111827] text-lg">Baile Sorpresa</h3>
              <p class="text-sm font-medium text-[#111827]">10:30pm–11:00pm</p>
            </div>
          </div>

          <div class="flex justify-between items-center">
            <div class="w-5/12 flex justify-center">
              <img :src="DanceFloor" alt="Hora Loca" class="w-24 h-24 rounded-lg object-contain" />
            </div>
            <div class="w-8 h-8 flex items-center justify-center bg-gray-800 text-white rounded-full">5</div>
            <div class="w-5/12 bg-[#baa7fb]/60 p-2 rounded-lg">
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
section {
  height: 100vh;
}
.timeline-container {
  position: relative;
}
</style>
