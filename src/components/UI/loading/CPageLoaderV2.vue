<script setup>
import QuinviteLogo from '@/components/brand/QuinviteLogo.vue'
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-cream-100">
    <div class="flex flex-col items-center gap-5">
      <QuinviteLogo class="h-10 animate-pulse text-ink-900" />
      <span class="h-1 w-24 overflow-hidden rounded-full bg-cream-300">
        <span class="block h-full w-1/2 animate-[loader_1.2s_ease-in-out_infinite] rounded-full bg-rose-600" />
      </span>
    </div>
  </div>
</template>

<style scoped>
@keyframes loader {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(200%);
  }
}
</style>
