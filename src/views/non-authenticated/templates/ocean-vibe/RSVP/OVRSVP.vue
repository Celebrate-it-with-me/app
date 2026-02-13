<script setup>
import { computed, reactive } from 'vue'
import { useTemplateStore } from '@/stores/publicEvents/useTemplateStore'
import CFCWMRSVPConfirmed from '@/views/non-authenticated/templates/cuban-flow/RSVP/CFCWMRSVPConfirmed.vue'
import OVRSVPTitles from '@/views/non-authenticated/templates/ocean-vibe/RSVP/OVRSVPTitles.vue'
import OVCWMRSVPComponent from '@/views/non-authenticated/templates/ocean-vibe/RSVP/OVCWMRSVPComponent.vue'

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
    class="w-full flex flex-col justify-evenly items-center py-20 relative overflow-hidden"
  >
    <!-- Background Decoration -->
    <div class="absolute inset-0 bg-gradient-to-b from-sky-50 via-white to-sky-50 -z-10"></div>
    <div
      class="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-sky-100/50 to-transparent -z-10"
    ></div>

    <div class="max-w-5xl mx-auto w-full px-4 flex flex-col items-center relative z-10">
      <OVRSVPTitles :title="rsvpConfig.title" :sub-title="rsvpConfig.subTitle" />
      <OVCWMRSVPComponent
        v-if="!rsvpCompleted"
        :form-title="rsvpConfig.formTitle"
        :rsvp-extra-box="rsvpConfig.rsvpExtraBox"
      />
      <CFCWMRSVPConfirmed v-else />
    </div>
  </div>
</template>
