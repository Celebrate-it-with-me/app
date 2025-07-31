<template>
  <section
    class="py-24 px-4 bg-gradient-to-br from-gray-50/50 via-white to-purple-50/30 dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-900 relative overflow-hidden"
  >
    <!-- Enhanced Background Elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div
        class="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-r from-secondary/10 to-accent/10 rounded-full blur-3xl opacity-60 animate-pulse"
      ></div>
      <div
        class="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-l from-primary/10 to-secondary/10 rounded-full blur-3xl opacity-50 animate-pulse"
        style="animation-delay: 2s"
      ></div>
      <div
        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-pink-200/10 to-purple-200/10 rounded-full blur-2xl opacity-40"
      ></div>

      <!-- Floating pricing elements -->
      <div
        class="absolute top-20 left-20 w-8 h-8 bg-primary/20 rounded-full animate-bounce"
        style="animation-delay: 1s"
      >
        <div class="w-full h-full flex items-center justify-center">
          <span class="text-primary/60 text-xs font-bold">$</span>
        </div>
      </div>
      <div
        class="absolute bottom-32 right-32 w-6 h-6 bg-secondary/30 rounded-lg rotate-45 animate-spin-slow"
      ></div>
      <div
        class="absolute top-1/3 right-1/4 w-4 h-4 bg-accent/40 rounded-full animate-pulse"
        style="animation-delay: 3s"
      ></div>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto">
      <!-- Header Section -->
      <div class="text-center mb-20 animate-fadeIn">
        <div
          class="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-secondary/10 to-primary/10 border border-secondary/20 backdrop-blur-sm mb-6"
        >
          <Gem class="w-4 h-4 text-secondary mr-2" />
          <span class="text-sm font-semibold text-secondary">Pricing</span>
          <span class="text-sm text-gray-600 dark:text-gray-300">Simple & transparent</span>
        </div>

        <CHeading
          :level="2"
          weight="bold"
          class="mb-6 text-4xl sm:text-5xl lg:text-6xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent"
        >
          Simple, Transparent
          <span
            class="block bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent"
            >Pricing</span
          >
        </CHeading>
        <p class="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed mb-8">
          Choose the perfect plan for your celebration. No hidden fees, no surprises - just
          <span class="font-semibold text-primary">transparent pricing</span> that grows with your
          needs.
        </p>

        <!-- Enhanced Pricing Toggle -->
        <div
          class="inline-flex items-center p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50"
        >
          <span
            :class="[
              'px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300',
              !isAnnual
                ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            ]"
            >Monthly</span
          >
          <button
            class="relative mx-2 inline-flex h-8 w-14 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 transition-all duration-300"
            :class="
              isAnnual
                ? 'bg-gradient-to-r from-primary to-secondary'
                : 'bg-gray-300 dark:bg-gray-600'
            "
            role="switch"
            :aria-checked="isAnnual"
            @click="isAnnual = !isAnnual"
          >
            <span
              class="inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300"
              :class="isAnnual ? 'translate-x-7' : 'translate-x-1'"
            ></span>
          </button>
          <span
            :class="[
              'px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 relative',
              isAnnual
                ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            ]"
          >
            Annual
            <div
              v-if="isAnnual"
              class="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse"
            >
              Save 20%
            </div>
          </span>
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
            <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Perfect for small gatherings
            </p>
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
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import CHeading from '@/components/UI/headings/CHeading.vue'
import { CheckCircle, ChevronDown, Gem } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

const isAnnual = ref(false)
const openFaqs = ref([false, false, false])

const toggleFaq = index => {
  openFaqs.value[index] = !openFaqs.value[index]
}
</script>

<style scoped>
.animate-spin-slow {
  animation: spin-slow 8s linear infinite;
}

@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
