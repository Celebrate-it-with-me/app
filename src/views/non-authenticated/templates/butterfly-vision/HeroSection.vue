<script setup>
import bgImage from '@/assets/images/img/hero_1.jpg'
import { computed, onMounted, onUnmounted } from 'vue'
import { useTemplateStore } from '@/stores/useTemplateStore'

const templateStore = useTemplateStore()
const guest = computed(() => templateStore.guest)
const haveCompanions = computed(() => guest.value?.companions?.length > 0)

let ticking = false
let parallaxEl = null
const speed = 0.4

const onScroll = () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      const scrollY = window.scrollY
      if (parallaxEl) {
        const offset = scrollY * speed
        parallaxEl.style.transform = `translate3d(0, ${offset}px, 0)`
      }
      ticking = false
    })
    ticking = true
  }
}

onMounted(() => {
  parallaxEl = document.querySelector('.parallax-bg')
  window.addEventListener('scroll', onScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <section
    id="sectionHome"
    class="hero-section relative w-full min-h-screen z-0"
  >
    <!-- Fondo Parallax -->
    <div
      class="parallax-bg absolute inset-0 bg-cover bg-center will-change-transform z-[-1]"
      :style="`background-image: url(${bgImage});`"
    ></div>

    <!-- Contenido -->
    <div class="w-full h-full flex flex-col justify-between pt-20 pb-8">
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
          <p class="text-2xl font-normal text-purple-middle font-gvibes text-center">
            <span v-if="haveCompanions">Es nuestro Placer Invitarlos</span>
            <span v-else>Es nuestro placer Invitarte</span>
          </p>
          <div class="guest-section mt-4 text-center">
            <h4 class="text-lg text-dark-blue">{{ guest.name }}</h4>
            <ul
              class="text-dark-blue text-sm mt-1"
              v-if="haveCompanions"
            >
              <li v-for="companion in guest.companions" :key="companion.id">
                {{ companion.name }}
              </li>
            </ul>
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
