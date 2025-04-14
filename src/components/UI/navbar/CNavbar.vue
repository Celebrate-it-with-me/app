<template>
  <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm font-[Poppins]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
      <div class="flex items-center gap-2">
        <slot name="logo">
          <span class="text-pink-500 font-bold text-xl">🎉 {{ logo }}</span>
        </slot>
      </div>
      <nav class="hidden md:flex items-center gap-6 text-sm font-medium">
        <template v-for="(link, index) in links" :key="index">
          <a :href="link.href" class="text-gray-700 dark:text-gray-300 hover:text-primary">{{ link.label }}</a>
        </template>
      </nav>
      <div class="flex items-center gap-4">
        <slot name="extra">
          <a v-if="loginLink" :href="loginLink" class="text-sm text-gray-600 dark:text-gray-300 hover:text-primary">Login</a>
          <a v-if="ctaText && ctaHref" :href="ctaHref" class="px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-primary to-secondary text-white shadow-glow">
            {{ ctaText }}
          </a>
        </slot>
      </div>
    </div>
  </header>
</template>

<script setup>
const props = defineProps({
  logo: {
    type: String,
    default: 'Celebrateitwithme'
  },
  links: {
    type: Array,
    default: () => []
  },
  loginLink: String,
  ctaText: String,
  ctaHref: String
})
</script>
