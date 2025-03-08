<script setup>
import { useTemplateStore } from '@/stores/useTemplateStore'
import { computed } from 'vue'

const templateStore = useTemplateStore()

const currentYear = computed(() => new Date().getFullYear())
</script>

<template>
  <!-- Footer Section -->
  <footer
    class="footer w-full bg-gray-800 text-white py-6 flex flex-col justify-center items-center gap-6"
  >
    <!-- Event Details -->
    <div class="event-details text-center">
      <h3 class="text-2xl font-gvibes font-bold">
        {{ templateStore.event?.eventName ?? '' }}
      </h3>
    </div>

    <!-- Navigation Links -->
    <nav class="footer-nav flex flex-wrap justify-center gap-6">
      <a href="#save-the-date" class="footer-link text-gray-300 hover:text-pink-300 transition"
        >Save The Date</a
      >
      <a href="#sweet-memories" class="footer-link text-gray-300 hover:text-pink-300 transition"
        >Recuerdos</a
      >
      <a href="#rsvp" class="footer-link text-gray-300 hover:text-pink-300 transition">RSVP</a>
      <a href="#dress-code" class="footer-link text-gray-300 hover:text-pink-300 transition"
        >Código de Vestimenta</a
      >
      <a href="#comments" class="footer-link text-gray-300 hover:text-pink-300 transition"
        >Comentarios</a
      >
    </nav>

    <!-- Social Media Links (Optional) -->
    <div class="social-media-links flex gap-4">
      <a
        href="https://facebook.com/quinceanera"
        target="_blank"
        class="text-gray-300 hover:text-blue-400 transition text-xl"
        aria-label="Visita nuestro Facebook"
      >
        <i class="fab fa-facebook"></i>
      </a>
      <a
        href="https://instagram.com/quinceanera"
        target="_blank"
        class="text-gray-300 hover:text-pink-400 transition text-xl"
        aria-label="Visita nuestro Instagram"
      >
        <i class="fab fa-instagram"></i>
      </a>
      <a
        href="https://wa.me/5211234567890"
        target="_blank"
        class="text-gray-300 hover:text-green-400 transition text-xl"
        aria-label="Enviar mensaje en WhatsApp"
      >
        <i class="fab fa-whatsapp"></i>
      </a>
    </div>

    <!-- Footer Bottom Note -->
    <div class="footer-bottom text-sm text-gray-400 mt-4">
      <p>© {{ currentYear }} Celebrate It with me. All rights reserved.</p>
    </div>
  </footer>
</template>

<style scoped>
.footer a {
  text-decoration: none;
}

.footer-link:hover {
  font-weight: 500;
}
</style>
