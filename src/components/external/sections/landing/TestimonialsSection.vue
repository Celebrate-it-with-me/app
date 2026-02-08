<template>
  <section
    id="testimonials"
    class="py-20 bg-gradient-to-br from-purple-50 to-pink-50 scroll-mt-16"
  >
    <div class="max-w-6xl mx-auto px-6">
      <!-- Section Header -->
      <div class="text-center mb-16">
        <h2 class="text-4xl md:text-5xl font-black text-gray-900 mb-4">
          Why Choose
          <span
            class="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent"
          >
            Celebrate It With Me
          </span>
        </h2>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          Finally, a planning platform that understands the heart of a Quinceañera.
          CWM gives you the tools to honor tradition without the stress.
        </p>
      </div>

      <!-- Stats Grid -->
      <div class="grid md:grid-cols-4 gap-8">
        <!-- Card 1: Cultural Fit -->
        <div
          class="group bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-center"
        >
          <div class="relative mb-6 flex justify-center">
            <div
              class="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-600/20 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"
            >
              <Sparkles class="w-8 h-8 text-pink-600" />
            </div>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Built for Quinceañeras</h3>
          <p class="text-gray-600 text-sm">
            Not a generic party planner. Every feature is designed for your daughter's special day.
          </p>
        </div>

        <!-- Card 2: Features -->
        <div
          class="group bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-center"
        >
          <div class="relative mb-6 flex justify-center">
            <div
              class="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"
            >
              <Package class="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div
            class="text-5xl font-black bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-2"
          >
            50+
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Planning Tools</h3>
          <p class="text-gray-600 text-sm">
            From guest lists and budgets to music and court coordination, we have it all.
          </p>
        </div>

        <!-- Card 3: Bilingual -->
        <div
          class="group bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-center"
        >
          <div class="relative mb-6 flex justify-center">
            <div
              class="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"
            >
              <Languages class="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Fully Bilingual</h3>
          <p class="text-gray-600 text-sm">
            Plan in English or Spanish—perfect for involving the whole family and grandparents.
          </p>
        </div>

        <!-- Card 4: Value -->
        <div
          class="group bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-center"
        >
          <div class="relative mb-6 flex justify-center">
            <div
              class="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"
            >
              <Gift class="w-8 h-8 text-emerald-600" />
            </div>
          </div>
          <div class="text-5xl font-black text-emerald-500 mb-2">100%</div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Free Beta Access</h3>
          <p class="text-gray-600 text-sm">
            Enjoy full access to every premium feature for free while we're in our early launch
            phase.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Sparkles, Package, Languages, Gift } from 'lucide-vue-next'
// This section replaces the previous Testimonials section with honest platform stats
// focused on building confidence for our early-stage users.
</script>
