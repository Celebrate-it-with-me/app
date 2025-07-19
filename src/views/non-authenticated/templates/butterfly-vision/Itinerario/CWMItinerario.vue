<script setup>
import MargaritaGif from '@/assets/images/Itinerario/margarita.gif'
import CeremonyGif from '@/assets/images/Itinerario/ceremony.gif'
import FoodGif from '@/assets/images/Itinerario/food-delivery.gif'
import DanceGif from '@/assets/images/Itinerario/dance.gif'
import DanceFloor from '@/assets/images/Itinerario/dance-floor.gif'
import { onMounted, ref } from 'vue'

const isIOS = ref(false)

onMounted(() => {
  // Detect iOS
  isIOS.value = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

  const parallaxBg = document.querySelector('.parallax-bg')
  const container = document.querySelector('.itinerario-container')

  if (parallaxBg && container) {
    // Apply parallax effect based on device
    container.addEventListener('scroll', () => {
      const scrollY = container.scrollTop
      const parallaxSpeed = isIOS.value ? 0.4 : 0.3 // Different speeds for iOS vs other devices

      // Move the background at a different rate than the content
      parallaxBg.style.transform = `translate3d(0, ${scrollY * parallaxSpeed}px, 0)`
    })

    // Trigger initial position
    setTimeout(() => {
      const scrollEvent = new Event('scroll')
      container.dispatchEvent(scrollEvent)
    }, 100)
  }
})
</script>

<template>
  <div
    id="sectionItinerario"
    class="relative overflow-hidden h-[100vh] w-full"
  >
    <div class="absolute inset-0 w-full h-full parallax-bg">
      <img
        src="@/assets/images/img/itinerario_bg_2.jpg"
        alt="Background"
        class="object-cover w-full h-full transform translate-z-0"
        style="transform: translateZ(0);"
      />
    </div>
    <div
      class="itinerario-container relative z-10 mx-auto flex justify-center w-full h-screen min-h-screen
             p-2 md:p-8 overflow-y-auto"
    >
      <div
        class="timeline-container relative w-full md:w-3/4 wrap overflow-hidden py-10 px-2 bg-white/50 rounded-lg"
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
                class="object-contain max-w-[6rem] z-10 rounded-lg w-24 h-24"
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
                alt="Ceremony"
                class="object-contain max-w-[6rem] z-10 rounded-lg w-24 h-24"
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
                alt="Food"
                class="object-contain max-w-[6rem] z-10 rounded-lg w-24 h-24"
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
                alt="Dance"
                class="object-contain max-w-[6rem] z-10 rounded-lg w-24 h-24"
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
                class="object-contain max-w-[6rem] z-10 rounded-lg w-24 h-24"
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
  </div>
</template>

<style scoped>
/* This style has been merged with the one below */

@media screen and (min-width: 1024px) {
  #sectionItinerario .absolute img {
    content: url('@/assets/images/img/itinerario_bg_large.jpg');
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

.parallax-bg {
  will-change: transform;
  transform: translate3d(0, 0, 0);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

/* Non-iOS devices use a different parallax technique */
@media (min-width: 768px) {
  .parallax-bg img {
    transition: transform 0.1s linear;
  }
}

.itinerario-container {
  min-height: 100vh;
  width: 100%;
  position: relative;
  perspective: 1px;
  height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.itinerario-container::-webkit-scrollbar {
  width: 0.5rem;
}

.itinerario-container::-webkit-scrollbar-track {
  background: transparent;
}

.itinerario-container::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 0.25rem;
}
</style>
