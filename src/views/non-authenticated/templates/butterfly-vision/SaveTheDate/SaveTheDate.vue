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
      console.log(isH2TitleInView.value)
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
    v-if="saveTheDate?.isEnabled"
    class="parallax-container"
    :style="generalStyles"
  >
    <div
      class="save-the-date w-full flex flex-col justify-center items-center p-5 h-screen"
    >
      <h2
        ref="h2TitleRef"
        class="text-6xl font-gvibes font-bold gap-10 gradient-text"
        :class="{ 'animate__animated animate__fadeInDown': isH2TitleInView }"
        v-if="saveTheDate.stdTitle"
      >
        {{ saveTheDate.stdTitle }}
      </h2>

      <h3
        class="text-2xl font-normal text-gray-600/70"
        v-if="saveTheDate.stdSubTitle"
        :style="{transform: `translateY(${scrollYModifier}px)`}"
      >
        {{ saveTheDate.stdSubTitle }}
      </h3>

      <div
        v-if="saveTheDate?.useCountdown"
        class="std-countdown mt-10"
        :style="{transform: `translateX(${-scrollYModifier * 0.5}px)`}"
      >
        <SaveTheDateCountDown
          :numbers="{
          font: 'jost',
          color: '#8e57bd',
          size: '3rem',
          style: 'italic',
          weight: '300',
          letterSpacing: ''
        }"
          :text="{
          font: 'Great Vibes, cursive',
          color: 'black',
          size: '1.25rem',
          style: 'normal',
          weight: '',
          letterSpacing: ''
        }"
        />
      </div>

      <div
        v-if="saveTheDate?.useAddToCalendar"
        class="std-addToCalendar mt-10"
        :style="{transform: `translateX(${scrollYModifier * 0.3}px)`}"
      >
        <SaveTheDateAddToCalendar
          :button-style="{
          bgColor: 'transparent',
          fontColor: '#8e57bd',
          hoverColor: '#8e57bd',
          fontFamily: '',
          borderRadius: '8px',
          borderColor: '#8e57bd'
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
}

.font-gvibes {
  font-family: 'Great Vibes', sans-serif;
}

.gradient-text {
  background-image: linear-gradient(to right, #8e57bd, #dba3ff, #f9d865);
  -webkit-background-clip: text;
  color: transparent;
  overflow: visible;
  text-align: center;
}

.text-6xl {
  line-height: 1.4;
  padding: 0.2em;
}
</style>
