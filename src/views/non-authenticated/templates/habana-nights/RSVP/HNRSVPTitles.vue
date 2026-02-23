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
      class="text-5xl md:text-6xl font-['Cinzel',serif] font-bold text-[#D4AF37] pb-2 tracking-wide"
    >
      {{ title }}
    </h2>
    <div
      class="mt-3 w-24 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent mx-auto"
    ></div>
    <h4
      class="text-base md:text-lg font-['Montserrat',sans-serif] font-normal text-[#F8F1E7]/80 mt-4 tracking-wide"
    >
      {{ subTitle }}
    </h4>
  </section>
</template>

<style scoped>
.rsvp-titles-section {
  padding-top: 0.5rem;
  overflow: visible;
}

.rsvp-titles-section h2 {
  margin-top: 0.2em;
  line-height: 1.3;
  text-shadow: 0 2px 20px rgba(212, 175, 55, 0.3);
}
</style>
