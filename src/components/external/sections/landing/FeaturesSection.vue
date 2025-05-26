<template>
  <section class="py-half px-4 bg-white dark:bg-gray-900 relative">
    <!-- Background decoration -->
    <div class="absolute right-0 top-1/4 w-64 h-64 bg-pink-50 dark:bg-pink-900/10 rounded-full blur-3xl opacity-50 -z-10"></div>

    <div class="max-w-7xl mx-auto text-center mb-12 animate-fadeIn">
      <CHeading :level="2" weight="bold" class="mb-3">
        Everything You Need to Plan Perfect Events
      </CHeading>
      <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
        Powerful tools to make event planning a breeze
      </p>
    </div>

    <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
      <!-- Feature Card 1 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
        <div class="p-6">
          <div class="w-14 h-14 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-500/20 dark:to-pink-700/20 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-5 transform group-hover:scale-110 transition-transform duration-300">
            <CalendarCheck class="w-6 h-6" />
          </div>
          <h3 class="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Event Planning</h3>
          <p class="text-gray-600 dark:text-gray-300">
            Comprehensive planning tools, checklists, and timelines to keep you organized throughout the entire process.
          </p>
          <ul class="mt-4 space-y-2">
            <li class="flex items-start">
              <CheckCircle2 class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span class="text-sm text-gray-600 dark:text-gray-400">Customizable event timelines</span>
            </li>
            <li class="flex items-start">
              <CheckCircle2 class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span class="text-sm text-gray-600 dark:text-gray-400">Task management with reminders</span>
            </li>
            <li class="flex items-start">
              <CheckCircle2 class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span class="text-sm text-gray-600 dark:text-gray-400">Vendor coordination tools</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Feature Card 2 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
        <div class="p-6">
          <div class="w-14 h-14 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-500/20 dark:to-purple-700/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-5 transform group-hover:scale-110 transition-transform duration-300">
            <Users2 class="w-6 h-6" />
          </div>
          <h3 class="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Guest Management</h3>
          <p class="text-gray-600 dark:text-gray-300">
            Track RSVPs, manage seating arrangements, and send beautiful digital invitations to all your guests.
          </p>
          <ul class="mt-4 space-y-2">
            <li class="flex items-start">
              <CheckCircle2 class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span class="text-sm text-gray-600 dark:text-gray-400">Digital RSVP tracking system</span>
            </li>
            <li class="flex items-start">
              <CheckCircle2 class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span class="text-sm text-gray-600 dark:text-gray-400">Interactive seating chart creator</span>
            </li>
            <li class="flex items-start">
              <CheckCircle2 class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span class="text-sm text-gray-600 dark:text-gray-400">Customizable invitation templates</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Feature Card 3 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group md:col-span-2 lg:col-span-1">
        <div class="p-6">
          <div class="w-14 h-14 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-500/20 dark:to-pink-700/20 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-5 transform group-hover:scale-110 transition-transform duration-300">
            <Wallet class="w-6 h-6" />
          </div>
          <h3 class="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Budget Tracking</h3>
          <p class="text-gray-600 dark:text-gray-300">
            Keep track of expenses and stay within your budget with our comprehensive finance tools.
          </p>
          <ul class="mt-4 space-y-2">
            <li class="flex items-start">
              <CheckCircle2 class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span class="text-sm text-gray-600 dark:text-gray-400">Expense categorization</span>
            </li>
            <li class="flex items-start">
              <CheckCircle2 class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span class="text-sm text-gray-600 dark:text-gray-400">Payment tracking and reminders</span>
            </li>
            <li class="flex items-start">
              <CheckCircle2 class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span class="text-sm text-gray-600 dark:text-gray-400">Budget comparison tools</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Additional Features -->
    <div class="max-w-7xl mx-auto mt-16">
      <div class="grid md:grid-cols-3 gap-6 text-center">
        <div class="p-4 animate-fadeIn" style="animation-delay: 0.1s;">
          <div class="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
            <MessageSquare class="w-5 h-5 text-primary" />
          </div>
          <h3 class="text-lg font-semibold mb-2">24/7 Support</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Get help whenever you need it with our responsive support team.</p>
        </div>

        <div class="p-4 animate-fadeIn" style="animation-delay: 0.2s;">
          <div class="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
            <ShieldCheck class="w-5 h-5 text-primary" />
          </div>
          <h3 class="text-lg font-semibold mb-2">Secure Platform</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Your data is always protected with our enterprise-grade security.</p>
        </div>

        <div class="p-4 animate-fadeIn" style="animation-delay: 0.3s;">
          <div class="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
            <Smartphone class="w-5 h-5 text-primary" />
          </div>
          <h3 class="text-lg font-semibold mb-2">Mobile Friendly</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Plan on the go with our fully responsive mobile experience.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import CHeading from '@/components/UI/headings/CHeading.vue'
import { CalendarCheck, Users2, Wallet, CheckCircle2, MessageSquare, ShieldCheck, Smartphone } from 'lucide-vue-next'
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 1s ease-out forwards;
  opacity: 0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
