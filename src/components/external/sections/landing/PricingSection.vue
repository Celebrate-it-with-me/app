<template>
  <section class="py-half px-4 bg-white dark:bg-gray-900 relative">
    <!-- Background decorations -->
    <div
      class="absolute left-0 top-1/3 w-72 h-72 bg-pink-50 dark:bg-pink-900/10 rounded-full blur-3xl opacity-40 -z-10"
    ></div>
    <div
      class="absolute right-0 bottom-1/4 w-64 h-64 bg-purple-50 dark:bg-purple-900/10 rounded-full blur-3xl opacity-40 -z-10"
    ></div>

    <div class="max-w-7xl mx-auto text-center mb-12 animate-fadeIn">
      <CHeading :level="2" weight="bold" class="mb-3"> Simple, Transparent Pricing </CHeading>
      <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
        Choose the perfect plan for your celebration
      </p>

      <!-- Pricing Toggle -->
      <div class="flex items-center justify-center mt-8">
        <span
          :class="[
            'text-sm font-medium mr-3 transition-colors',
            isAnnual ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'
          ]"
          >Monthly</span
        >
        <button
          class="relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          :class="isAnnual ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'"
          role="switch"
          :aria-checked="isAnnual"
          @click="isAnnual = !isAnnual"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
            :class="isAnnual ? 'translate-x-6' : 'translate-x-1'"
          ></span>
        </button>
        <span
          :class="[
            'text-sm font-medium ml-3 transition-colors',
            isAnnual ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
          ]"
          >Annual <span class="text-primary font-semibold">Save 20%</span></span
        >
      </div>
    </div>

    <div class="grid gap-8 md:grid-cols-3 max-w-7xl mx-auto">
      <!-- Basic Plan -->
      <div
        class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col h-full transform hover:-translate-y-1"
      >
        <div class="p-6 pb-0">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Basic</h3>
          <div class="mt-4 flex items-baseline">
            <span class="text-5xl font-bold text-gray-900 dark:text-white">{{
              isAnnual ? '$239' : '$299'
            }}</span>
            <span class="ml-1 text-xl text-gray-500 dark:text-gray-400">{{
              isAnnual ? '/year' : '/event'
            }}</span>
          </div>
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Perfect for small gatherings</p>
        </div>

        <div class="p-6 flex-grow">
          <ul class="space-y-3 text-left">
            <li class="flex items-start">
              <CheckCircle class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span class="text-gray-600 dark:text-gray-300">Up to 100 guests</span>
            </li>
            <li class="flex items-start">
              <CheckCircle class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span class="text-gray-600 dark:text-gray-300">Basic planning tools</span>
            </li>
            <li class="flex items-start">
              <CheckCircle class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span class="text-gray-600 dark:text-gray-300">Digital invitations</span>
            </li>
            <li class="flex items-start">
              <CheckCircle class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span class="text-gray-600 dark:text-gray-300">Email support</span>
            </li>
          </ul>
        </div>

        <div class="p-6 pt-0">
          <RouterLink to="/sign-up">
            <button
              class="w-full py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Get Started
            </button>
          </RouterLink>
        </div>
      </div>

      <!-- Premium Plan -->
      <div
        class="relative bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-pink-400 flex flex-col h-full transform hover:-translate-y-2 z-10 scale-105"
      >
        <div
          class="absolute top-0 right-0 bg-white dark:bg-gray-800 text-primary px-4 py-1 rounded-bl-lg font-medium text-sm"
        >
          Most Popular
        </div>

        <div class="p-6 pb-0">
          <h3 class="text-xl font-semibold text-white">Premium</h3>
          <div class="mt-4 flex items-baseline">
            <span class="text-5xl font-bold text-white">{{ isAnnual ? '$399' : '$499' }}</span>
            <span class="ml-1 text-xl text-white/80">{{ isAnnual ? '/year' : '/event' }}</span>
          </div>
          <p class="mt-2 text-sm text-white/80">Ideal for medium-sized events</p>
        </div>

        <div class="p-6 flex-grow">
          <ul class="space-y-3 text-left">
            <li class="flex items-start">
              <CheckCircle class="w-5 h-5 text-white mr-2 flex-shrink-0 mt-0.5" />
              <span class="text-white/90">Up to 250 guests</span>
            </li>
            <li class="flex items-start">
              <CheckCircle class="w-5 h-5 text-white mr-2 flex-shrink-0 mt-0.5" />
              <span class="text-white/90">Advanced planning tools</span>
            </li>
            <li class="flex items-start">
              <CheckCircle class="w-5 h-5 text-white mr-2 flex-shrink-0 mt-0.5" />
              <span class="text-white/90">Custom invitations</span>
            </li>
            <li class="flex items-start">
              <CheckCircle class="w-5 h-5 text-white mr-2 flex-shrink-0 mt-0.5" />
              <span class="text-white/90">Vendor management</span>
            </li>
            <li class="flex items-start">
              <CheckCircle class="w-5 h-5 text-white mr-2 flex-shrink-0 mt-0.5" />
              <span class="text-white/90">Priority email & chat support</span>
            </li>
          </ul>
        </div>

        <div class="p-6 pt-0">
          <RouterLink to="/sign-up">
            <button
              class="w-full py-3 px-4 rounded-xl bg-white hover:bg-gray-100 text-primary font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
            >
              Get Started
            </button>
          </RouterLink>
        </div>
      </div>

      <!-- Luxury Plan -->
      <div
        class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col h-full transform hover:-translate-y-1"
      >
        <div class="p-6 pb-0">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Luxury</h3>
          <div class="mt-4 flex items-baseline">
            <span class="text-5xl font-bold text-gray-900 dark:text-white">{{
              isAnnual ? '$799' : '$999'
            }}</span>
            <span class="ml-1 text-xl text-gray-500 dark:text-gray-400">{{
              isAnnual ? '/year' : '/event'
            }}</span>
          </div>
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
            For large, premium celebrations
          </p>
        </div>

        <div class="p-6 flex-grow">
          <ul class="space-y-3 text-left">
            <li class="flex items-start">
              <CheckCircle class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span class="text-gray-600 dark:text-gray-300">Unlimited guests</span>
            </li>
            <li class="flex items-start">
              <CheckCircle class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span class="text-gray-600 dark:text-gray-300">Full-service planning</span>
            </li>
            <li class="flex items-start">
              <CheckCircle class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span class="text-gray-600 dark:text-gray-300">Custom website</span>
            </li>
            <li class="flex items-start">
              <CheckCircle class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span class="text-gray-600 dark:text-gray-300">VIP support 24/7</span>
            </li>
            <li class="flex items-start">
              <CheckCircle class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span class="text-gray-600 dark:text-gray-300">Dedicated event consultant</span>
            </li>
          </ul>
        </div>

        <div class="p-6 pt-0">
          <RouterLink to="/sign-up">
            <button
              class="w-full py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Get Started
            </button>
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- FAQ Section -->
    <div class="max-w-4xl mx-auto mt-20">
      <h3 class="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">
        Frequently Asked Questions
      </h3>

      <div class="space-y-4">
        <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <button
            class="flex justify-between items-center w-full px-4 py-3 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            @click="toggleFaq(0)"
          >
            <span class="font-medium text-gray-900 dark:text-white"
              >Can I upgrade my plan later?</span
            >
            <ChevronDown
              class="w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform"
              :class="{ 'transform rotate-180': openFaqs[0] }"
            />
          </button>
          <div
            v-show="openFaqs[0]"
            class="px-4 py-3 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300"
          >
            <p>
              Yes, you can upgrade your plan at any time. The price difference will be prorated
              based on the remaining time in your current plan.
            </p>
          </div>
        </div>

        <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <button
            class="flex justify-between items-center w-full px-4 py-3 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            @click="toggleFaq(1)"
          >
            <span class="font-medium text-gray-900 dark:text-white"
              >Is there a free trial available?</span
            >
            <ChevronDown
              class="w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform"
              :class="{ 'transform rotate-180': openFaqs[1] }"
            />
          </button>
          <div
            v-show="openFaqs[1]"
            class="px-4 py-3 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300"
          >
            <p>
              We offer a 14-day free trial with access to all basic features. No credit card
              required to start your trial.
            </p>
          </div>
        </div>

        <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <button
            class="flex justify-between items-center w-full px-4 py-3 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            @click="toggleFaq(2)"
          >
            <span class="font-medium text-gray-900 dark:text-white">Do you offer refunds?</span>
            <ChevronDown
              class="w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform"
              :class="{ 'transform rotate-180': openFaqs[2] }"
            />
          </button>
          <div
            v-show="openFaqs[2]"
            class="px-4 py-3 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300"
          >
            <p>
              We offer a 30-day money-back guarantee. If you're not satisfied with our service,
              contact our support team for a full refund.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import CHeading from '@/components/UI/headings/CHeading.vue'
import { CheckCircle, ChevronDown } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

const isAnnual = ref(false)
const openFaqs = ref([false, false, false])

const toggleFaq = index => {
  openFaqs.value[index] = !openFaqs.value[index]
}
</script>
