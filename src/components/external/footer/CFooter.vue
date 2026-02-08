<template>
  <footer class="bg-gray-900 text-white">

    <!-- Main Footer Content -->
    <div class="max-w-7xl mx-auto px-6 py-16">
      <div class="grid md:grid-cols-4 gap-12">

        <!-- Column 1: About -->
        <div>
          <!-- Logo -->
          <div class="mb-6">
            <img
              src="/src/assets/images/commons/logo_primary_2.png"
              alt="CWM"
              class="h-10"
            />
          </div>

          <!-- Mission -->
          <p class="text-gray-400 text-sm leading-relaxed mb-6">
            Beautiful digital invitations and planning tools
            for quinceañeras, weddings, and life's special moments.
          </p>
        </div>

        <!-- Column 2: Product -->
        <div>
          <h3 class="text-white font-bold mb-4">Product</h3>
          <ul class="space-y-3 text-sm">
            <li><a href="#features" class="text-gray-400 hover:text-white transition-colors">Features</a></li>
            <li><a href="#pricing" class="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
            <li><a href="/how-it-works" class="text-gray-400 hover:text-white transition-colors">How It Works</a></li>
            <li><a href="/faq" class="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
          </ul>
        </div>

        <!-- Column 3: Company -->
        <div>
          <h3 class="text-white font-bold mb-4">Company</h3>
          <ul class="space-y-3 text-sm">
            <li><a href="/about" class="text-gray-400 hover:text-white transition-colors">About Us</a></li>
            <li><a href="/contact" class="text-gray-400 hover:text-white transition-colors">Contact</a></li>
            <li><a href="/blog" class="text-gray-400 hover:text-white transition-colors">Blog</a></li>
            <!-- Only if you have affiliate program -->
            <!-- <li><a href="/affiliates" class="text-gray-400 hover:text-white transition-colors">Affiliates</a></li> -->
          </ul>
        </div>

        <!-- Column 4: Newsletter -->
        <div>
          <h3 class="text-white font-bold mb-4">Stay Updated</h3>
          <p class="text-gray-400 text-sm mb-4">
            Free planning guides + early access to new features.
            Unsubscribe anytime.
          </p>

          <form class="space-y-3">
            <input
              type="email"
              placeholder="your@email.com"
              class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <button
              type="submit"
              class="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
            >
              Subscribe
            </button>
          </form>
        </div>

      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="border-t border-gray-800">
      <div class="max-w-7xl mx-auto px-6 py-6">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">

          <!-- Copyright -->
          <p class="text-gray-400 text-sm">
            © 2026 Celebrate It With Me. All rights reserved.
          </p>

          <!-- Legal Links -->
          <div class="flex gap-6 text-sm">
            <a href="/privacy" class="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
            <a href="/terms" class="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
            <a href="/cookies" class="text-gray-400 hover:text-white transition-colors">Cookie Policy</a>
          </div>

        </div>
      </div>
    </div>

  </footer>
</template>

<script setup>
import { Instagram } from 'lucide-vue-next'
</script>
