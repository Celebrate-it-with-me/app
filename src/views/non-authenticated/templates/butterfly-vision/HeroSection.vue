<script setup>
import bgImage from '@/assets/images/img/hero_1.jpg'
import { computed } from 'vue'
import { useTemplateStore } from '@/stores/useTemplateStore'
import { useParallaxBackground } from '@/composables/useParallaxBackground.js'

// Store para invitados
const templateStore = useTemplateStore()
const guest = computed(() => templateStore.guest)
const haveCompanions = computed(() => guest.value?.companions?.length > 0)

// Activar efecto parallax
useParallaxBackground('.parallax-bg', 0.4)
</script>

<template>
  <section
    id="sectionHome"
    class="hero-section relative w-full min-h-screen z-0 overflow-hidden"
  >
    <!-- Fondo Parallax -->
    <div
      class="parallax-bg absolute inset-0 bg-cover bg-center will-change-transform z-[-1] pointer-events-none"
      :style="`background-image: url(${bgImage});`"
    ></div>

    <div class="w-full h-full flex flex-col justify-between pt-20 pb-8 z-10 relative">
      <div class="top-hero flex flex-col items-center justify-center w-full">
        <p class="text-5xl font-bold text-purple-middle font-gvibes animate__animated animate__bounceInLeft mt-2">
          Melissa Rodriguez
        </p>
        <p class="text-2xl font-semibold text-dark-blue animate__animated animate__bounceInRight">
          09.27.2025
        </p>
      </div>

      <div class="bottom-hero w-full flex flex-col items-center justify-center">
        <div class="w-full bg-white/50 p-10">
          <p class="text-4xl font-bold text-purple-middle font-gvibes text-center">
            <span v-if="haveCompanions">Es nuestro Placer Invitarles</span>
            <span v-else>Es nuestro placer Invitarte</span>
          </p>
          <div class="guest-section mt-4 text-center">
            <h4 class="text-lg font-quicksand font-semibold text-dark-blue">{{ guest.name }}</h4>
            <div class="mt-1" v-if="haveCompanions">
              <p
                v-for="companion in guest.companions"
                class="text-dark-blue font-quicksand font-semibold text-lg"
                :key="companion.id"
              >
                {{ companion.name }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  height: 100vh;
}
</style>
