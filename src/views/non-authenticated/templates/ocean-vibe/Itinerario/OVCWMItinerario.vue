<script setup>
import { Martini, Sparkles, Utensils, Music } from 'lucide-vue-next'
import { ref, computed, onMounted, onUnmounted } from 'vue'

import bgItinerario from '@/assets/images/Itinerario/4.jpg'
import bgItinerarioLarge from '@/assets/images/Itinerario/4.jpg'

/**
 * Desktop detection that actually reacts to resize.
 * This prevents "stuck" background when the viewport changes.
 */
const desktopQuery = '(min-width: 1024px)'
const isDesktop = ref(false)

let mql = null
const updateDesktop = () => {
  if (!mql) return
  isDesktop.value = !!mql.matches
}

onMounted(() => {
  if (!window.matchMedia) return
  mql = window.matchMedia(desktopQuery)
  updateDesktop()

  if (mql.addEventListener) mql.addEventListener('change', updateDesktop)
  else if (mql.addListener) mql.addListener(updateDesktop)
})

onUnmounted(() => {
  if (!mql) return
  if (mql.removeEventListener) mql.removeEventListener('change', updateDesktop)
  else if (mql.removeListener) mql.removeListener(updateDesktop)
})

const bgStyle = computed(() => {
  const image = isDesktop.value ? bgItinerarioLarge : bgItinerario
  return { backgroundImage: `url(${image})` }
})
</script>

<template>
  <section id="sectionItinerario" class="itinerario-container relative w-full overflow-hidden">
    <!-- Background layer -->
    <div class="background-layer absolute inset-0">
      <div class="background-image absolute inset-0" :style="bgStyle"></div>

      <!-- Overlay for readability (kept, tweak if you want more contrast) -->
      <div class="absolute inset-0 bg-gradient-to-b from-white/40 via-white/25 to-white/55"></div>
    </div>

    <!-- Foreground content -->
    <div class="relative z-10 mx-auto flex justify-center w-full min-h-[100svh] p-2 md:p-8">
      <div
        class="timeline-container relative w-full md:w-3/4 wrap pt-10 pb-20 px-2 bg-white/65 backdrop-blur-xs rounded-3xl border border-sky-200/40 shadow-xl shadow-sky-900/15"
      >
        <h2
          class="text-transparent bg-clip-text bg-gradient-to-b from-[#0b4a5a] to-[#1a7a8a] drop-shadow-[0_2px_2px_rgba(255,255,255,0.3)] text-center mb-10 font-bold text-5xl font-gvibes tracking-wide"
        >
          Itinerario
        </h2>

        <div class="absolute bg-sky-200/50 w-0.5 h-full left-1/2 transform -translate-x-1/2"></div>

        <div class="flex flex-col justify-between h-full relative">
          <!-- 1 -->
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

          <!-- 2 -->
          <div
            class="mb-12 flex justify-between flex-row-reverse items-center w-full left-timeline"
          >
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

          <!-- 3 -->
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

          <!-- 4 -->
          <div
            class="mb-12 flex justify-between flex-row-reverse items-center w-full left-timeline"
          >
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

          <!-- 5 -->
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
  </section>
</template>

<style scoped>
.itinerario-container {
  min-height: 100svh;
  position: relative;
  overflow: hidden; /* Prevent any unwanted scrolling/zoom issues */
}

@supports not (height: 100svh) {
  .itinerario-container {
    min-height: 100vh;
  }
}

.background-layer {
  pointer-events: none;
  /* Prevent iOS zoom/touch issues on background */
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
}

/**
 * Fixed background image (no parallax)
 * - Optimized for iPhone/mobile devices to prevent excessive zoom
 */
.background-image {
  background-size: cover;
  background-position: center 40%;
  background-repeat: no-repeat;
  background-attachment: scroll; /* Explicit for iOS compatibility */
}

/* Mobile/iPhone: prevent excessive zoom, show more of the image */
@media (max-width: 768px) {
  .background-image {
    background-size: auto 100%;
    background-position: center center;
  }
}

/* Tablets: balanced view */
@media (min-width: 769px) and (max-width: 1023px) {
  .background-image {
    background-size: cover;
    background-position: center 35%;
  }
}

/* Desktop: show more of the full image */
@media (min-width: 1024px) {
  .background-image {
    background-size: cover;
    background-position: center 40%;
  }
}
</style>
