<script setup>
import { onMounted, ref } from 'vue'
import HeaderNav from '@/views/non-authenticated/templates/butterfly-vision/HeaderNav.vue'
import HeroSection from '@/views/non-authenticated/templates/butterfly-vision/HeroSection.vue'
import SaveTheDate from '@/views/non-authenticated/templates/butterfly-vision/SaveTheDate/SaveTheDate.vue'
import SweetMemories from '@/views/non-authenticated/templates/butterfly-vision/SweetMemories/SweetMemories.vue'
import SuggestedMusic from '@/views/non-authenticated/templates/butterfly-vision/SuggestedMusic/SuggestedMusic.vue'
import RSVP from '@/views/non-authenticated/templates/butterfly-vision/RSVP/RSVP.vue'
import EventFooter from '@/views/non-authenticated/templates/butterfly-vision/EventFooter/EventFooter.vue'
import { templateRef } from '@vueuse/core'
import SeparatorSection from '@/views/non-authenticated/templates/butterfly-vision/SeparatorSection.vue'
import CWMItinerario from '@/views/non-authenticated/templates/butterfly-vision/Itinerario/CWMItinerario.vue'
import DressCode from '@/views/non-authenticated/templates/butterfly-vision/DressCode/DressCode.vue'
import EventComments from '@/components/authenticated/event-comments/EventComments/EventComments.vue'
import SwipeLeftIcon from '@/views/non-authenticated/templates/butterfly-vision/SwipeLeftIcon/SwipeLeftIcon.vue'
import EventLocations from '@/views/non-authenticated/templates/butterfly-vision/location/EventLocations.vue'
import BackgroundMusic from '@/views/non-authenticated/templates/butterfly-vision/BackgroundMusic/BackgroundMusic.vue'

const videoReproduced = ref(false)
const showButterflyLogo = ref(true)
const showOverlay = ref(true)
const videoInstance = templateRef('videoRef')
const isIOS = ref(false)
const isMobile = ref(false)
const mobileSrc = new URL('@/assets/videos/mobile_intro.mp4', import.meta.url).href

onMounted(() => {
  isIOS.value = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
  isMobile.value = window.innerWidth < 768
  document.body.classList.remove('dark')

  if (videoInstance.value) {
    videoInstance.value.load()
    videoInstance.value.addEventListener('canplaythrough', () => {
      if (videoInstance.value.paused) {
        videoInstance.value.currentTime = 0.1
      }
    })
  }
})

const startTheVideo = () => {
  showButterflyLogo.value = false
  showOverlay.value = false

  if (videoInstance.value) {
    const playPromise = videoInstance.value.play()

    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error("Error reproduciendo video:", error)
        showOverlay.value = true
      })
    }
  }
}

const handleVideoEnd = () => {
  videoReproduced.value = true
}
</script>

<template>
  <div class="bg-red-50/10 font-jost h-full min-h-screen">
    <transition name="fade" mode="out-in">
      <div v-if="!videoReproduced" class="relative bg-black h-screen">
        <video
          ref="videoRef"
          class="w-full h-screen object-cover block"
          muted
          playsinline
          preload="auto"
          @ended="handleVideoEnd"
          @click="startTheVideo"
        >
          <source :src="mobileSrc" type="video/mp4" />
        </video>

        <div
          v-if="showOverlay"
          class="absolute inset-x-0 bottom-0 mb-8 flex flex-col items-center justify-center cursor-pointer z-20"
          @click="startTheVideo"
        >
          <img src="@/assets/images/img/hand-tap.svg" alt="Tap icon" class="w-16 h-16 animate-pulse" />
          <p class="text-white text-xl font-semibold mt-2 text-center text-shadow">Click para empezar</p>
        </div>
      </div>
      <main v-else>
        <HeaderNav />
        <HeroSection class="main-section" />
        <SeparatorSection class="relative z-20">
          A todos los seres queridos que llenan mi vida de amor y alegría:
          Me encantaría que me acompañen a celebrar un momento muy especial, mis 15 años.
          Su presencia será, sin duda, el mejor regalo que podría recibir.
        </SeparatorSection>
        <SaveTheDate class="main-section" />
        <SeparatorSection>
          Quienes ocupan un lugar especial en el corazón, crean recuerdos que duran para siempre.
        </SeparatorSection>
        <CWMItinerario class="main-section" />
        <SeparatorSection>
          ¡Sé puntual!
          El itinerario del evento puede variar sin previo aviso.
          Tu presencia a tiempo es muy importante para no perderte ningún momento especial.
        </SeparatorSection>
        <SweetMemories class="main-section" :mode="'presentation'" />
        <SeparatorSection>
          Gracias por acompañarme en cada paso de mi historia, porque sin ti no sería la misma.
          Hoy, celebremos juntos este día inolvidable.
        </SeparatorSection>
        <RSVP class="main-section" />
        <SeparatorSection>
          La música, las memorias y ustedes harán de esta noche mágica.
        </SeparatorSection>
        <SuggestedMusic class="main-section" />
        <SeparatorSection>
          ¡Prepara tus mejores pasos! <br />
          Esta fiesta se baila de principio a fin.
        </SeparatorSection>
        <DressCode class="main-section" />
        <SeparatorSection>
          La elegancia en el vestir realza la belleza del momento compartido.
        </SeparatorSection>
        <EventComments origin="event" class="main-section" />
        <SeparatorSection>
          Donde hay amor y alegría, el momento es perfecto.
        </SeparatorSection>
        <EventLocations />
        <SeparatorSection>
          Esta noche no es solo una celebración, es el comienzo de una nueva etapa que quiero
          compartir con cada uno de ustedes. ¡Gracias por estar aquí!
        </SeparatorSection>
        <SwipeLeftIcon />
        <BackgroundMusic origin="event" />
        <EventFooter />
      </main>
    </transition>
  </div>
</template>

<style>
html,
body {
  margin: 0;
  width: 100%;
  height: 100%;
  background-color: white;
}

.logo-butterfly img {
  animation: butterfly-animate 2s infinite;
}

@keyframes butterfly-animate {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
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

.text-shadow {
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
}

section {
  scroll-margin-top: 80px;
}

.main-section {
  min-height: 100vh;
  scroll-snap-align: start;
}

main {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
