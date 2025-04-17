<template>
  <section class="py-half px-4 bg-white dark:bg-gray-900">
    <div class="max-w-7xl mx-auto text-center mb-12">
      <CHeading :level="2" weight="bold" class="mb-2">
        Everything You Need to Plan Perfect Events
      </CHeading>
      <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        Powerful tools to make event planning a breeze
      </p>
    </div>

    <div class="grid gap-6 md:grid-cols-3 max-w-7xl mx-auto">
      <!-- Card 1 -->
      <CCard variant="feature">
        <template #icon>
          <div class="w-12 h-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center">
            <CalendarCheck class="w-5 h-5" />
          </div>
        </template>
        <template #title>
          <p class="text-lg font-semibold">Event Planning</p>
        </template>
        <template #content>
          <p class="text-sm text-text-light">
            Comprehensive planning tools, checklists, and timelines to keep you organized.
          </p>
        </template>
      </CCard>

      <!-- Card 2 -->
      <CCard variant="feature">
        <template #icon>
          <div class="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
            <Users2 class="w-5 h-5" />
          </div>
        </template>
        <template #title>
          <p class="text-lg font-semibold">Guest Management</p>
        </template>
        <template #content>
          <p class="text-sm text-text-light">
            Track RSVPs, manage seating arrangements, and send digital invitations.
          </p>
        </template>
      </CCard>

      <!-- Card 3 -->
      <CCard variant="feature">
        <template #icon>
          <div class="w-12 h-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center">
            <Wallet class="w-5 h-5" />
          </div>
        </template>
        <template #title>
          <p class="text-lg font-semibold">Budget Tracking</p>
        </template>
        <template #content>
          <p class="text-sm text-text-light">
            Keep track of expenses and stay within your budget with our finance tools.
          </p>
        </template>
      </CCard>
    </div>
  </section>
</template>

<script setup>
import CCard from '@/components/UI/cards/CCard.vue'
import CHeading from '@/components/UI/headings/CHeading.vue'
import { CalendarCheck, Users2, Wallet } from 'lucide-vue-next'
</script>
