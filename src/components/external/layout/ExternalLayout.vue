<template>
  <div class="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-text font-[Poppins]">
    <CNavbarLanding />
    <main class="flex-grow">
      <router-view />
    </main>
    <CFooter class="flex-shrink-0" />
  </div>
</template>

<script setup>
import CNavbarLanding from '@/components/external/navigation/CNavbarLanding.vue'
import CFooter from '@/components/external/footer/CFooter.vue'

</script>
