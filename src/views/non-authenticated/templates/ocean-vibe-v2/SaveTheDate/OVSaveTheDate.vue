<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import OVSaveTheDateCountDown from '@/views/non-authenticated/templates/ocean-vibe/SaveTheDate/OVSaveTheDateCountDown.vue'
import OVSaveTheDateAddToCalendar from '@/views/non-authenticated/templates/ocean-vibe/SaveTheDate/OVSaveTheDateAddToCalendar.vue'

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
    <div class="save-the-date-OV w-full p-5 h-screen">
      <h2
        v-if="true"
        ref="h2TitleRef"
        class="text-6xl font-gvibes font-bold gap-10 text-[#E6F4FF] text-glow-icy-blue text-center z-10"
        :class="{ 'animate__animated animate__fadeInDown': isH2TitleInView }"
      >
        Reserve esta fecha
      </h2>

      <h3 v-if="true" class="text-2xl font-normal text-[#E6F4FF]/90 z-10 text-center">
        <!--{{ saveTheDate.stdSubTitle }}-->
        Hoy es un día muy especial para nosotros y queremos compartirlo contigo.
      </h3>

      <div class="std-countdown mt-10 z-10">
        <OVSaveTheDateCountDown
          :numbers="{
            font: 'jost',
            color: '#E6F4FF',
            size: '3rem',
            style: 'normal',
            weight: '600',
            letterSpacing: '0.05em',
            shadow: '0 0 15px rgba(230, 244, 255, 0.4)'
          }"
          :text="{
            font: 'Great Vibes, cursive',
            color: '#E6F4FF',
            size: '1.25rem',
            style: 'normal',
            weight: '400',
            letterSpacing: '0.05em',
            shadow: '0 0 8px rgba(230, 244, 255, 0.3)'
          }"
        />
      </div>

      <div class="std-addToCalendar mt-10 z-10">
        <OVSaveTheDateAddToCalendar
          :button-style="{
            bgColor: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)',
            fontColor: '#062336',
            hoverColor: '#062336',
            fontFamily: '',
            borderRadius: '50px',
            borderColor: 'transparent',
            boxShadow:
              '0 4px 15px rgba(255, 255, 255, 0.3), inset 0 0 10px rgba(255, 255, 255, 0.5)',
            transition: 'all 0.3s ease'
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

.save-the-date-OV {
  position: relative;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
}

.save-the-date-OV::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(to bottom, rgba(6, 35, 54, 0.65), rgba(6, 35, 54, 0.45)),
    url('@/assets/images/SaveTheDate/bg_ocean2.jpg');
  background-repeat: no-repeat;
  background-size: cover;
  background-attachment: fixed;
  background-position: center;
}

.font-gvibes {
  font-family: 'Great Vibes', sans-serif;
}

.text-glow-icy-blue {
  text-shadow: 0 0 12px rgba(230, 244, 255, 0.6);
}

.text-6xl {
  line-height: 1.4;
  padding: 0.2em;
}
</style>
