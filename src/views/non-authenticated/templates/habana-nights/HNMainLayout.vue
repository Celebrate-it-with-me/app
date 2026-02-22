<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
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

import { habanaTokens } from './tokens'
import HNDressCode from '@/views/non-authenticated/templates/habana-nights/DressCode/HNDressCode.vue'

const cssVars = {
  '--hn-bg': habanaTokens.colors.bg,
  '--hn-surface': habanaTokens.colors.surface,
  '--hn-gold': habanaTokens.colors.gold,
  '--hn-coral': habanaTokens.colors.coral,
  '--hn-cream': habanaTokens.colors.cream,
  '--hn-muted': habanaTokens.colors.muted,
  // If you later add these to tokens, they’ll work immediately:
  '--hn-font-heading': habanaTokens.typography.heading,
  '--hn-font-body': habanaTokens.typography.body
}

const showScrollBtn = ref(false)
const videoReproduced = ref(false)
const showButterflyLogo = ref(true)
const videoInstance = templateRef('videoRef')
const eventStore = useTemplateStore()

const isMobile = ref(false)
const mobileSrc = new URL('@/assets/videos/mobile_intro.mp4', import.meta.url).href

const FONT_LINK_ID = 'hn-fonts'

// Main scroll container (because <main> is scrollable, not window)
const mainRef = templateRef('mainRef')

const onMainScroll = () => {
  const el = mainRef.value
  if (!el) return
  showScrollBtn.value = el.scrollTop > 200
}

onMounted(() => {
  isMobile.value = window.innerWidth < 768
  document.body.classList.remove('dark')

  // Attach scroll listener to <main>
  const el = mainRef.value
  if (el) {
    el.addEventListener('scroll', onMainScroll, { passive: true })
    onMainScroll()
  }

  if (document.getElementById(FONT_LINK_ID)) return

  const link = document.createElement('link')
  link.id = FONT_LINK_ID
  link.rel = 'stylesheet'
  link.href =
    'https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Allura&family=Montserrat:wght@400;500;600&display=swap'
  document.head.appendChild(link)
})

onUnmounted(() => {
  const el = mainRef.value
  if (el) el.removeEventListener('scroll', onMainScroll)

  const link = document.getElementById(FONT_LINK_ID)
  if (link) link.remove()
})

const startTheVideo = () => {
  showButterflyLogo.value = false
  if (videoInstance.value) videoInstance.value.play()
}

const handleVideoEnd = () => {
  videoReproduced.value = true
}

const handleMoveToTop = () => {
  const el = mainRef.value
  if (!el) return
  el.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}
</script>

<template>
  <div :style="cssVars" class="hn-theme h-full min-h-screen bg-[var(--hn-bg)] text-white">
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

      <main v-else ref="mainRef" class="">
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

        <HNDressCode />

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

    <button
      v-if="showScrollBtn"
      id="scrollToTopBtn"
      class="fixed w-10 h-10 bottom-5 right-5 bg-[var(--hn-coral)] border border-[color:rgba(212,175,55,0.45)] text-white text-lg font-bold rounded-full shadow-lg hover:bg-[var(--hn-gold)] hover:text-black focus:outline-none"
      type="button"
      @click="handleMoveToTop"
    >
      ↑
    </button>
  </div>
</template>

<style>
html,
body {
  margin: 0;
  width: 100%;
  height: 100%;
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

.hn-theme,
.hn-theme * {
  font-family: 'Cinzel', sans-serif !important;
}
.hn-heading {
  font-family: 'Cinzel', serif !important;
}
.hn-script {
  font-family: 'Allura', cursive !important;
}
</style>
