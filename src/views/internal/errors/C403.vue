<script setup>
import { ShieldOff } from 'lucide-vue-next'
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full text-center py-16">
    <ShieldOff class="w-16 h-16 text-red-500 mb-4" />
    <h1 class="text-3xl font-bold text-red-600">Access Denied</h1>
    <p class="text-gray-600 text-lg mt-2">You do not have permission to access this resource.</p>
    <RouterLink to="/dashboard" class="mt-6 text-sm font-medium text-blue-500 hover:underline">
      ← Back to Dashboard
    </RouterLink>
  </div>
</template>
