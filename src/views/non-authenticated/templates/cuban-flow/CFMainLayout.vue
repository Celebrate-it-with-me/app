<script setup>
import { onMounted, ref } from 'vue'
import { templateRef } from '@vueuse/core'
import CFHeaderNav from '@/views/non-authenticated/templates/cuban-flow/CFHeaderNav.vue'
import CFHeroSection from '@/views/non-authenticated/templates/cuban-flow/CFHeroSection.vue'
import CFSeparatorSection from '@/views/non-authenticated/templates/cuban-flow/CFSeparatorSection.vue'
import CFSaveTheDate from '@/views/non-authenticated/templates/cuban-flow/SaveTheDate/CFSaveTheDate.vue'
import CFCWMItinerario from '@/views/non-authenticated/templates/cuban-flow/Itinerario/CFCWMItinerario.vue'
import CFSweetMemories from '@/views/non-authenticated/templates/cuban-flow/SweetMemories/CFSweetMemories.vue'
import CFRSVP from '@/views/non-authenticated/templates/cuban-flow/RSVP/CFRSVP.vue'
import CFSuggestedMusic from '@/views/non-authenticated/templates/cuban-flow/SuggestedMusic/CFSuggestedMusic.vue'
import CFEventComments from '@/views/non-authenticated/templates/cuban-flow/EventComments/CFEventComments.vue'
import CFEventLocations from '@/views/non-authenticated/templates/cuban-flow/location/CFEventLocations.vue'
import CFSwipeLeftIcon from '@/views/non-authenticated/templates/cuban-flow/SwipeLeftIcon/CFSwipeLeftIcon.vue'
import CFEventFooter from '@/views/non-authenticated/templates/cuban-flow/EventFooter/CFEventFooter.vue'
import { useTemplateStore } from '@/stores/useTemplateStore'

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
      <div v-if="/*!videoReproduced*/false">
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
        <CFHeaderNav />

        <CFHeroSection class="main-section" />

        <CFSeparatorSection>
          A todos los seres más queridos que forman parte de mi vida, quiero que celebren conmigo
          mis 15 años de vida. Porque su presencia, siempre será mi mejor regalo.
        </CFSeparatorSection>

        <CFSaveTheDate class="main-section" />

        <CFSeparatorSection>
          Los recuerdos más hermosos nacen con las personas más especiales.
        </CFSeparatorSection>

        <CFCWMItinerario class="main-section" />

        <CFSeparatorSection>
          ¡Prepárate para reír, bailar y celebrar como nunca!
        </CFSeparatorSection>

        <CFSweetMemories class="main-section" :mode="'presentation'" />

        <CFSeparatorSection>
          Gracias por ser parte de mi historia. Ahora celebremos juntos.
        </CFSeparatorSection>

        <CFRSVP class="main-section" />

        <CFSeparatorSection>
          La música, las memorias y ustedes harán de esta noche mágica.
        </CFSeparatorSection>

        <CFSuggestedMusic class="main-section" />

        <CFSeparatorSection>
          Que esta fiesta sea tan inolvidable como ustedes lo son para mí.
        </CFSeparatorSection>

        <CFEventComments origin="event" class="main-section" />

        <CFSeparatorSection v-if="eventStore.hasLocation">
          Donde hay amor y alegría, el momento es perfecto.
        </CFSeparatorSection>

        <CFEventLocations v-if="eventStore.hasLocation" />

        <CFSeparatorSection>
          Esta noche no es solo una celebración, es el comienzo de una nueva etapa que quiero
          compartir con cada uno de ustedes. ¡Gracias por estar aquí!
        </CFSeparatorSection>

        <CFSwipeLeftIcon />

        <CFEventFooter />
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
