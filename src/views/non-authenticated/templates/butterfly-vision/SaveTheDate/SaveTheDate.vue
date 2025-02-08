<script setup>
import { useTemplateStore } from '@/stores/useTemplateStore'
import { computed } from 'vue'
import STDCountDown from '@/components/authenticated/save-the-date/STDCountDown.vue'
import SaveTheDateCountDown from '@/views/non-authenticated/templates/butterfly-vision/SaveTheDate/SaveTheDateCountDown.vue'
import STDAddToCalendar from '@/components/authenticated/save-the-date/STDAddToCalendar.vue'
import SaveTheDateAddToCalendar
  from '@/views/non-authenticated/templates/butterfly-vision/SaveTheDate/SaveTheDateAddToCalendar.vue'

const templateStore = useTemplateStore()

const saveTheDate = computed(() => {
  return templateStore.event?.saveTheDate
})


const generalStyles = computed(() => {
  let styles = {}

  if (saveTheDate.value.backgroundColor) {
    styles.backgroundColor = saveTheDate.value.backgroundColor
    //styles.backgroundImage = `url(${saveTheDate.value?.imageUrl})`
  }

  return styles
})
</script>

<template>
  <div
    v-if="saveTheDate?.isEnabled"
    class="save-the-date w-full h-full flex flex-col justify-center items-center p-20 h-screen mt-10"
    :style="generalStyles"
  >
    <h2 class="text-6xl font-gvibes font-bold gap-10 gradient-text" v-if="saveTheDate.stdTitle">
      {{ saveTheDate.stdTitle }}
    </h2>

    <h3 class="text-2xl font-normal text-gray-600/70" v-if="saveTheDate.stdSubTitle">
      {{ saveTheDate.stdSubTitle }}
    </h3>

    <div v-if="saveTheDate?.useCountdown" class="std-countdown mt-10">
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
</template>

<style>
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

.save-the-date {
  overflow: visible;
}

.text-6xl {
  line-height: 1.4;
  padding: 0.2em;
}
</style>
