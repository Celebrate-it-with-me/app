<template>
  <section
    class="py-20 px-6 bg-white relative overflow-hidden"
  >
    <!-- Background Elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        class="absolute -top-40 -left-40 w-96 h-96 bg-purple-50 rounded-full blur-3xl opacity-60"
      ></div>
      <div
        class="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-50 rounded-full blur-3xl opacity-50"
      ></div>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto">
      <!-- Header Section -->
      <div class="text-center mb-16">
        <div class="inline-flex items-center px-4 py-2 rounded-full bg-purple-50 mb-6">
          <Sparkles class="w-4 h-4 text-purple-600 mr-2" />
          <span class="text-sm font-semibold text-purple-600">Pricing</span>
          <span class="text-sm text-gray-600">&nbsp;• Simple & transparent</span>
        </div>

        <h2 class="text-5xl font-black text-gray-900 mb-4">
          Plan the Perfect Quinceañera for
          <span class="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Your Daughter
          </span>
        </h2>

        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          From digital invitations to guest lists and RSVPs, get everything you need to manage her special day without the stress.
        </p>
      </div>

      <!-- Pricing Cards Grid -->
      <div class="grid gap-8 md:grid-cols-3 items-center">
        <!-- Starter Plan -->
        <div class="relative bg-white rounded-2xl shadow-lg p-8 border border-gray-200 flex flex-col h-full">
          <h3 class="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
          <div class="mb-6">
            <span class="text-5xl font-black text-gray-900">Free</span>
          </div>
          <p class="text-gray-600 mb-6">Perfect to get started with your planning</p>

          <div class="space-y-3 mb-8 flex-grow">
            <div v-for="feature in starterFeatures" :key="feature" class="flex items-start">
              <CheckCircle2 class="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
              <span class="text-gray-700 text-sm" :class="{ 'font-semibold': feature.includes('Note:') }">{{ feature }}</span>
            </div>
          </div>

          <RouterLink to="/sign-up" class="w-full">
            <button class="w-full py-4 rounded-lg font-semibold bg-gray-100 text-gray-800 hover:bg-gray-200 transition-all">
              Create Free Event
            </button>
          </RouterLink>
        </div>

        <!-- Pro Plan -->
        <div class="relative bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl shadow-2xl p-8 text-white transform scale-105 z-10 flex flex-col h-full">
          <div class="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full border border-white/20">
            <span class="text-sm font-semibold text-white">Most Popular</span>
          </div>

          <h3 class="text-2xl font-bold mb-2">Pro</h3>
          <div class="mb-6">
            <span class="text-5xl font-black">$79</span>
            <span class="text-white/80">/event</span>
          </div>
          <p class="text-white/90 mb-6">Everything you need for your celebration</p>

          <div class="space-y-3 mb-8 flex-grow">
            <div v-for="feature in proFeatures" :key="feature" class="flex items-start">
              <CheckCircle2 class="w-5 h-5 text-white mr-3 flex-shrink-0 mt-0.5" />
              <span class="text-white/90 text-sm">{{ feature }}</span>
            </div>
          </div>

          <RouterLink to="/sign-up" class="w-full">
            <button class="w-full py-4 rounded-lg font-semibold bg-white text-purple-600 hover:bg-gray-50 transition-all">
              Upgrade to Pro
            </button>
          </RouterLink>
        </div>

        <!-- Premium Plan -->
        <div class="relative bg-white rounded-2xl shadow-lg p-8 border border-gray-200 flex flex-col h-full">
          <h3 class="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
          <div class="mb-6">
            <span class="text-5xl font-black">$149</span>
            <span class="text-gray-600">/event</span>
          </div>
          <p class="text-gray-600 mb-6">For large, elegant celebrations</p>

          <div class="space-y-3 mb-8 flex-grow">
            <div v-for="feature in premiumFeatures" :key="feature" class="flex items-start">
              <CheckCircle2 class="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
              <span class="text-gray-700 text-sm">{{ feature }}</span>
            </div>
          </div>

          <RouterLink to="/sign-up" class="w-full">
            <button class="w-full py-4 rounded-lg font-semibold bg-gray-100 text-gray-800 hover:bg-gray-200 transition-all">
              Get Premium
            </button>
          </RouterLink>
        </div>
      </div>

      <!-- Trust Signals Section -->
      <div class="mt-16 bg-gray-50 rounded-2xl p-8">
        <div class="grid md:grid-cols-4 gap-6 text-center">
          <div>
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 class="w-6 h-6 text-green-600" />
            </div>
            <p class="text-sm font-semibold text-gray-900 mb-1">No Credit Card Required</p>
            <p class="text-xs text-gray-600">Start free, upgrade anytime</p>
          </div>

          <div>
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield class="w-6 h-6 text-blue-600" />
            </div>
            <p class="text-sm font-semibold text-gray-900 mb-1">14-Day Money Back</p>
            <p class="text-xs text-gray-600">Risk-free guarantee</p>
          </div>

          <div>
            <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Globe class="w-6 h-6 text-purple-600" />
            </div>
            <p class="text-sm font-semibold text-gray-900 mb-1">Fully Bilingual</p>
            <p class="text-xs text-gray-600">English & Spanish support</p>
          </div>

          <div>
            <div class="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CreditCard class="w-6 h-6 text-pink-600" />
            </div>
            <p class="text-sm font-semibold text-gray-900 mb-1">Secure Payments</p>
            <p class="text-xs text-gray-600">Your data is safe</p>
          </div>
        </div>
      </div>

      <!-- FAQ Section -->
      <div class="mt-20">
        <h3 class="text-3xl font-black text-center text-gray-900 mb-10">
          Frequently Asked Questions
        </h3>

        <!-- 2 Columns on Desktop -->
        <div class="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <details v-for="(faq, index) in faqs" :key="index" class="group bg-white rounded-lg p-5 shadow-sm border border-gray-200">
            <summary class="font-semibold text-gray-900 cursor-pointer flex justify-between items-center list-none">
              <span>{{ faq.question }}</span>
              <ChevronDown class="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0" />
            </summary>
            <p class="mt-4 text-gray-600 leading-relaxed text-sm">
              {{ faq.answer }}
            </p>
          </details>
        </div>

        <!-- View All Link -->
        <div class="text-center mt-8">
          <a
            href="#"
            class="inline-flex items-center text-purple-600 font-semibold hover:text-purple-700 transition-colors"
          >
            View All Questions
            <ArrowRight class="w-4 h-4 ml-2" />
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { Sparkles, CheckCircle2, Shield, Globe, CreditCard, ChevronDown, ArrowRight } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

