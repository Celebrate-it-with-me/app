<script setup>
import { onMounted, ref } from 'vue'
import { templateRef } from '@vueuse/core'

import { useTemplateStore } from '@/stores/publicEvents/useTemplateStore'
import HNEventFooter from '@/views/non-authenticated/templates/habana-nights/EventFooter/HNEventFooter.vue'
import HNSwipeLeftIcon from '@/views/non-authenticated/templates/habana-nights/SwipeLeftIcon/HNSwipeLeftIcon.vue'
import HNSeparatorSection from '@/views/non-authenticated/templates/habana-nights/HNSeparatorSection.vue'
import HNEventLocations from '@/views/non-authenticated/templates/habana-nights/location/HNEventLocations.vue'
import HNEventComments from '@/views/non-authenticated/templates/habana-nights/EventComments/HNEventComments.vue'
import HNSuggestedMusic from '@/views/non-authenticated/templates/habana-nights/SuggestedMusic/HNSuggestedMusic.vue'
import HNRSVP from '@/views/non-authenticated/templates/habana-nights/RSVP/HNRSVP.vue'
import HNSweetMemories from '@/views/non-authenticated/templates/habana-nights/SweetMemories/HNSweetMemories.vue'
import HNCWMItinerario from '@/views/non-authenticated/templates/habana-nights/Itinerario/HNCWMItinerario.vue'
import HNSaveTheDate from '@/views/non-authenticated/templates/habana-nights/SaveTheDate/HNSaveTheDate.vue'
import HNHeroSection from '@/views/non-authenticated/templates/habana-nights/HNHeroSection.vue'
import HNHeaderNav from '@/views/non-authenticated/templates/habana-nights/HNHeaderNav.vue'

const showScrollBtn = ref(false)
const videoReproduced = ref(false)
const showButterflyLogo = ref(true)
const videoInstance = templateRef('videoRef')
const eventStore = useTemplateStore()

const isMobile = ref(false)
const mobileSrc = new URL('@/assets/videos/mobile_intro.mp4', import.meta.url).href

onMounted(() => {
  isMobile.value = window.innerWidth < 768
  document.body.classList.remove('dark')
  showHideScrollButton()

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        // Only auto-scroll if it's a section entry and we're not inside a form/input
        if (entry.intersectionRatio > 0.5 && !document.activeElement?.closest('form')) {
          entry.target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
        }
      })
    },
    {
      threshold: 0.5,
      rootMargin: '0px'
    }
  )

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
      <div v-if="/*!videoReproduced*/ false">
        <video
          ref="videoRef"
          class="w-full h-screen object-cover block"
          muted
          playsinline
          @ended="handleVideoEnd"
          @click="startTheVideo"
        >
          <source :src="mobileSrc" type="video/mp4" />
        </video>
      </div>
      <main v-else class="">
        <HNHeaderNav />

        <HNHeroSection class="main-section" />

        <HNSeparatorSection>
          A todos los seres más queridos que forman parte de mi vida, quiero que celebren conmigo
          mis 15 años de vida. Porque su presencia, siempre será mi mejor regalo.
        </HNSeparatorSection>

        <HNSaveTheDate class="main-section" />

        <HNSeparatorSection>
          Los recuerdos más hermosos nacen con las personas más especiales.
        </HNSeparatorSection>

        <HNCWMItinerario class="main-section" />

        <HNSeparatorSection>
          ¡Prepárate para reír, bailar y celebrar como nunca!
        </HNSeparatorSection>

        <HNSweetMemories class="main-section" :mode="'presentation'" />

        <HNSeparatorSection>
          Gracias por ser parte de mi historia. Ahora celebremos juntos.
        </HNSeparatorSection>

        <HNRSVP class="main-section" />

        <HNSeparatorSection>
          La música, las memorias y ustedes harán de esta noche mágica.
        </HNSeparatorSection>

        <HNSuggestedMusic class="main-section" />

        <HNSeparatorSection>
          Que esta fiesta sea tan inolvidable como ustedes lo son para mí.
        </HNSeparatorSection>

        <HNEventComments origin="event" class="main-section" />

        <HNSeparatorSection v-if="eventStore.hasLocation">
          Donde hay amor y alegría, el momento es perfecto.
        </HNSeparatorSection>

        <HNEventLocations v-if="eventStore.hasLocation" />

        <HNSeparatorSection>
          Esta noche no es solo una celebración, es el comienzo de una nueva etapa que quiero
          compartir con cada uno de ustedes. ¡Gracias por estar aquí!
        </HNSeparatorSection>

        <HNSwipeLeftIcon />

        <HNEventFooter />
      </main>
    </transition>
  </div>

  <button
    v-if="showScrollBtn"
    id="scrollToTopBtn"
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
