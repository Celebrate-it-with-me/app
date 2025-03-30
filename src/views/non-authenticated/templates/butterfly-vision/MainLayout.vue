<script setup>
import { onMounted, ref } from 'vue'
import HeaderNav from '@/views/non-authenticated/templates/butterfly-vision/HeaderNav.vue'
import HeroSection from '@/views/non-authenticated/templates/butterfly-vision/HeroSection.vue'
import SaveTheDate from '@/views/non-authenticated/templates/butterfly-vision/SaveTheDate/SaveTheDate.vue'
import SweetMemories from '@/views/non-authenticated/templates/butterfly-vision/SweetMemories/SweetMemories.vue'
import SuggestedMusic from '@/views/non-authenticated/templates/butterfly-vision/SuggestedMusic/SuggestedMusic.vue'
import RSVP from '@/views/non-authenticated/templates/butterfly-vision/RSVP/RSVP.vue'
import DressCode from '@/views/non-authenticated/templates/butterfly-vision/DressCode/DressCode.vue'
import BackgroundMusic from '@/views/non-authenticated/templates/butterfly-vision/BackgroundMusic/BackgroundMusic.vue'
import ContactAndComments from '@/views/non-authenticated/templates/butterfly-vision/ContactAndComments/ContactAndComments.vue'
import EventFooter from '@/views/non-authenticated/templates/butterfly-vision/EventFooter/EventFooter.vue'
import { templateRef } from '@vueuse/core'
import SeparadorSection from '@/views/non-authenticated/templates/butterfly-vision/SeparadorSection.vue'
import CWMItinerario from '@/views/non-authenticated/templates/butterfly-vision/Itinerario/CWMItinerario.vue'
import EventComments from '@/components/authenticated/event-comments/EventComments/EventComments.vue'

const showScrollBtn = ref(false)
const videoReproduced = ref(false)
const showButterflyLogo = ref(true)
const videoInstance = templateRef('videoRef')

onMounted(() => {
  document.body.classList.remove('dark')
  showHideScrollButton()
})

const startTheVideo = () => {
  showButterflyLogo.value = false
  videoInstance.value.play()
}

const handleVideoEnd = () => {
  videoReproduced.value = true
}

const showHideScrollButton = () => {
  window.addEventListener('scroll', () => {
    showScrollBtn.value = window.scrollY > 200
  })
}

const handleMoveToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}
</script>

<template>
  <div class="bg-red-50/10 font-jost h-full min-h-screen">
    <div class="intro-section relative" v-if="!videoReproduced">
      <video
        ref="videoRef"
        class="w-full h-screen object-cover"
        muted
        @ended="handleVideoEnd"
      >
        <source src="@/assets/videos/Render_1.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div v-if="showButterflyLogo" class="logo-butterfly" @click="startTheVideo">
        <img src="@/assets/images/img/butterfly.png" alt="Butterfly logo" />
      </div>
    </div>
    <main v-else class="">
      <HeaderNav />

      <HeroSection />

      <SeparadorSection>
        A todos los seres más queridos que forman parte de mi vida, quiero que celebren conmigo
        mis 15 años de vida.Porque su presencia, siempre será mi mejor regalo.
      </SeparadorSection>

      <SaveTheDate />

      <SeparadorSection>
        A todos los seres más queridos que forman parte de mi vida, quiero que celebren conmigo
        mis 15 años de vida.Porque su presencia, siempre será mi mejor regalo.
      </SeparadorSection>

      <CWMItinerario />

      <SeparadorSection>
        A todos los seres más queridos que forman parte de mi vida, quiero que celebren conmigo
        mis 15 años de vida.Porque su presencia, siempre será mi mejor regalo.
      </SeparadorSection>

      <SweetMemories />

      <SeparadorSection>
        A todos los seres más queridos que forman parte de mi vida, quiero que celebren conmigo
        mis 15 años de vida.Porque su presencia, siempre será mi mejor regalo.
      </SeparadorSection>

      <RSVP />

      <SeparadorSection>
        A todos los seres más queridos que forman parte de mi vida, quiero que celebren conmigo
        mis 15 años de vida.Porque su presencia, siempre será mi mejor regalo.
      </SeparadorSection>

      <SuggestedMusic />

      <SeparadorSection>
        A todos los seres más queridos que forman parte de mi vida, quiero que celebren conmigo
        mis 15 años de vida.Porque su presencia, siempre será mi mejor regalo.
      </SeparadorSection>

      <BackgroundMusic />

      <EventComments />

      <EventFooter />

    </main>
  </div>

  <button
    id="scrollToTopBtn"
    v-if="showScrollBtn"
    class="fixed w-10 h-10 bottom-5 right-5 bg-pink-300 border border-pink-400/50 text-white text-lg text-bold rounded-full shadow-lg hover:bg-pink-500/50 focus:outline-none"
    @click="handleMoveToTop"
  >
    ↑
  </button>
</template>

<style>
html,
body {
  margin: 0;
  width: 100%;
  height: 100%;
  background-color: white;
}

.logo-butterfly {
  width: 80%;
  position: absolute;
  top: 251px;
  left: 40px;
}

.logo-butterfly img {
  animation: butterfly-animate 2s infinite;
}

@keyframes butterfly-animate {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

@font-face {
  font-family: 'Jost';
  src: url('@/assets/fonts/Jost-VariableFont_wght.ttf') format('truetype');
}

@font-face {
  font-family: 'Monallesia';
  src: url('@/assets/fonts/monallesiascript.woff2') format('woff');
}

@font-face {
  font-family: 'Great Vibes';
  src: url('@/assets/fonts/GreatVibes-Regular.ttf') format('truetype');
}

section {
  scroll-margin-top: 80px;
}
</style>
