<template>
  <section class="py-24 px-4 bg-gradient-to-b from-white via-gray-50/30 to-white dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-900 relative overflow-hidden">
    <!-- Enhanced Background Elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-l from-primary/10 to-secondary/10 rounded-full blur-3xl opacity-60 animate-pulse"></div>
      <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-secondary/10 to-accent/10 rounded-full blur-3xl opacity-50 animate-pulse" style="animation-delay: 2s;"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-pink-200/20 to-purple-200/20 rounded-full blur-2xl opacity-30"></div>

      <!-- Floating geometric shapes -->
      <div class="absolute top-20 left-20 w-8 h-8 bg-primary/20 rounded-lg rotate-45 animate-spin-slow"></div>
      <div class="absolute bottom-32 right-32 w-6 h-6 bg-secondary/30 rounded-full animate-bounce" style="animation-delay: 1s;"></div>
      <div class="absolute top-1/3 right-1/4 w-4 h-4 bg-accent/40 rounded-full animate-pulse" style="animation-delay: 3s;"></div>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto">
      <!-- Header Section -->
      <div class="text-center mb-20 animate-fadeIn">
        <div class="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 backdrop-blur-sm mb-6">
          <Rocket class="w-4 h-4 text-primary mr-2" />
          <span class="text-sm font-semibold text-primary">Features</span>
          <span class="text-sm text-gray-600 dark:text-gray-300">Everything you need</span>
        </div>

        <CHeading :level="2" weight="bold" class="mb-6 text-4xl sm:text-5xl lg:text-6xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
          Everything You Need to Plan
          <span class="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Perfect Events</span>
        </CHeading>
        <p class="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
          Powerful AI-driven tools and intuitive features designed to make event planning effortless,
          enjoyable, and absolutely <span class="font-semibold text-primary">unforgettable</span>.
        </p>
      </div>

      <!-- Main Feature Cards -->
      <div class="grid gap-8 lg:grid-cols-3 mb-16">
        <!-- Feature Card 1 - Enhanced -->
        <div class="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200/50 dark:border-gray-700/50 transform hover:-translate-y-2">
          <!-- Card Background Gradient -->
          <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div class="relative p-8">
            <!-- Icon with enhanced design -->
            <div class="relative mb-6">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <CalendarCheck class="w-8 h-8 text-primary" />
              </div>
              <div class="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-0 group-hover:scale-100">
                <span class="text-white text-xs font-bold">AI</span>
              </div>
            </div>

            <h3 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-primary transition-colors duration-300">
              Smart Event Planning
            </h3>
            <p class="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              AI-powered planning tools, intelligent checklists, and automated timelines that adapt to your event needs.
            </p>

            <!-- Enhanced Feature List -->
            <div class="space-y-3">
              <div class="flex items-center group/item">
                <div class="w-5 h-5 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center mr-3 transform group-hover/item:scale-110 transition-transform duration-300">
                  <CheckCircle2 class="w-3 h-3 text-white" />
                </div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover/item:text-gray-900 dark:group-hover/item:text-white transition-colors duration-300">AI-powered timeline generation</span>
              </div>
              <div class="flex items-center group/item">
                <div class="w-5 h-5 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 flex items-center justify-center mr-3 transform group-hover/item:scale-110 transition-transform duration-300">
                  <CheckCircle2 class="w-3 h-3 text-white" />
                </div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover/item:text-gray-900 dark:group-hover/item:text-white transition-colors duration-300">Smart task prioritization</span>
              </div>
              <div class="flex items-center group/item">
                <div class="w-5 h-5 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center mr-3 transform group-hover/item:scale-110 transition-transform duration-300">
                  <CheckCircle2 class="w-3 h-3 text-white" />
                </div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover/item:text-gray-900 dark:group-hover/item:text-white transition-colors duration-300">Automated vendor coordination</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Feature Card 2 - Enhanced -->
        <div class="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200/50 dark:border-gray-700/50 transform hover:-translate-y-2">
          <div class="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div class="relative p-8">
            <div class="relative mb-6">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center mb-4 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Users2 class="w-8 h-8 text-secondary" />
              </div>
              <div class="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-0 group-hover:scale-100">
                <span class="text-white text-xs font-bold">+</span>
              </div>
            </div>

            <h3 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-secondary transition-colors duration-300">
              Guest Experience Hub
            </h3>
            <p class="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Comprehensive guest management with beautiful invitations, real-time RSVPs, and interactive seating charts.
            </p>

            <div class="space-y-3">
              <div class="flex items-center group/item">
                <div class="w-5 h-5 rounded-full bg-gradient-to-r from-pink-400 to-rose-500 flex items-center justify-center mr-3 transform group-hover/item:scale-110 transition-transform duration-300">
                  <CheckCircle2 class="w-3 h-3 text-white" />
                </div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover/item:text-gray-900 dark:group-hover/item:text-white transition-colors duration-300">Real-time RSVP dashboard</span>
              </div>
              <div class="flex items-center group/item">
                <div class="w-5 h-5 rounded-full bg-gradient-to-r from-indigo-400 to-blue-500 flex items-center justify-center mr-3 transform group-hover/item:scale-110 transition-transform duration-300">
                  <CheckCircle2 class="w-3 h-3 text-white" />
                </div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover/item:text-gray-900 dark:group-hover/item:text-white transition-colors duration-300">Drag & drop seating planner</span>
              </div>
              <div class="flex items-center group/item">
                <div class="w-5 h-5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center mr-3 transform group-hover/item:scale-110 transition-transform duration-300">
                  <CheckCircle2 class="w-3 h-3 text-white" />
                </div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover/item:text-gray-900 dark:group-hover/item:text-white transition-colors duration-300">Designer invitation templates</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Feature Card 3 - Enhanced -->
        <div class="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200/50 dark:border-gray-700/50 transform hover:-translate-y-2">
          <div class="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div class="relative p-8">
            <div class="relative mb-6">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center mb-4 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Wallet class="w-8 h-8 text-accent" />
              </div>
              <div class="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-0 group-hover:scale-100">
                <span class="text-white text-xs font-bold">$</span>
              </div>
            </div>

            <h3 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-accent transition-colors duration-300">
              Smart Budget Control
            </h3>
            <p class="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              AI-driven budget optimization with real-time expense tracking, cost predictions, and money-saving recommendations.
            </p>

            <div class="space-y-3">
              <div class="flex items-center group/item">
                <div class="w-5 h-5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center mr-3 transform group-hover/item:scale-110 transition-transform duration-300">
                  <CheckCircle2 class="w-3 h-3 text-white" />
                </div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover/item:text-gray-900 dark:group-hover/item:text-white transition-colors duration-300">Predictive budget analysis</span>
              </div>
              <div class="flex items-center group/item">
                <div class="w-5 h-5 rounded-full bg-gradient-to-r from-red-400 to-pink-500 flex items-center justify-center mr-3 transform group-hover/item:scale-110 transition-transform duration-300">
                  <CheckCircle2 class="w-3 h-3 text-white" />
                </div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover/item:text-gray-900 dark:group-hover/item:text-white transition-colors duration-300">Automated expense categorization</span>
              </div>
              <div class="flex items-center group/item">
                <div class="w-5 h-5 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center mr-3 transform group-hover/item:scale-110 transition-transform duration-300">
                  <CheckCircle2 class="w-3 h-3 text-white" />
                </div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover/item:text-gray-900 dark:group-hover/item:text-white transition-colors duration-300">Cost-saving recommendations</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Additional Features Section -->
      <div class="grid md:grid-cols-3 gap-8 text-center">
        <div class="group p-6 animate-fadeIn" style="animation-delay: 0.1s;">
          <div class="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-4 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <MessageSquare class="w-8 h-8 text-primary" />
          </div>
          <h3 class="text-xl font-bold mb-3 text-gray-900 dark:text-white">24/7 Expert Support</h3>
          <p class="text-gray-600 dark:text-gray-400 leading-relaxed">Get personalized help from our event planning experts whenever you need it, day or night.</p>
        </div>

        <div class="group p-6 animate-fadeIn" style="animation-delay: 0.2s;">
          <div class="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary/10 to-accent/10 flex items-center justify-center mb-4 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <ShieldCheck class="w-8 h-8 text-secondary" />
          </div>
          <h3 class="text-xl font-bold mb-3 text-gray-900 dark:text-white">Enterprise Security</h3>
          <p class="text-gray-600 dark:text-gray-400 leading-relaxed">Your precious memories and data are protected with bank-level encryption and security protocols.</p>
        </div>

        <div class="group p-6 animate-fadeIn" style="animation-delay: 0.3s;">
          <div class="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/10 to-primary/10 flex items-center justify-center mb-4 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <Smartphone class="w-8 h-8 text-accent" />
          </div>
          <h3 class="text-xl font-bold mb-3 text-gray-900 dark:text-white">Mobile-First Design</h3>
          <p class="text-gray-600 dark:text-gray-400 leading-relaxed">Plan your perfect event on-the-go with our fully responsive mobile experience and native apps.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import CHeading from '@/components/UI/headings/CHeading.vue'
import { CalendarCheck, Users2, Wallet, CheckCircle2, MessageSquare, ShieldCheck, Smartphone, Rocket } from 'lucide-vue-next'
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 1s ease-out forwards;
  opacity: 0;
}

.animate-spin-slow {
  animation: spin-slow 8s linear infinite;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
