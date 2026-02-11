<script setup lang="ts">
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
  <section class="rsvp-titles-section text-center mb-10">
    <h2
      class="text-5xl md:text-7xl font-gvibes font-bold bg-gradient-to-r from-[#123B5A] via-[#2F6F8F] to-[#7FB9C9] bg-clip-text text-transparent pb-2 drop-shadow-sm"
    >
      {{ title }}
    </h2>
    <h4 class="text-xl md:text-2xl font-medium text-slate-700 mt-3 max-w-2xl mx-auto">
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
