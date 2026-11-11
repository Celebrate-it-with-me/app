<script setup>
import PublicNavbar from '@/components/external/navigation/PublicNavbar.vue'
import PublicFooter from '@/components/external/footer/PublicFooter.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-cream-100 text-ink-900">
    <a
      href="#main-content"
      class="sr-only z-50 rounded-md bg-rose-600 px-4 py-2 text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
    >
      Ir al contenido
    </a>
    <PublicNavbar />
    <main id="main-content" class="flex-1" tabindex="-1">
      <router-view />
    </main>
    <PublicFooter />
  </div>
</template>
