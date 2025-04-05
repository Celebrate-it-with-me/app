<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  subTitle: {
    type: String,
    default: ''
  }
})
</script>

<template>
<section class="rsvp-titles-section">
  <h2 class="text-5xl font-gvibes font-bold gap-10 text-purple-middle text-center">
    {{ title }}
  </h2>
  <h4 class="music-subtitle relative text-2xl font-normal text-dark-blue text-center moments-title">
    {{ subTitle }}
  </h4>
</section>
</template>

<style scoped>
.rsvp-titles-section {
  padding-top: 1rem;
  overflow: visible;
}

.rsvp-titles-section h2 {
  margin-top: 0.2em;
  line-height: 1.3;
  font-weight: bold;
}
</style>
