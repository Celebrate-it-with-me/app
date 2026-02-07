<script setup lang="ts">
import HeroSection from '@/components/external/sections/landing/HeroSection.vue'
import FeaturesSection from '@/components/external/sections/landing/FeaturesSection.vue'
import PricingSection from '@/components/external/sections/landing/PricingSection.vue'
import TestimonialsSection from '@/components/external/sections/landing/TestimonialsSection.vue'
import CallToActionSection from '@/components/external/sections/landing/CallToActionSection.vue'
import ExitIntentModal from '@/components/external/sections/landing/ExitIntentModal.vue'
</script>

<template>
  <div class="scroll-smooth">
    <HeroSection />
    <FeaturesSection id="features" class="scroll-mt-16" />
    <TestimonialsSection id="testimonials" class="scroll-mt-16" />
    <PricingSection id="pricing" class="scroll-mt-16" />
    <CallToActionSection />

    <ExitIntentModal />
  </div>
</template>
