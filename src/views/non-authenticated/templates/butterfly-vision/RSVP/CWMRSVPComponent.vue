<script setup>
import CwmRsvpSteps from '@/views/non-authenticated/templates/butterfly-vision/RSVP/CWMRsvpSteps.vue'

defineProps({
  formTitle: {
    type: String,
    default: ''
  },
  rsvpExtraBox: {
    type: Object,
    required: false
  }
})

</script>

<template>
<section
  class="rsvp-section rounded-xl mt-5 mb-5 overflow-hidden w-full min-h-[680px]"
>

  <CwmRsvpSteps />
</section>
</template>

<style scoped>

</style>
