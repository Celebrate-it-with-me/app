<script setup>
import OVCWMRsvpSteps from '@/views/non-authenticated/templates/ocean-vibe/RSVP/OVCWMRsvpSteps.vue'

defineProps({
  formTitle: {
    type: String,
    default: ''
  },
  rsvpExtraBox: {
    type: Object,
    required: false,
    default: () => {
      return {}
    }
  }
})
</script>

<template>
  <section class="rsvp-section w-full flex justify-center items-center">
    <OVCWMRsvpSteps />
  </section>
</template>

<style scoped></style>
