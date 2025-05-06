<script setup>

import { computed, reactive } from 'vue'
import RSVPTitles from '@/views/non-authenticated/templates/butterfly-vision/RSVP/RSVPTitles.vue'
import CWMRSVPComponent from '@/views/non-authenticated/templates/butterfly-vision/RSVP/CWMRSVPComponent.vue'
import { useTemplateStore } from '@/stores/useTemplateStore'
import CWMRSVPConfirmed from '@/views/non-authenticated/templates/butterfly-vision/RSVP/CWMRSVPConfirmed.vue'

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
  return templateStore.guest?.rsvpCompleted ?? false
})

</script>

<template>
  <div
    id="sectionRSVP"
    v-if="rsvpConfig?.isEnabled"
    class="w-full flex flex-col justify-evenly items-center pt-5 bg-[#baa7fb]"
  >
    <RSVPTitles
      :title="rsvpConfig.title"
      :sub-title="rsvpConfig.subTitle"
    />

    <CWMRSVPComponent
      v-if="!rsvpCompleted"
      :form-title="rsvpConfig.formTitle"
      :rsvp-extra-box="rsvpConfig.rsvpExtraBox"
    />
    <CWMRSVPConfirmed v-else />
  </div>
</template>
