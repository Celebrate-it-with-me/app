<template>
  <section class="py-half px-4 bg-white dark:bg-gray-900">
    <div class="max-w-4xl mx-auto">
      <CCard variant="" class="bg-gradient-to-r from-primary to-secondary text-white text-center p-10 rounded-2xl shadow-xl">
        <CHeading :level="2" weight="bold" class="text-white mb-4">
          Ready to Plan Your Perfect Celebration?
        </CHeading>
        <p class="text-white/90 mb-6">
          Join thousands of happy customers and start planning your special day today.
        </p>
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <CButton full class="sm:w-auto">Get Started Now</CButton>
          <CButton variant="outline" full class="sm:w-auto border-white text-white">Watch Demo</CButton>
        </div>
      </CCard>
    </div>
  </section>
</template>

<script setup>
import CCard from '@/components/UI/cards/CCard.vue'
import CHeading from '@/components/UI/headings/CHeading.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
</script>
