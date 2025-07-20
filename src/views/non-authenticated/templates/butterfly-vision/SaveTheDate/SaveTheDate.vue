<script setup>
import { useTemplateStore } from '@/stores/useTemplateStore'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import SaveTheDateCountDown from '@/views/non-authenticated/templates/butterfly-vision/SaveTheDate/SaveTheDateCountDown.vue'
import SaveTheDateAddToCalendar from '@/views/non-authenticated/templates/butterfly-vision/SaveTheDate/SaveTheDateAddToCalendar.vue'
import { useParallaxBackground } from '@/composables/useParallaxBackground.js'

const templateStore = useTemplateStore()
const h2TitleRef = ref(null)
const isH2TitleInView = ref(false)
let observer

const saveTheDate = computed(() => templateStore.event?.saveTheDate)

// Init parallax background
useParallaxBackground('.std-parallax-bg')

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      isH2TitleInView.value = entry.isIntersecting
    })
  })

  if (h2TitleRef.value) {
    observer.observe(h2TitleRef.value)
  }
})

onUnmounted(() => {
  if (observer && h2TitleRef.value) {
    observer.unobserve(h2TitleRef.value)
  }
})
</script>

<template>
  <section id="sectionSTD" class="relative w-full min-h-screen z-0">
    <!-- Fondo Parallax -->
    <div
      class="std-parallax-bg absolute inset-0 bg-cover bg-center will-change-transform z-[-1] pointer-events-none h-full"
      style="background-image: linear-gradient(rgba(186, 167, 251, 0.8), rgba(186, 167, 251, 0.8)), url('/src/assets/images/SaveTheDate/savethedate_bg_5_2.png')"
    ></div>

    <!-- Contenido -->
    <div class="save-the-date w-full px-5 flex flex-col items-center justify-center relative z-10">
      <h2
        ref="h2TitleRef"
        class="text-6xl font-gvibes font-bold text-purple-middle text-center"
        :class="{ 'animate__animated animate__fadeInDown': isH2TitleInView }"
      >
        Save the Date
      </h2>

      <h3 class="text-2xl font-normal text-dark-blue text-center mt-2">
        Este es un día especial para nosotros, y queremos compartirlo contigo.
      </h3>

      <div class="std-countdown mt-10">
        <SaveTheDateCountDown
          :numbers="{
            font: 'jost',
            color: '#111827',
            size: '3rem',
            style: 'italic',
            weight: '300',
            letterSpacing: ''
          }"
          :text="{
            font: 'Great Vibes, cursive',
            color: '#111827',
            size: '1.25rem',
            style: 'normal',
            weight: '',
            letterSpacing: ''
          }"
        />
      </div>

      <div class="std-addToCalendar mt-10">
        <SaveTheDateAddToCalendar
          :button-style="{
            bgColor: 'transparent',
            fontColor: '#111827',
            hoverColor: '#111827',
            fontFamily: '',
            borderRadius: '8px',
            borderColor: '#111827'
          }"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.font-gvibes {
  font-family: 'Great Vibes', sans-serif;
}

.text-6xl {
  line-height: 1.4;
  padding: 0.2em;
}

.std-parallax-bg {
  will-change: transform;
  backface-visibility: hidden;
  transform-style: preserve-3d;
}
</style>
