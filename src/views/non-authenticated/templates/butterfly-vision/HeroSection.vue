<script setup>
import bgImage from '@/assets/images/img/hero_1.jpg'
import { computed } from 'vue'
import { useTemplateStore } from '@/stores/useTemplateStore'

const templateStore = useTemplateStore()

const guest = computed(() => templateStore.guest)
const haveCompanions = computed(() => {
  return guest.value?.companions?.length > 0
})

</script>

<template>
  <section
    id="sectionHome"
    class="hero-section flex flex-col items-center justify-center w-full min-h-screen
          z-10 mt-0 md:mt-12"
  >
    <!-- Hero Section -->
    <div class="hero relative w-full h-screen overflow-hidden">
      <!-- Parallax Background -->
      <div
        class="parallax-bg absolute inset-0 bg-fixed bg-cover bg-center sm:bg-contain flex flex-col
              items-center justify-between pt-20 pb-8"
        :style="`background-image: url(${bgImage});`"
      >
        <div class="top-hero flex flex-col items-center justify-center w-full">
          <p
            class="text-5xl font-bold leading-tight leading-tight text-purple-middle
                 font-gvibes animate__animated animate__bounceInLeft mt-2"
          >Melissa Rodriguez</p>
          <p class="text-2xl font-semibold text-dark-blue animate-fadeIn
                  animate__animated animate__bounceInRight">09.27.2025</p>
        </div>

        <div class="bottom-hero w-full flex flex-col items-center justify-center w-full
                    animate__animated animate__bounce bg-white bg-opacity-50 p-10"
        >
          <p class="text-2xl font-normal text-purple-middle font-gvibes">
            <span v-if="haveCompanions">
              Es nuestro Placer Invitarlos
            </span>
            <span v-else>
              Es nuestro placer Invitarte
            </span>

          </p>
          <div class="guest-section">
            <h4 class="text-lg text-dark-blue" >
              {{ guest.name }}
            </h4>
            <ul
              class="ml-4 text-dark-blue text-sm"
              v-if="haveCompanions"
            >
              <li
                v-for="companion in guest.companions"
                :key="companion.id"
              >
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

</style>
