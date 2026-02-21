<script setup>
import { computed, reactive } from 'vue'
import { useTemplateStore } from '@/stores/publicEvents/useTemplateStore'
import HNRSVPTitles from '@/views/non-authenticated/templates/habana-nights/RSVP/HNRSVPTitles.vue'
import HNCWMRSVPComponent from '@/views/non-authenticated/templates/habana-nights/RSVP/HNCWMRSVPComponent.vue'
import HNCWMRSVPConfirmed from '@/views/non-authenticated/templates/habana-nights/RSVP/HNCWMRSVPConfirmed.vue'

const rsvpConfig = reactive({
  isEnabled: true,
  backgroundColor: 'transparent',
  title: 'R S V P',
  subTitle: 'Confirme su asistencia y la de sus acompañantes',
  formTitle: 'Asistiras?',
  rsvpExtraBox: {
    isEnabled: true,
    title: 'Mis Quince',
    description: `My Quinceañera is on September 27, 2025, and I’d be delighted to celebrate with you!
                  Come ready to dance, smile, and enjoy the party. Please confirm by September 20, 2025.`
  }
})

const templateStore = useTemplateStore()

const rsvpCompleted = computed(() => {
  return templateStore.guest?.rsvpStatusDate !== null
})
</script>

<template>
  <div
    v-if="rsvpConfig?.isEnabled"
    id="sectionRSVP"
    class="w-full flex flex-col justify-evenly items-center py-16 bg-gradient-to-br from-red-800/15 via-white to-blue-800/15"
  >
    <div class="max-w-5xl mx-auto w-full px-4 flex flex-col items-center">
      <HNRSVPTitles :title="rsvpConfig.title" :sub-title="rsvpConfig.subTitle" />
      <HNCWMRSVPComponent
        v-if="!rsvpCompleted"
        :form-title="rsvpConfig.formTitle"
        :rsvp-extra-box="rsvpConfig.rsvpExtraBox"
      />
      <HNCWMRSVPConfirmed v-else />
    </div>
  </div>
</template>
