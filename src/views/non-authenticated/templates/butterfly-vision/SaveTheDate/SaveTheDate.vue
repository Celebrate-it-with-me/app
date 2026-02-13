<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import SaveTheDateCountDown from '@/views/non-authenticated/templates/butterfly-vision/SaveTheDate/SaveTheDateCountDown.vue'
import SaveTheDateAddToCalendar from '@/views/non-authenticated/templates/butterfly-vision/SaveTheDate/SaveTheDateAddToCalendar.vue'

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
    <div class="save-the-date w-full p-5 h-screen">
      <h2
        v-if="true"
        ref="h2TitleRef"
        class="text-6xl font-gvibes font-bold gap-10 text-purple-middle text-center z-10"
        :class="{ 'animate__animated animate__fadeInDown': isH2TitleInView }"
      >
        Save the Date
      </h2>

      <h3 v-if="true" class="text-2xl font-normal text-dark-blue z-10 text-center">
        <!--{{ saveTheDate.stdSubTitle }}-->
        Este es un dia especial para nosotros, y queremos compartirlo contigo.
      </h3>

      <div class="std-countdown mt-10 z-10">
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

      <div class="std-addToCalendar mt-10 z-10">
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

.save-the-date {
  position: relative;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
}

.save-the-date::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(186, 167, 251, 0.8), rgba(186, 167, 251, 0.8)),
    url('@/assets/images/SaveTheDate/savethedate_bg_5_2.png');
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
