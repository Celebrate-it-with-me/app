<template>
  <div class="bg-white dark:bg-gray-900 text-text font-[Poppins]">
    <CNavbarLanding />
    <main>
      <router-view />
    </main>
    <CFooter />
  </div>
</template>

<script setup>
import CNavbarLanding from '@/components/external/navigation/CNavbarLanding.vue'
import CFooter from '@/components/external/footer/CFooter.vue'

</script>