const starterFeatures = [
  '1 active event',
  'Up to 50 guests',
  'Beautiful digital invitation',
  '3 professional themes',
  'RSVP tracking',
  'Guest comments',
  'Music voting',
  'Event details & location',
  'Email support',
  'Note: Includes "Powered by CWM" branding'
]

const proFeatures = [
  'Everything in Starter',
  'Up to 200 guests',
  '20+ premium themes',
  'Custom colors & styles',
  'Remove CWM branding',
  'Menu planning',
  'Seating chart (Early Access)',
  'Budget tracker (Early Access)',
  '3 collaborators',
  'Guest list export (CSV)'
]

const premiumFeatures = [
  'Everything in Pro',
  'Unlimited guests',
  'Unlimited collaborators',
  'Advanced theme customization',
  'Video integration',
  'Priority email support',
  'Custom branding options',
  'Early access to new features'
]

const faqs = [
  {
    question: 'How does the free plan work?',
    answer: 'The Starter plan is completely free forever. You can create 1 active event with up to 50 guests, beautiful digital invitations, RSVP tracking, music voting, and guest comments. No credit card required to get started.'
  },
  {
    question: 'Can I upgrade my plan later?',
    answer: 'Yes! You can upgrade from Starter to Pro or Premium at any time. Your existing event data and settings will be preserved. Upgrades take effect immediately.'
  },
  {
    question: 'What happens after my quinceañera?',
    answer: 'Your event page stays active for 6 months after the event date, so guests can continue viewing photos and leaving comments. You can download all your data (guest lists, RSVPs, etc.) at any time.'
  },
  {
    question: 'Can family members help me plan?',
    answer: 'Yes! Pro plans include 3 collaborators, and Premium includes unlimited collaborators. Family members can help manage guest lists, track RSVPs, and coordinate details—all in real-time.'
  },
  {
    question: 'What if I have more than 200 guests?',
    answer: 'Premium plans include unlimited guests. You can also add extra guest capacity to your Pro plan for $20 per 50 additional guests.'
  },
  {
    question: 'Do you offer Spanish language support?',
    answer: '¡Sí! Our platform is fully bilingual (English and Spanish). You can switch languages anytime, and our support team is fluent in both languages.'
  }
]
</script>

<style scoped>
/* Remove default summary arrow in some browsers */
summary::-webkit-details-marker {
  display: none;
}
</style>
