<template>
  <section class="relative py-20 overflow-hidden bg-gradient-to-br from-pink-50 via-white to-purple-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20">
    <!-- Enhanced Background Elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl opacity-60 animate-pulse"></div>
      <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-l from-secondary/20 to-accent/20 rounded-full blur-3xl opacity-50 animate-pulse" style="animation-delay: 2s;"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-pink-300/10 to-purple-300/10 rounded-full blur-2xl opacity-40"></div>

      <!-- Floating Elements -->
      <div class="absolute top-20 right-20 w-4 h-4 bg-primary/30 rounded-full animate-bounce" style="animation-delay: 1s;"></div>
      <div class="absolute bottom-32 left-16 w-6 h-6 bg-secondary/40 rounded-full animate-bounce" style="animation-delay: 3s;"></div>
      <div class="absolute top-1/3 left-1/4 w-3 h-3 bg-accent/50 rounded-full animate-bounce" style="animation-delay: 2s;"></div>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div class="grid lg:grid-cols-2 gap-16 items-center">
        <!-- Content Section -->
        <div class="text-center lg:text-left space-y-8 animate-fadeIn">
          <!-- Badge -->
          <div class="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 backdrop-blur-sm">
            <Sparkles class="w-4 h-4 text-primary mr-2" />
            <span class="text-sm font-semibold text-primary">New</span>
            <span class="text-sm text-gray-600 dark:text-gray-300">AI-Powered Event Planning</span>
          </div>

          <!-- Main Heading -->
          <div class="space-y-4">
            <h1 class="text-5xl sm:text-6xl lg:text-7xl font-display font-bold leading-tight text-gray-900 dark:text-white">
              Make Your
              <span class="relative inline-block">
                <span class="bg-gradient-to-r from-primary via-secondary to-accent text-transparent bg-clip-text animate-gradient">
                  Special Day
                </span>
                <div class="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-full transform scale-x-0 animate-scale-x"></div>
              </span>
              <br />
              <span class="text-gray-700 dark:text-gray-200">Unforgettable</span>
            </h1>
          </div>

          <!-- Description -->
          <p class="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
            Transform your quinceañeras, birthdays, and special celebrations with our
            <span class="font-semibold text-primary">AI-powered</span> event management platform.
          </p>

          <!-- Feature Pills -->
          <div class="flex flex-wrap gap-3 justify-center lg:justify-start">
            <div class="flex items-center px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
              <div class="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Smart Planning</span>
            </div>
            <div class="flex items-center px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
              <div class="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse" style="animation-delay: 0.5s;"></div>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Budget Friendly</span>
            </div>
            <div class="flex items-center px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
              <div class="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse" style="animation-delay: 1s;"></div>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">24/7 Support</span>
            </div>
          </div>

          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <a href="#features" class="group relative px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 overflow-hidden">
              <span class="relative z-10">Start Planning Free</span>
              <div class="absolute inset-0 bg-gradient-to-r from-primary-dark to-secondary-dark opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </a>
            <a href="#pricing" class="group px-8 py-4 border-2 border-primary/30 text-primary hover:text-white hover:border-primary bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm font-semibold text-lg rounded-2xl transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 relative overflow-hidden">
              <span class="relative z-10">Watch Demo</span>
              <div class="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </a>
          </div>

          <!-- Social Proof -->
          <div class="flex items-center justify-center lg:justify-start gap-6 pt-4">
            <div class="flex -space-x-3">
              <img src="https://randomuser.me/api/portraits/women/45.jpg" class="w-10 h-10 rounded-full border-3 border-white shadow-lg" alt="User" />
              <img src="https://randomuser.me/api/portraits/men/32.jpg" class="w-10 h-10 rounded-full border-3 border-white shadow-lg" alt="User" />
              <img src="https://randomuser.me/api/portraits/women/22.jpg" class="w-10 h-10 rounded-full border-3 border-white shadow-lg" alt="User" />
              <div class="w-10 h-10 rounded-full border-3 border-white shadow-lg bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                <span class="text-white font-bold text-xs">5K+</span>
              </div>
            </div>
            <div class="text-left">
              <div class="flex items-center gap-1">
                <svg v-for="star in 5" :key="star" class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400">5,000+ happy customers</p>
            </div>
          </div>
        </div>

        <!-- Visual Section -->
        <div class="relative animate-slideInRight">
          <!-- Main Image Container -->
          <div class="relative">
            <!-- Floating Cards -->
            <div class="absolute -top-8 -left-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-gray-200/50 dark:border-gray-700/50 animate-float">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div>
                  <p class="font-semibold text-gray-900 dark:text-white text-sm">Event Created!</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Planning made easy</p>
                </div>
              </div>
            </div>

            <div class="absolute -bottom-8 -right-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-gray-200/50 dark:border-gray-700/50 animate-float" style="animation-delay: 1s;">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                </div>
                <div>
                  <p class="font-semibold text-gray-900 dark:text-white text-sm">Budget Saved</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">$2,500 under budget</p>
                </div>
              </div>
            </div>

            <!-- Main Image -->
            <div class="relative overflow-hidden rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-700">
              <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
              <img
                :src="HeroImage"
                alt="Beautiful event venue decorated for a celebration"
                class="w-full h-96 lg:h-[500px] object-cover"
                loading="eager"
              />
              <!-- Overlay Content -->
              <div class="absolute bottom-6 left-6 right-6 z-20">
                <div class="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl p-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-semibold text-gray-900 dark:text-white">Dream Quinceañera</p>
                      <p class="text-sm text-gray-600 dark:text-gray-400">150 guests • $8,500 budget</p>
                    </div>
                    <div class="flex items-center gap-1">
                      <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span class="text-sm font-medium text-green-600">Live Planning</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import HeroImage from '@/assets/images/external/hero-venue.jpg'
import CCard from '@/components/UI/cards/CCard.vue'
import { Sparkles } from 'lucide-vue-next'
</script>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes scale-x {
  0% { transform: scaleX(0); }
  100% { transform: scaleX(1); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-scale-x {
  animation: scale-x 2s ease-out 1s forwards;
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}

@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
</style>
