<script setup>
import InternalSidebar from '@/components/internal/layout/InternalSidebar.vue'
import HeaderBar from '@/components/internal/layout/InternalHeaderBar.vue'
import InternalFooter from '@/components/internal/layout/InternalFooter.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-text font-[Poppins]">
    <div class="flex flex-1">
      <!-- Sidebar -->
      <aside class="w-64 bg-white dark:bg-gray-800 shadow-md hidden md:block">
        <InternalSidebar />
      </aside>

      <!-- Main content -->
      <div class="flex-1 flex flex-col">
        <HeaderBar />
        <main class="flex-1 p-6 overflow-y-auto">
          <router-view />
        </main>
      </div>
    </div>

    <!-- Footer covering 100% width -->
    <InternalFooter />
  </div>
</template>
