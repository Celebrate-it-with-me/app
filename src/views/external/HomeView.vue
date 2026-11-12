<script setup>
import LandingHero from '@/components/external/sections/landing/LandingHero.vue'
import LandingHowItWorks from '@/components/external/sections/landing/LandingHowItWorks.vue'
import LandingDesigns from '@/components/external/sections/landing/LandingDesigns.vue'
import LandingFeatures from '@/components/external/sections/landing/LandingFeatures.vue'
import LandingPricing from '@/components/external/sections/landing/LandingPricing.vue'
import LandingFaq from '@/components/external/sections/landing/LandingFaq.vue'
import LandingCta from '@/components/external/sections/landing/LandingCta.vue'
import MobileCtaBar from '@/components/external/sections/landing/MobileCtaBar.vue'
</script>

<template>
  <div class="pb-20 md:pb-0">
    <LandingHero />
    <LandingHowItWorks />
    <LandingDesigns />
    <LandingFeatures />
    <LandingPricing />
    <LandingFaq />
    <LandingCta />
    <MobileCtaBar />
  </div>
</template>
