<script setup>
import { onMounted, ref } from 'vue'
import { ArrowUp } from 'lucide-vue-next'
import { useTemplateStore } from '@/stores/useTemplateStore'
import OVHeaderNav from '@/views/non-authenticated/templates/ocean-vibe/OVHeaderNav.vue'
import OVHeroSection from '@/views/non-authenticated/templates/ocean-vibe/OVHeroSection.vue'
import OVSeparatorSection from '@/views/non-authenticated/templates/ocean-vibe/OVSeparatorSection.vue'
import OVSaveTheDate from '@/views/non-authenticated/templates/ocean-vibe/SaveTheDate/OVSaveTheDate.vue'
import OVCWMItinerario from '@/views/non-authenticated/templates/ocean-vibe/Itinerario/OVCWMItinerario.vue'
import OVSweetMemories from '@/views/non-authenticated/templates/ocean-vibe/SweetMemories/OVSweetMemories.vue'
import OVRSVP from '@/views/non-authenticated/templates/ocean-vibe/RSVP/OVRSVP.vue'
import OVSuggestedMusic from '@/views/non-authenticated/templates/ocean-vibe/SuggestedMusic/OVSuggestedMusic.vue'
import OVEventComments from '@/views/non-authenticated/templates/ocean-vibe/EventComments/OVEventComments.vue'
import OVEventLocations from '@/views/non-authenticated/templates/ocean-vibe/location/OVEventLocations.vue'
import OVSwipeLeftIcon from '@/views/non-authenticated/templates/ocean-vibe/SwipeLeftIcon/OVSwipeLeftIcon.vue'
import OVEventFooter from '@/views/non-authenticated/templates/ocean-vibe/EventFooter/OVEventFooter.vue'

const showScrollBtn = ref(false)
const videoReproduced = ref(false)
const eventStore = useTemplateStore()

const isMobile = ref(false)
const mobileSrc = new URL('@/assets/videos/carmita124.mp4', import.meta.url).href

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
      <div v-if="!videoReproduced" class="w-full h-[100svh] md:aspect-video md:h-auto">
        <video
          ref="videoRef"
          class="w-full h-full object-cover block"
          muted
          playsinline
          autoplay
          @ended="handleVideoEnd"
        >
          <source :src="mobileSrc" type="video/mp4" />
        </video>
      </div>
      <main v-else class="relative overflow-visible !scroll-snap-type-none">
        <OVHeaderNav />

        <OVHeroSection class="main-section" />

        <OVSeparatorSection>
          A las personas más especiales que han marcado mi camino, los invito a celebrar conmigo
          estos 15 años. Su compañía es el regalo más valioso que puedo recibir.
        </OVSeparatorSection>

        <OVSaveTheDate class="main-section" />

        <OVSeparatorSection>
          Los instantes más mágicos se viven al lado de quienes más queremos.
        </OVSeparatorSection>

        <OVCWMItinerario class="main-section" />

        <OVSeparatorSection>
          ¡Listos para una noche llena de alegría, baile y momentos inolvidables!
        </OVSeparatorSection>

        <OVSweetMemories class="main-section" :mode="'presentation'" />

        <OVSeparatorSection>
          Mil gracias por ser parte de mi camino. ¡Que comience la fiesta!
        </OVSeparatorSection>

        <OVRSVP class="main-section" />

        <OVSeparatorSection>
          Con buena música y su presencia, esta velada será simplemente espectacular.
        </OVSeparatorSection>

        <OVSuggestedMusic class="main-section" />

        <OVSeparatorSection>
          Deseo que esta celebración quede grabada en sus corazones tanto como en el mío.
        </OVSeparatorSection>

        <OVEventComments origin="event" class="main-section" />

        <OVSeparatorSection v-if="eventStore.hasLocation">
          Donde se comparte el amor y la risa, ahí es el lugar ideal.
        </OVSeparatorSection>

        <OVEventLocations v-if="eventStore.hasLocation" />

        <OVSeparatorSection>
          Más que una fiesta, es el inicio de una nueva aventura que me hace feliz compartir con
          ustedes. ¡Gracias por acompañarme!
        </OVSeparatorSection>

        <OVSwipeLeftIcon />

        <OVEventFooter />
      </main>
    </transition>
  </div>

  <button
    v-if="showScrollBtn"
    id="scrollToTopBtn"
    class="fixed z-50 w-12 h-12 bottom-6 right-6 flex items-center justify-center bg-gradient-to-r from-[#123B5A] via-[#2F6F8F] to-[#7FB9C9] text-white rounded-full shadow-xl hover:brightness-110 active:scale-90 transition-all focus:outline-none border border-white/20"
    @click="handleMoveToTop"
  >
    <ArrowUp class="w-6 h-6" />
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
