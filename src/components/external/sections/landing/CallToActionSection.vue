<template>
  <section class="py-20 px-4 bg-gradient-to-br from-gray-50 via-white to-purple-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20 overflow-hidden">
    <div class="max-w-6xl mx-auto relative">
      <!-- Enhanced Background Elements -->
      <div class="absolute -top-20 -left-20 w-60 h-60 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl opacity-60 animate-pulse"></div>
      <div class="absolute -bottom-20 -right-20 w-60 h-60 bg-gradient-to-l from-secondary/20 to-accent/20 rounded-full blur-3xl opacity-50 animate-pulse delay-1000"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-pink-300/20 to-purple-300/20 rounded-full blur-2xl opacity-30"></div>

      <div class="relative">
        <CCard
          variant=""
          class="bg-gradient-to-br from-primary via-primary to-secondary text-white p-10 md:p-16 rounded-3xl shadow-2xl border border-white/20 backdrop-blur-lg animate-fadeIn relative overflow-hidden"
        >
          <!-- Card inner glow effect -->
          <div class="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-3xl"></div>

          <div class="relative z-10 grid md:grid-cols-5 gap-10 items-center">
            <div class="md:col-span-3 text-center md:text-left">
              <CHeading :level="2" weight="bold" class="text-white mb-6 text-4xl md:text-5xl leading-tight font-display">
                Ready to Make Your Special Day
                <span class="block text-white/90">Unforgettable?</span>
              </CHeading>
              <p class="text-white/95 mb-8 text-xl leading-relaxed max-w-2xl">
                Join thousands of happy customers and start planning your perfect celebration with our premium tools and expert guidance.
              </p>

              <div class="flex flex-wrap gap-4 mb-10 justify-center md:justify-start">
                <div class="group flex items-center bg-white/15 hover:bg-white/25 px-5 py-3 rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 shadow-lg">
                  <div class="w-7 h-7 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mr-3">
                    <CheckCircle class="w-4 h-4 text-white" />
                  </div>
                  <span class="text-sm font-semibold text-white">Easy Planning</span>
                </div>
                <div class="group flex items-center bg-white/15 hover:bg-white/25 px-5 py-3 rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 shadow-lg">
                  <div class="w-7 h-7 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center mr-3">
                    <CheckCircle class="w-4 h-4 text-white" />
                  </div>
                  <span class="text-sm font-semibold text-white">Budget Friendly</span>
                </div>
                <div class="group flex items-center bg-white/15 hover:bg-white/25 px-5 py-3 rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 shadow-lg">
                  <div class="w-7 h-7 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mr-3">
                    <CheckCircle class="w-4 h-4 text-white" />
                  </div>
                  <span class="text-sm font-semibold text-white">24/7 Support</span>
                </div>
              </div>

              <!-- Enhanced Email Input and CTA Section -->
              <div class="space-y-6">
                <div class="bg-white/20 backdrop-blur-sm rounded-2xl p-3 shadow-2xl border border-white/30 max-w-lg mx-auto md:mx-0">
                  <div class="flex flex-col sm:flex-row gap-3">
                    <div class="flex-1">
                      <input
                        type="email"
                        placeholder="Enter your email address"
                        class="w-full px-5 py-4 rounded-xl bg-white/95 backdrop-blur-sm text-gray-800 placeholder-gray-500 border-0 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300 text-lg font-medium shadow-inner"
                      />
                    </div>
                    <RouterLink to="/sign-up">
                      <CButton
                        class="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark text-white font-bold text-lg px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 whitespace-nowrap"
                      >
                        Get Started Free
                      </CButton>
                    </RouterLink>
                  </div>
                </div>

                <div class="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center">
                  <a href="#features">
                    <CButton
                      variant="outline"
                      class="border-2 border-white/60 text-white hover:bg-white/15 hover:border-white transform hover:-translate-y-1 transition-all duration-300 text-lg px-8 py-3 font-semibold rounded-xl"
                    >
                      Watch Demo
                    </CButton>
                  </a>
                  <div class="flex items-center text-sm text-white/80">
                    <span>No credit card required</span>
                    <span class="mx-2">•</span>
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="md:col-span-2 flex flex-col items-center md:items-end justify-center space-y-6">
              <!-- Enhanced Social Proof Badge -->
              <div class="bg-white/15 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/30 transform hover:scale-105 transition-all duration-500 max-w-sm w-full">
                <div class="text-center">
                  <div class="flex justify-center -space-x-3 mb-6">
                    <img src="https://randomuser.me/api/portraits/women/45.jpg" class="w-12 h-12 rounded-full border-4 border-white shadow-xl ring-2 ring-primary/50" alt="User" />
                    <img src="https://randomuser.me/api/portraits/men/32.jpg" class="w-12 h-12 rounded-full border-4 border-white shadow-xl ring-2 ring-secondary/50" alt="User" />
                    <img src="https://randomuser.me/api/portraits/women/22.jpg" class="w-12 h-12 rounded-full border-4 border-white shadow-xl ring-2 ring-accent/50" alt="User" />
                    <div class="w-12 h-12 rounded-full border-4 border-white shadow-xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                      <span class="text-white font-bold text-xs">10K+</span>
                    </div>
                  </div>

                  <h3 class="text-xl font-bold text-white mb-4">Join 10,000+ Happy Customers</h3>

                  <div class="flex justify-center items-center mb-3">
                    <div class="flex mr-3">
                      <svg v-for="star in 5" :key="star" class="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <span class="text-lg font-bold text-white">4.9/5</span>
                  </div>

                  <p class="text-white/90 italic text-sm">"Best planning platform ever!"</p>
                </div>
              </div>

              <!-- Trust Indicators -->
              <div class="flex gap-3 justify-center">
                <div class="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/20">
                  <Lock class="w-3 h-3 text-white mr-1" />
                  <span class="text-xs font-semibold text-white">Secure</span>
                </div>
                <div class="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/20">
                  <Zap class="w-3 h-3 text-white mr-1" />
                  <span class="text-xs font-semibold text-white">Fast</span>
                </div>
              </div>
            </div>
          </div>
        </CCard>
      </div>
    </div>
  </section>
</template>

<script setup>
import CCard from '@/components/UI/cards/CCard.vue'
import CHeading from '@/components/UI/headings/CHeading.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import { CheckCircle, Lock, Zap } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
</script>
