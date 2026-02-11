<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import CFSaveTheDateAddToCalendar from '@/views/non-authenticated/templates/cuban-flow/SaveTheDate/CFSaveTheDateAddToCalendar.vue'
import CFSaveTheDateCountDown from '@/views/non-authenticated/templates/cuban-flow/SaveTheDate/CFSaveTheDateCountDown.vue'

const h2TitleRef = ref(null)
const isH2TitleInView = ref(false)
let observer

onMounted(() => {
  observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
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
  <div id="sectionSTD" class="parallax-container bg-[#baa7fb]">
    <div class="save-the-date-CF w-full p-5 h-screen">
      <h2
        v-if="true"
        ref="h2TitleRef"
        class="text-6xl font-gvibes font-bold gap-10 text-transparent bg-clip-text bg-gradient-to-r from-red-800 to-blue-800 text-center z-10"
        :class="{ 'animate__animated animate__fadeInDown': isH2TitleInView }"
      >
        Guarde la Fecha
      </h2>

      <h3 v-if="true" class="text-2xl font-normal text-dark-blue z-10 text-center">
        <!--{{ saveTheDate.stdSubTitle }}-->
        Este es un momento especial para nosotros y queremos celebrarlo contigo.
      </h3>

      <div class="std-countdown mt-10 z-10">
        <CFSaveTheDateCountDown
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

      <div class="std-addToCalendar mt-10 z-10">
        <CFSaveTheDateAddToCalendar
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
  </div>
</template>

<style>
.parallax-container {
  background-attachment: fixed;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  min-height: 100vh;
  height: 100%;
  width: 100%;
  position: relative;
}

.save-the-date-CF {
  position: relative;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
}

.save-the-date-CF::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(186, 167, 251, 0.8), rgba(186, 167, 251, 0.8)),
    url('@/assets/images/SaveTheDate/bg_palm3.jpg');
  background-repeat: no-repeat;
  background-size: cover;
  background-attachment: fixed;
  background-position: center;
}

.font-gvibes {
  font-family: 'Great Vibes', sans-serif;
}

.text-6xl {
  line-height: 1.4;
  padding: 0.2em;
}
</style>
