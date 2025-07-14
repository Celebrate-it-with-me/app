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

const showScrollBtn = ref(false)
const videoReproduced = ref(false)
const showButterflyLogo = ref(true)
const videoInstance = templateRef('videoRef')

const isMobile = ref(false)
const mobileSrc = new URL('@/assets/videos/mobile_intro.mp4', import.meta.url).href

onMounted(() => {
  isMobile.value = window.innerWidth < 768
  document.body.classList.remove('dark')
  showHideScrollButton()

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.intersectionRatio > 0.5) {
        entry.target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }
    })
  }, {
    threshold: 0.5,
    rootMargin: '0px'
  })

  const sections = document.querySelectorAll('.main-section')
  sections.forEach(section => {
    observer.observe(section)
  })

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
      <transition name="fade" mode="out-in">
        <div v-if="!videoReproduced">
          <video
            ref="videoRef"
            class="w-full h-screen object-cover block"
            muted
            playsinline
            @ended="handleVideoEnd"
            @click="startTheVideo"
          >
            <source
              :src="mobileSrc"
              type="video/mp4"
            />
          </video>
        </div>
        <main v-else class="">
          <HeaderNav />

          <HeroSection class="main-section" />

          <SeparatorSection >
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
            ¡La fiesta está por comenzar! Prepárate para reír, bailar y disfrutar al máximo.
          </SeparatorSection>

          <SweetMemories
            class="main-section"
            :mode="'presentation'"
          />

          <SeparatorSection>
            Gracias por acompañarme en cada paso de mi historia, porque sin ti no sería la misma.
            Hoy, celebremos juntos este día inolvidable.
          </SeparatorSection>

          <RSVP class="main-section" />

          <SeparatorSection>
            La música, las memorias y ustedes harán de esta noche mágica.
          </SeparatorSection>

          <SuggestedMusic class="main-section"/>

          <SeparatorSection>
            Con música, recuerdos y su compañía, esta noche será mágica.
          </SeparatorSection>

          <DressCode class="main-section"/>

          <SeparatorSection>
            La elegancia en el vestir realza la belleza del momento compartido.
          </SeparatorSection>

          <EventComments
            origin="event"
            class="main-section"
          />

          <SeparatorSection>
            Donde hay amor y alegría, el momento es perfecto.
          </SeparatorSection>

          <EventLocations />

          <SeparatorSection >
            Esta noche no es solo una celebración, es el comienzo de una nueva etapa que quiero
            compartir con cada uno de ustedes. ¡Gracias por estar aquí!
          </SeparatorSection>

          <SwipeLeftIcon />

          <BackgroundMusic
            origin="event"
          />

          <EventFooter />
        </main>
      </transition>
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

.main-section {
  min-height: 100vh;
  scroll-snap-align: start;
}

main {
  scroll-snap-type: y proximity;
  overflow-y: auto;
  height: 100vh;
}

section {
  scroll-margin-top: 80px;
}


</style>
