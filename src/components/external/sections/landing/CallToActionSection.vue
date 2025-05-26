<template>
  <section class="py-half px-4 bg-white dark:bg-gray-900 overflow-hidden">
    <div class="max-w-6xl mx-auto relative">
      <!-- Background Elements -->
      <div class="absolute -top-20 -left-20 w-40 h-40 bg-pink-200 dark:bg-pink-900/30 rounded-full blur-3xl opacity-50"></div>
      <div class="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-200 dark:bg-purple-900/30 rounded-full blur-3xl opacity-50"></div>

      <div class="relative">
        <CCard
          variant=""
          class="bg-gradient-to-r from-primary to-secondary text-white p-8 md:p-12 rounded-2xl shadow-xl border border-white/10 backdrop-blur-sm animate-fadeIn"
        >
          <div class="grid md:grid-cols-5 gap-8 items-center">
            <div class="md:col-span-3 text-center md:text-left">
              <CHeading :level="2" weight="bold" class="text-white mb-4 text-3xl md:text-4xl">
                Ready to Make Your Special Day Unforgettable?
              </CHeading>
              <p class="text-white/90 mb-6 text-lg">
                Join thousands of happy customers and start planning your perfect celebration today.
              </p>

              <div class="flex flex-wrap gap-3 mb-8 justify-center md:justify-start">
                <div class="flex items-center bg-white/10 px-4 py-2 rounded-full">
                  <CheckCircle class="w-5 h-5 text-white mr-2" />
                  <span class="text-sm font-medium">Easy Planning</span>
                </div>
                <div class="flex items-center bg-white/10 px-4 py-2 rounded-full">
                  <CheckCircle class="w-5 h-5 text-white mr-2" />
                  <span class="text-sm font-medium">Budget Friendly</span>
                </div>
                <div class="flex items-center bg-white/10 px-4 py-2 rounded-full">
                  <CheckCircle class="w-5 h-5 text-white mr-2" />
                  <span class="text-sm font-medium">24/7 Support</span>
                </div>
              </div>

              <div class="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
                <RouterLink to="/sign-up">
                  <CButton
                    full
                    class="sm:w-auto bg-white text-primary hover:bg-gray-100 transform hover:-translate-y-1 transition-all duration-300 text-base px-8 py-3"
                  >
                    Get Started Free
                  </CButton>
                </RouterLink>
                <a href="#features">
                  <CButton
                    variant="outline"
                    full
                    class="sm:w-auto border-white text-white hover:bg-white/10 transform hover:-translate-y-1 transition-all duration-300 text-base px-8 py-3"
                  >
                    Learn More
                  </CButton>
                </a>
              </div>
            </div>

            <div class="hidden md:block md:col-span-2 relative">
              <div class="absolute -bottom-4 -right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                <div class="flex items-center gap-3">
                  <div class="flex -space-x-2">
                    <img src="https://randomuser.me/api/portraits/women/45.jpg" class="w-8 h-8 rounded-full border-2 border-white" alt="User" />
                    <img src="https://randomuser.me/api/portraits/men/32.jpg" class="w-8 h-8 rounded-full border-2 border-white" alt="User" />
                    <img src="https://randomuser.me/api/portraits/women/22.jpg" class="w-8 h-8 rounded-full border-2 border-white" alt="User" />
                  </div>
                  <div class="text-xs text-gray-800 dark:text-gray-200">
                    <p class="font-semibold">Join 10,000+ users</p>
                    <div class="flex items-center">
                      <div class="flex">
                        <svg v-for="star in 5" :key="star" class="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <span class="ml-1">4.9/5</span>
                    </div>
                  </div>
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
import { CheckCircle } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
</script>
