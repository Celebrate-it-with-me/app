<script setup>
import HNCWMRsvpSteps from '@/views/non-authenticated/templates/habana-nights/RSVP/HNCWMRsvpSteps.vue'

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
    <HNCWMRsvpSteps />
  </section>
</template>

<style scoped></style>
