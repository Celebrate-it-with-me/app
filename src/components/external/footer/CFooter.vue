<template>
  <footer class="bg-gray-900 text-gray-300 pt-section px-4 relative overflow-hidden">
    <!-- Background decorations -->
    <div
      class="absolute -top-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl opacity-30"
    ></div>
    <div
      class="absolute -bottom-40 -right-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl opacity-30"
    ></div>

    <div
      class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 relative"
    >
      <div class="md:col-span-2 lg:col-span-1">
        <img :src="LogoFooter" alt="Celebrate it with me logo footer" class="mb-4 max-w-[200px]" />
        <p class="text-gray-400 mb-6 max-w-xs">
          Making special moments unforgettable with powerful event planning tools for quinceañeras,
          birthdays, and celebrations.
        </p>
        <div class="flex gap-4">
          <a
            href="#"
            aria-label="Instagram"
            class="bg-gray-800 hover:bg-primary/20 p-2 rounded-full transition-colors duration-300"
          >
            <Instagram class="w-5 h-5 text-white" />
          </a>
          <a
            href="#"
            aria-label="Facebook"
            class="bg-gray-800 hover:bg-primary/20 p-2 rounded-full transition-colors duration-300"
          >
            <Facebook class="w-5 h-5 text-white" />
          </a>
          <a
            href="#"
            aria-label="Twitter"
            class="bg-gray-800 hover:bg-primary/20 p-2 rounded-full transition-colors duration-300"
          >
            <Twitter class="w-5 h-5 text-white" />
          </a>
          <a
            href="#"
            aria-label="YouTube"
            class="bg-gray-800 hover:bg-primary/20 p-2 rounded-full transition-colors duration-300"
          >
            <Youtube class="w-5 h-5 text-white" />
          </a>
        </div>
      </div>

      <div>
        <h3 class="text-white font-semibold mb-4 text-lg">Quick Links</h3>
        <ul class="space-y-3">
          <li>
            <a
              href="#features"
              class="hover:text-primary transition-colors duration-200 flex items-center gap-2"
            >
              <ChevronRight class="w-4 h-4 text-primary" />
              <span>Features</span>
            </a>
          </li>
          <li>
            <a
              href="#pricing"
              class="hover:text-primary transition-colors duration-200 flex items-center gap-2"
            >
              <ChevronRight class="w-4 h-4 text-primary" />
              <span>Pricing</span>
            </a>
          </li>
          <li>
            <a
              href="#gallery"
              class="hover:text-primary transition-colors duration-200 flex items-center gap-2"
            >
              <ChevronRight class="w-4 h-4 text-primary" />
              <span>Gallery</span>
            </a>
          </li>
          <li>
            <a
              href="#testimonials"
              class="hover:text-primary transition-colors duration-200 flex items-center gap-2"
            >
              <ChevronRight class="w-4 h-4 text-primary" />
              <span>Testimonials</span>
            </a>
          </li>
        </ul>
      </div>

      <!-- Contact -->
      <div>
        <h3 class="text-white font-semibold mb-4 text-lg">Contact Us</h3>
        <ul class="space-y-3">
          <li class="flex items-start gap-3">
            <Mail class="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p class="text-white">Email Us</p>
              <a
                href="mailto:hello@celebrateitwithme.com"
                class="text-gray-400 hover:text-primary transition-colors duration-200"
                >hello@celebrateitwithme.com</a
              >
            </div>
          </li>
          <li class="flex items-start gap-3">
            <Phone class="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p class="text-white">Call Us</p>
              <a
                href="tel:+12345678901"
                class="text-gray-400 hover:text-primary transition-colors duration-200"
                >+1 (234) 567-8901</a
              >
            </div>
          </li>
          <li class="flex items-start gap-3">
            <MapPin class="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p class="text-white">Location</p>
              <p class="text-gray-400">123 Celebration Ave, Suite 101<br />New York, NY 10001</p>
            </div>
          </li>
        </ul>
      </div>

      <!-- Newsletter -->
      <div class="md:col-span-2 lg:col-span-1">
        <h3 class="text-white font-semibold mb-4 text-lg">Newsletter</h3>
        <p class="text-gray-400 mb-4">
          Subscribe to get planning tips, special offers, and event inspiration.
        </p>
        <form class="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            placeholder="Your email address"
            class="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Email address"
          />
          <button
            type="submit"
            class="bg-primary hover:bg-primary/90 text-white font-medium rounded-lg px-4 py-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Subscribe
          </button>
        </form>
      </div>
    </div>

    <div class="max-w-7xl mx-auto pt-8 pb-6 border-t border-gray-800">
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="text-sm text-gray-500">© 2025 Celebrateitwithme. All rights reserved.</div>
        <div class="flex gap-6 text-sm">
          <a href="#" class="text-gray-500 hover:text-primary transition-colors duration-200"
            >Privacy Policy</a
          >
          <a href="#" class="text-gray-500 hover:text-primary transition-colors duration-200"
            >Terms of Service</a
          >
          <a href="#" class="text-gray-500 hover:text-primary transition-colors duration-200"
            >Cookie Policy</a
          >
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import {
  Mail,
  Phone,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  ChevronRight,
  MapPin
} from 'lucide-vue-next'
import LogoFooter from '@/assets/images/commons/logo_top_secondary2.png'
</script>
