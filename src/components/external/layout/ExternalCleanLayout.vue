<script setup>
import QuinviteLogo from '@/components/brand/QuinviteLogo.vue'
import LocaleSwitch from '@/components/external/navigation/LocaleSwitch.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-cream-100 text-ink-900">
    <header class="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
      <router-link to="/" class="text-ink-900" aria-label="Quinvite">
        <QuinviteLogo class="h-8" />
      </router-link>
      <LocaleSwitch />
    </header>
    <main class="flex flex-1 items-start justify-center px-4 py-8 sm:items-center sm:py-12">
      <router-view />
    </main>
  </div>
</template>
