<template>
  <footer class="bg-gray-900 text-gray-300 pt-section px-4">
    <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 pb-10">
      <div>
        <h2 class="text-white text-xl font-bold mb-3">🎉 Celebrateitwithme</h2>
        <p class="text-sm">
          Making special moments unforgettable with powerful event planning tools.
        </p>
      </div>

      <div>
        <h3 class="text-white font-semibold mb-3">Quick Links</h3>
        <ul class="space-y-2 text-sm">
          <li><a href="#features" class="hover:text-white">Features</a></li>
          <li><a href="#pricing" class="hover:text-white">Pricing</a></li>
          <li><a href="#gallery" class="hover:text-white">Gallery</a></li>
          <li><a href="#testimonials" class="hover:text-white">Testimonials</a></li>
        </ul>
      </div>

      <!-- Contact -->
      <div>
        <h3 class="text-white font-semibold mb-3">Contact</h3>
        <ul class="space-y-2 text-sm">
          <li class="flex items-center gap-2">
            <Mail class="w-4 h-4 text-primary" />
            hello@celebrateitwithme.com
          </li>
          <li class="flex items-center gap-2">
            <Phone class="w-4 h-4 text-primary" />
            +1 (234) 567-890
          </li>
        </ul>
      </div>

      <!-- Social -->
      <div>
        <h3 class="text-white font-semibold mb-3">Follow Us</h3>
        <div class="flex gap-4">
          <a href="#"><Instagram class="w-5 h-5 hover:text-white" /></a>
          <a href="#"><Facebook class="w-5 h-5 hover:text-white" /></a>
          <a href="#"><Twitter class="w-5 h-5 hover:text-white" /></a>
        </div>
      </div>
    </div>

    <hr class="border-gray-700 mb-6" />

    <div class="text-center text-sm text-gray-500 pb-6">
      © 2025 Celebrateitwithme. All rights reserved.
    </div>
  </footer>
</template>

<script setup>
import { Mail, Phone, Instagram, Facebook, Twitter } from 'lucide-vue-next'
</script>
