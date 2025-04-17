<template>
  <section class="py-half px-4 bg-white dark:bg-gray-900">
    <div class="max-w-7xl mx-auto text-center mb-12">
      <CHeading :level="2" weight="bold" class="mb-2">
        Simple, Transparent Pricing
      </CHeading>
      <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        Choose the perfect plan for your celebration
      </p>
    </div>

    <div class="grid gap-6 md:grid-cols-3 max-w-7xl mx-auto">
      <!-- Basic Plan -->
      <CCard variant="pricing" class="flex flex-col justify-between">
        <template #title>
          <p class="text-xl font-semibold">Basic</p>
          <p class="text-4xl font-bold text-primary">$299</p>
        </template>
        <template #content>
          <div class="flex-1">
            <ul class="space-y-2 text-left text-sm text-gray-600 dark:text-gray-300 min-h-[140px]">
              <li class="flex items-center gap-2"><CheckCircle class="w-4 h-4 text-green-500" /> Up to 100 guests</li>
              <li class="flex items-center gap-2"><CheckCircle class="w-4 h-4 text-green-500" /> Basic planning tools</li>
              <li class="flex items-center gap-2"><CheckCircle class="w-4 h-4 text-green-500" /> Digital invitations</li>
            </ul>
          </div>
        </template>
        <template #cta>
          <div class="pt-4">
            <CButton full>Get Started</CButton>
          </div>
        </template>
      </CCard>

      <!-- Premium Plan -->
      <CCard variant="pricing" class="flex flex-col justify-between bg-gradient-to-br from-primary to-secondary text-white shadow-xl">
        <template #title>
          <p class="text-xl font-semibold text-white">Premium</p>
          <p class="text-4xl font-bold text-white">$499</p>
        </template>
        <template #content>
          <div class="flex-1">
            <ul class="space-y-2 text-left text-sm text-white/90 min-h-[140px]">
              <li class="flex items-center gap-2"><CheckCircle class="w-4 h-4 text-white" /> Up to 250 guests</li>
              <li class="flex items-center gap-2"><CheckCircle class="w-4 h-4 text-white" /> Advanced planning tools</li>
              <li class="flex items-center gap-2"><CheckCircle class="w-4 h-4 text-white" /> Custom invitations</li>
              <li class="flex items-center gap-2"><CheckCircle class="w-4 h-4 text-white" /> Vendor management</li>
            </ul>
          </div>
        </template>
        <template #cta>
          <div class="pt-4">
            <CButton variant="outline" full class="border-white text-white">Get Started</CButton>
          </div>
        </template>
      </CCard>

      <!-- Luxury Plan -->
      <CCard variant="pricing" class="flex flex-col justify-between">
        <template #title>
          <p class="text-xl font-semibold">Luxury</p>
          <p class="text-4xl font-bold text-primary">$999</p>
        </template>
        <template #content>
          <div class="flex-1">
            <ul class="space-y-2 text-left text-sm text-gray-600 dark:text-gray-300 min-h-[140px]">
              <li class="flex items-center gap-2"><CheckCircle class="w-4 h-4 text-green-500" /> Unlimited guests</li>
              <li class="flex items-center gap-2"><CheckCircle class="w-4 h-4 text-green-500" /> Full-service planning</li>
              <li class="flex items-center gap-2"><CheckCircle class="w-4 h-4 text-green-500" /> Priority support</li>
              <li class="flex items-center gap-2"><CheckCircle class="w-4 h-4 text-green-500" /> Custom website</li>
            </ul>
          </div>
        </template>
        <template #cta>
          <div class="pt-4">
            <CButton full>Get Started</CButton>
          </div>
        </template>
      </CCard>
    </div>
  </section>
</template>

<script setup>
import CCard from '@/components/UI/cards/CCard.vue'
import CHeading from '@/components/UI/headings/CHeading.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import { CheckCircle } from 'lucide-vue-next'
</script>
