<script setup>
import bgImage from '@/assets/images/Hero/1.jpg'
import { computed } from 'vue'
import { useTemplateStore } from '@/stores/useTemplateStore'
import { useParallaxBackground } from '@/composables/useParallaxBackground'

const templateStore = useTemplateStore()

const guest = computed(() => templateStore.guest)
const haveCompanions = computed(() => {
  return guest.value?.companions?.length > 0
})

useParallaxBackground('#homeParallaxBg', 0.75)
</script>

<template>
  <section
    id="sectionHome"
    class="hero-section flex flex-col items-center justify-center w-full z-10 mt-0 md:mt-12"
  >
    <div class="hero relative w-full overflow-hidden">
      <!-- Parallax background layer (moved via transform) -->
      <div class="parallax-layer absolute inset-0">
        <div
          id="homeParallaxBg"
          class="parallax-bg absolute inset-0 bg-cover bg-center bg-no-repeat"
          :style="`background-image: url(${bgImage});`"
        ></div>

        <!-- Overlay for readability -->
        <div
          class="absolute inset-0 bg-gradient-to-b from-[#123B5A]/30 via-transparent to-[#F6FBFD]/60 pointer-events-none"
        ></div>
      </div>

      <!-- Foreground content (fills the hero height) -->
      <div
        class="foreground absolute inset-0 z-10 flex flex-col items-center justify-between pt-20 pb-6"
      >
        <div class="top-hero flex flex-col items-center justify-center w-full">
          <div class="relative inline-block">
            <div class="absolute -inset-x-8 -inset-y-4 rounded-[2.5rem] bg-white/40 blur-2xl"></div>
            <p
              class="relative text-5xl font-bold leading-[1.15] py-2 mt-2 font-gvibes animate__animated animate__bounceInLeft text-transparent bg-clip-text"
              style="
                background-image: linear-gradient(
                  to right,
                  #0e2f4a 0%,
                  #1f5573 15%,
                  #7fd0e6 30%,
                  #aee7ff 50%,
                  #7fd0e6 70%,
                  #1f5573 85%,
                  #0e2f4a 100%
                );
                text-shadow:
                  0 0 10px rgba(159, 229, 255, 0.45),
                  0 0 24px rgba(127, 208, 230, 0.35);
              "
            >
              Isabella Pareja
            </p>
          </div>

          <div
            class="inline-flex px-4 py-1 rounded-full bg-white/55 backdrop-blur-sm border border-[#D9C2A3]/35 animate-fadeIn animate__animated animate__bounceInRight"
          >
            <p class="text-2xl font-semibold text-[#123B5A] tracking-[0.12em]">03.14.2026</p>
          </div>
        </div>

        <div
          class="bottom-hero max-w-xl w-[92%] md:w-auto flex flex-col items-center justify-center animate__animated animate__bounce bg-white/55 backdrop-blur-md rounded-2xl border border-white/40 shadow-lg shadow-[#123B5A]/10 p-6 md:p-10 gap-2 md:gap-3"
        >
          <p class="text-2xl font-normal text-[#2F6F8F] font-gvibes">
            <span v-if="haveCompanions"> Es nuestro Placer Invitarlos </span>
            <span v-else> Es nuestro placer Invitarte </span>
          </p>

          <div class="guest-section text-center">
            <h4 class="text-lg text-[#123B5A] font-semibold break-words">
              {{ guest?.name }}
            </h4>

            <ul v-if="haveCompanions" class="mt-1 text-[#123B5A]/80 text-sm break-words">
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
/* Use explicit height so children using absolute/100% behave consistently on iOS */
.hero {
  height: 100svh;
}

@supports not (height: 100svh) {
  .hero {
    height: 100vh;
  }
}

/* Parallax layers */
.parallax-layer {
  pointer-events: none;
}

/* Make the background slightly taller to avoid empty gaps when translating */
.parallax-bg {
  height: 160%;
  top: -30%;
  will-change: transform;
  transform: translate3d(0, 0, 0);
}
</style>
