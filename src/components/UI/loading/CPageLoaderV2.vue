<script setup>
import QuinviteLogo from '@/components/brand/QuinviteLogo.vue'
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-cream-100">
    <div class="flex flex-col items-center gap-5">
      <QuinviteLogo class="h-10 animate-pulse text-ink-900" />
      <span class="h-1 w-24 overflow-hidden rounded-full bg-cream-300">
        <span class="loader-bar block h-full w-1/2 rounded-full bg-rose-600" />
      </span>
    </div>
  </div>
</template>

<style scoped>
.loader-bar {
  animation: loader 1.2s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .loader-bar {
    animation-duration: 2.4s;
  }
}
@keyframes loader {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(200%);
  }
}
</style>
