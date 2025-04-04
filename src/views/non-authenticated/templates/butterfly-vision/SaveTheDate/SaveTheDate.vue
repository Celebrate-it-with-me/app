<script setup>
import { useTemplateStore } from '@/stores/useTemplateStore'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import SaveTheDateCountDown from '@/views/non-authenticated/templates/butterfly-vision/SaveTheDate/SaveTheDateCountDown.vue'
import SaveTheDateAddToCalendar from '@/views/non-authenticated/templates/butterfly-vision/SaveTheDate/SaveTheDateAddToCalendar.vue'
import 'intersection-observer'

const templateStore = useTemplateStore()
const h2TitleRef = ref(null)
const isH2TitleInView = ref(false)
let observer

const saveTheDate = computed(() => {
  return templateStore.event?.saveTheDate
})

const generalStyles = computed(() => {
  let styles = {}

  if (saveTheDate.value.backgroundColor) {
    styles.backgroundColor = saveTheDate.value.backgroundColor
  }

  return styles
})

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      isH2TitleInView.value = entry.isIntersecting
    })
  })

  if(h2TitleRef.value) {
    observer.observe(h2TitleRef.value);
  }
})

onUnmounted(() => {
  if(observer && h2TitleRef.value) {
    observer.unobserve(h2TitleRef.value);
  }
})
</script>

<template>
  <div
    id="sectionSTD"
    v-if="saveTheDate?.isEnabled"
    class="parallax-container bg-[#baa7fb]"
  >
    <div
      class="save-the-date w-full p-5 h-screen"
    >
      <h2
        ref="h2TitleRef"
        class="text-6xl font-gvibes font-bold gap-10 text-purple-middle text-center z-10"
        :class="{ 'animate__animated animate__fadeInDown': isH2TitleInView }"
        v-if="saveTheDate.stdTitle"
      >
        {{ saveTheDate.stdTitle }}
      </h2>

      <h3
        class="text-2xl font-normal text-dark-blue z-10"
        v-if="saveTheDate.stdSubTitle"
      >
        {{ saveTheDate.stdSubTitle }}
      </h3>

      <div
        v-if="saveTheDate?.useCountdown"
        class="std-countdown mt-10  z-10"
      >
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

      <div
        v-if="saveTheDate?.useAddToCalendar"
        class="std-addToCalendar mt-10 z-10"
      >
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
  background-image: linear-gradient(rgba(186, 167, 251, 0.8), rgba(186, 167, 251, 0.8)),
  url('@/assets/images/SaveTheDate/savethedate_bg_5_2.png');
  background-repeat: no-repeat;
  background-size: cover;
  background-attachment: fixed;
  background-position: center;
}



.font-gvibes {
  font-family: 'Great Vibes', sans-serif;
}

.glow-gold-text {
  color: #FFD700; /* Gold */
  text-shadow:
    0 0 5px #FFD700,
    0 0 10px #FFA500,
    0 0 20px #FFD700,
    0 0 40px #FF8C00;
  font-weight: bold;
  letter-spacing: 1px;
  text-align: center;
}

.text-6xl {
  line-height: 1.4;
  padding: 0.2em;
}
</style>
