<script setup>
defineProps({
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
  <section class="rsvp-titles-section text-center mb-8">
    <h2
      class="text-5xl md:text-6xl font-gvibes font-bold bg-gradient-to-l from-blue-800 to-red-800 bg-clip-text text-transparent pb-2"
    >
      {{ title }}
    </h2>
    <h4 class="text-xl md:text-2xl font-normal text-gray-600 mt-2">
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
