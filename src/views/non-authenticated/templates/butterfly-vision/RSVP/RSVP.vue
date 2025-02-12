<script setup>

import { reactive } from 'vue'
import RSVPTitles from '@/views/non-authenticated/templates/butterfly-vision/RSVP/RSVPTitles.vue'
import CWMRSVPComponent from '@/views/non-authenticated/templates/butterfly-vision/RSVP/CWMRSVPComponent.vue'

const rsvpConfig = reactive({
  isEnabled: true,
  backgroundColor: 'transparent',
  title: 'R S V P',
  subTitle: 'Confirme su asistencia y la de sus acompañantes',
  formTitle: 'Asistiras?'
})

</script>

<template>
  <div
    v-if="rsvpConfig?.isEnabled"
    class="suggested-music w-full flex flex-col justify-between items-center pt-5 pr-20 pl-20 pb-20 h-screen"
    :style="{backgroundColor: rsvpConfig.backgroundColor}"
  >
    <RSVPTitles
      :title="rsvpConfig.title"
      :sub-title="rsvpConfig.subTitle"
    />

    <CWMRSVPComponent
      :form-title="rsvpConfig.formTitle"
    />
  </div>
</template>

<style scoped>

</style>
