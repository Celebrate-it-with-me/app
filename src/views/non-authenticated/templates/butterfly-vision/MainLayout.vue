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
const desktopSrc = '/assets/videos/desktop_intro.mp4'

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
        <div v-if="false">
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
          <HeaderNav v-if="false" />

          <HeroSection class="main-section" v-if="false" />

          <SeparatorSection v-if="false">
            A todos los seres más queridos que forman parte de mi vida, quiero que celebren conmigo
            mis 15 años de vida. Porque su presencia, siempre será mi mejor regalo.
          </SeparatorSection>

          <SaveTheDate class="main-section" v-if="false" />

          <SeparatorSection v-if="false">
            Los recuerdos más hermosos nacen con las personas más especiales.
          </SeparatorSection>

          <CWMItinerario class="main-section" v-if="false" />

          <SeparatorSection v-if="false">
            ¡Prepárate para reír, bailar y celebrar como nunca!
          </SeparatorSection>

          <SweetMemories
            v-if="false"
            class="main-section"
            :mode="'presentation'"
          />

          <SeparatorSection
            v-if="false"
          >
            Gracias por ser parte de mi historia. Ahora celebremos juntos.
          </SeparatorSection>

          <RSVP class="main-section" />

          <SeparatorSection v-if="false">
            La música, las memorias y ustedes harán de esta noche mágica.
          </SeparatorSection>

          <SuggestedMusic class="main-section" v-if="false" />

          <SeparatorSection v-if="false">
            Que esta fiesta sea tan inolvidable como ustedes lo son para mí.
          </SeparatorSection>

          <EventComments
            v-if="false"

            origin="event"
            class="main-section"
          />

          <SeparatorSection v-if="false">
            Donde hay amor y alegría, el momento es perfecto.
          </SeparatorSection>

          <EventLocations v-if="false" />

          <SeparatorSection v-if="false">
            Esta noche no es solo una celebración, es el comienzo de una nueva etapa que quiero
            compartir con cada uno de ustedes. ¡Gracias por estar aquí!
          </SeparatorSection>

          <SwipeLeftIcon v-if="false" />

          <BackgroundMusic

            v-if="false"
            origin="event"
          />

          <EventFooter v-if="false" />
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
