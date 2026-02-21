<script setup>
import CFCWMRsvpSteps from '@/views/non-authenticated/templates/habana-nights/RSVP/CFCWMRsvpSteps.vue'

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
    <CFCWMRsvpSteps />
  </section>
</template>

<style scoped></style>
