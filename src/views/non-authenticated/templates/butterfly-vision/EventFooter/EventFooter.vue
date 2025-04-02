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
      <h3 class="text-2xl font-gvibes font-bold">Melissa Quinces</h3>
    </div>

    <!-- Disclosures Section -->
    <div class="footer-disclosures text-sm text-gray-400 text-center">
      <p>This website and its materials are provided for personal, non-commercial use only.</p>
      <p>
        All content, images, and trademarks are property of their respective owners. No part of this
        site may be reproduced or distributed without permission.
      </p>
      <p>
        For any inquiries, contact us at
        <a href="mailto:info@melissaquinces.com" class="text-blue-400 hover:underline">
          info@melissaquinces.com </a
        >.
      </p>
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
