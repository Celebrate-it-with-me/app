<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { templateRef } from '@vueuse/core'

import { useTemplateStore } from '@/stores/publicEvents/useTemplateStore'
import { useRevealOnScroll } from '@/views/non-authenticated/templates/composables/useRevealOnScroll'

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
import HNDressCode from '@/views/non-authenticated/templates/habana-nights/DressCode/HNDressCode.vue'
import HNBackgroundMusic from '@/views/non-authenticated/templates/habana-nights/BackgroundMusic/HNBackgroundMusic.vue'

import { habanaTokens } from './tokens'

const cssVars = {
  '--hn-bg': habanaTokens.colors.bg,
  '--hn-surface': habanaTokens.colors.surface,
  '--hn-gold': habanaTokens.colors.gold,
  '--hn-coral': habanaTokens.colors.coral,
  '--hn-cream': habanaTokens.colors.cream,
  '--hn-muted': habanaTokens.colors.muted,
  '--hn-font-heading': habanaTokens.typography.heading,
  '--hn-font-body': habanaTokens.typography.body
}

const showScrollBtn = ref(false)
const videoReproduced = ref(false)
const showIntroOverlay = ref(true)
const videoInstance = templateRef('videoRef')
const eventStore = useTemplateStore()

const mobileSrc = new URL('@/assets/videos/Intro_6044.mp4', import.meta.url).href

const FONT_LINK_ID = 'hn-fonts'
const mainRef = templateRef('mainRef')

const onMainScroll = () => {
  const el = mainRef.value
  if (!el) return
  showScrollBtn.value = el.scrollTop > 200
}

let stopReveal = null

onMounted(() => {
  document.body.classList.remove('dark')

  const el = mainRef.value
  if (el) {
    el.addEventListener('scroll', onMainScroll, { passive: true })
    onMainScroll()
  }

  if (!document.getElementById(FONT_LINK_ID)) {
    const link = document.createElement('link')
    link.id = FONT_LINK_ID
    link.rel = 'stylesheet'
    link.href =
      'https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Allura&family=Montserrat:wght@400;500;600&display=swap'
    document.head.appendChild(link)
  }

  if (el) {
    stopReveal = useRevealOnScroll({ rootEl: el })
  }
})

onUnmounted(() => {
  const el = mainRef.value
  if (el) el.removeEventListener('scroll', onMainScroll)

  const link = document.getElementById(FONT_LINK_ID)
  if (link) link.remove()

  if (stopReveal) stopReveal()
})

const startTheVideo = () => {
  showIntroOverlay.value = false
  if (videoInstance.value) {
    videoInstance.value.play()
  }
}

const handleVideoEnd = () => {
  videoReproduced.value = true
}

const handleMoveToTop = () => {
  const el = mainRef.value
  if (!el) return
  el.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div :style="cssVars" class="hn-theme h-full min-h-screen bg-[var(--hn-bg)] text-white">
    <transition name="fade" mode="out-in">
      <!-- ================= INTRO ================= -->
      <div v-if="!videoReproduced" class="relative w-full h-screen bg-black overflow-hidden">
        <video
          ref="videoRef"
          class="w-full h-screen object-cover"
          muted
          playsinline
          @ended="handleVideoEnd"
        >
          <source :src="mobileSrc" type="video/mp4" />
        </video>

        <!-- Cinematic Overlay -->
        <div v-if="showIntroOverlay" class="hn-intro-overlay" @click="startTheVideo">
          <div class="hn-intro-content">
            <h1 class="hn-intro-name">ISABELLA</h1>
            <div class="hn-intro-xv">XV</div>
            <div class="hn-intro-divider"></div>
            <p class="hn-intro-start">Toque para comenzar</p>
          </div>
        </div>
      </div>

      <!-- ================= MAIN SITE ================= -->
      <main v-else ref="mainRef">
        <HNHeaderNav />
        <HNHeroSection class="main-section" />
        <HNSeparatorSection>
          Hay momentos en la vida que son especiales por sí solos...
        </HNSeparatorSection>

        <HNSaveTheDate class="main-section" />
        <HNCWMItinerario class="main-section" />
        <HNSweetMemories class="main-section" :mode="'presentation'" />
        <HNRSVP class="main-section" />
        <HNSuggestedMusic class="main-section" />
        <HNEventComments origin="event" class="main-section" />
        <HNDressCode />
        <HNEventLocations v-if="eventStore.hasLocation" />
        <HNEventFooter />
        <HNBackgroundMusic />
      </main>
    </transition>

    <button
      v-if="showScrollBtn"
      class="fixed z-50 w-10 h-10 bottom-5 right-5 bg-[var(--hn-coral)] border border-[color:rgba(212,175,55,0.45)] text-white text-lg font-bold rounded-full shadow-lg"
      type="button"
      @click="handleMoveToTop"
    >
      ↑
    </button>
  </div>
</template>

<style>
.hn-intro-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.95) 70%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.6s ease;
}

.hn-intro-content {
  text-align: center;
}

.hn-intro-name {
  font-family: 'Cinzel', serif;
  font-size: clamp(2.5rem, 8vw, 4rem);
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: rgba(248, 241, 231, 0.95);
}

.hn-intro-xv {
  margin-top: 0.75rem;
  font-family: 'Cinzel', serif;
  font-size: 1.25rem;
  letter-spacing: 0.4em;
  color: var(--hn-gold);
}

.hn-intro-divider {
  width: 80px;
  height: 2px;
  margin: 1.2rem auto 0;
  background: linear-gradient(90deg, transparent, var(--hn-gold), transparent);
}

.hn-intro-start {
  margin-top: 1.2rem;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.85rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.9);
}
</style>
