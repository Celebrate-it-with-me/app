<template>
  <footer class="bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-gray-300 relative overflow-hidden">
    <!-- Enhanced Background decorations -->
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-primary/8 rounded-full blur-3xl opacity-40 animate-pulse"></div>
    <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-secondary/8 rounded-full blur-3xl opacity-40 animate-pulse" style="animation-delay: 2s;"></div>
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>

    <!-- Main Footer Content -->
    <div class="relative pt-20 pb-12">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <!-- Top Section with Logo and CTA -->
        <div class="text-center mb-16">
          <div class="inline-flex items-center justify-center mb-6">
            <img :src="LogoFooter" alt="Celebrate it with me logo footer" class="h-12 w-auto">
          </div>
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-4 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            Ready to Create Magic?
          </h2>
          <p class="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Transform your special moments into unforgettable celebrations with our premium event planning platform.
          </p>
        </div>

        <!-- Main Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-16">
          <!-- Company Info -->
          <div class="lg:col-span-1">
            <div class="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-primary/30 transition-all duration-300 group">
              <h3 class="text-white font-bold text-xl mb-4 group-hover:text-primary transition-colors duration-300">About Us</h3>
              <p class="text-gray-400 mb-6 leading-relaxed text-sm">
                Empowering celebrations worldwide with innovative tools for quinceañeras, birthdays, and life's most precious moments.
              </p>
              <div class="flex gap-3">
                <a href="#" aria-label="Instagram" class="group/social bg-gradient-to-br from-gray-700 to-gray-800 hover:from-primary/20 hover:to-primary/10 p-3 rounded-xl transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-primary/25">
                  <Instagram class="w-5 h-5 text-gray-300 group-hover/social:text-primary transition-colors duration-300" />
                </a>
                <a href="#" aria-label="Facebook" class="group/social bg-gradient-to-br from-gray-700 to-gray-800 hover:from-primary/20 hover:to-primary/10 p-3 rounded-xl transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-primary/25">
                  <Facebook class="w-5 h-5 text-gray-300 group-hover/social:text-primary transition-colors duration-300" />
                </a>
                <a href="#" aria-label="Twitter" class="group/social bg-gradient-to-br from-gray-700 to-gray-800 hover:from-primary/20 hover:to-primary/10 p-3 rounded-xl transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-primary/25">
                  <Twitter class="w-5 h-5 text-gray-300 group-hover/social:text-primary transition-colors duration-300" />
                </a>
                <a href="#" aria-label="YouTube" class="group/social bg-gradient-to-br from-gray-700 to-gray-800 hover:from-primary/20 hover:to-primary/10 p-3 rounded-xl transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-primary/25">
                  <Youtube class="w-5 h-5 text-gray-300 group-hover/social:text-primary transition-colors duration-300" />
                </a>
              </div>
            </div>
          </div>

          <!-- Quick Links -->
          <div>
            <h3 class="text-white font-bold text-xl mb-6 relative">
              Quick Links
              <div class="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
            </h3>
            <ul class="space-y-4">
              <li>
                <a href="#features" class="group flex items-center gap-3 text-gray-400 hover:text-white transition-all duration-300 py-2 px-3 rounded-lg hover:bg-gray-800/50">
                  <div class="w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span class="group-hover:translate-x-1 transition-transform duration-300">Features</span>
                </a>
              </li>
              <li>
                <a href="#pricing" class="group flex items-center gap-3 text-gray-400 hover:text-white transition-all duration-300 py-2 px-3 rounded-lg hover:bg-gray-800/50">
                  <div class="w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span class="group-hover:translate-x-1 transition-transform duration-300">Pricing</span>
                </a>
              </li>
              <li>
                <a href="#gallery" class="group flex items-center gap-3 text-gray-400 hover:text-white transition-all duration-300 py-2 px-3 rounded-lg hover:bg-gray-800/50">
                  <div class="w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span class="group-hover:translate-x-1 transition-transform duration-300">Gallery</span>
                </a>
              </li>
              <li>
                <a href="#testimonials" class="group flex items-center gap-3 text-gray-400 hover:text-white transition-all duration-300 py-2 px-3 rounded-lg hover:bg-gray-800/50">
                  <div class="w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span class="group-hover:translate-x-1 transition-transform duration-300">Testimonials</span>
                </a>
              </li>
            </ul>
          </div>

          <!-- Contact -->
          <div>
            <h3 class="text-white font-bold text-xl mb-6 relative">
              Contact Us
              <div class="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
            </h3>
            <ul class="space-y-5">
              <li class="group">
                <div class="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-800/30 transition-all duration-300">
                  <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300">
                    <Mail class="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p class="text-white font-medium mb-1">Email Us</p>
                    <a href="mailto:hello@celebrateitwithme.com" class="text-gray-400 hover:text-primary transition-colors duration-300 text-sm">hello@celebrateitwithme.com</a>
                  </div>
                </div>
              </li>
              <li class="group">
                <div class="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-800/30 transition-all duration-300">
                  <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300">
                    <Phone class="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p class="text-white font-medium mb-1">Call Us</p>
                    <a href="tel:+12345678901" class="text-gray-400 hover:text-primary transition-colors duration-300 text-sm">+1 (234) 567-8901</a>
                  </div>
                </div>
              </li>
              <li class="group">
                <div class="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-800/30 transition-all duration-300">
                  <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300">
                    <MapPin class="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p class="text-white font-medium mb-1">Location</p>
                    <p class="text-gray-400 text-sm leading-relaxed">123 Celebration Ave, Suite 101<br>New York, NY 10001</p>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <!-- Newsletter -->
          <div>
            <h3 class="text-white font-bold text-xl mb-6 relative">
              Stay Updated
              <div class="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
            </h3>
            <div class="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <p class="text-gray-400 mb-6 text-sm leading-relaxed">
                Get exclusive planning tips, special offers, and celebration inspiration delivered to your inbox.
              </p>
              <form class="space-y-4">
                <div class="relative">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    class="w-full bg-gray-900/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300 text-sm"
                    aria-label="Email address"
                  >
                </div>
                <button
                  type="submit"
                  class="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold rounded-xl px-6 py-3 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-gray-900 text-sm"
                >
                  Subscribe Now
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="border-t border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
      <div class="max-w-7xl mx-auto px-6 lg:px-8 py-6">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <div class="text-sm text-gray-500">
            © 2025 <span class="text-primary font-medium">Celebrateitwithme</span>. All rights reserved.
          </div>
          <div class="flex gap-8 text-sm">
            <a href="#" class="text-gray-500 hover:text-primary transition-colors duration-300 hover:underline underline-offset-4">Privacy Policy</a>
            <a href="#" class="text-gray-500 hover:text-primary transition-colors duration-300 hover:underline underline-offset-4">Terms of Service</a>
            <a href="#" class="text-gray-500 hover:text-primary transition-colors duration-300 hover:underline underline-offset-4">Cookie Policy</a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { Mail, Phone, Instagram, Facebook, Twitter, Youtube, ChevronRight, MapPin } from 'lucide-vue-next'
import LogoFooter from '@/assets/images/commons/logo_top_secondary2.png'
</script>
