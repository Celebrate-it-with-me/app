<template>
  <!-- 20-line ultra-simple CTA -->
  <section class="py-24 bg-gradient-to-br from-pink-500 to-purple-600">
    <div class="max-w-3xl mx-auto px-6 text-center">
      <h2 class="text-5xl font-black text-white mb-6">Ready When You Are</h2>

      <p class="text-xl text-white/90 mb-10">
        Start planning your daughter's quinceañera for free. No credit card, no commitment.
      </p>

      <router-link
        to="/sign-up"
        class="inline-block px-12 py-5 bg-white text-pink-600 text-lg font-bold rounded-lg hover:bg-gray-50 transition-all shadow-2xl"
      >
        Create Free Event →
      </router-link>
    </div>
  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>
