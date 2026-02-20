<script setup>
defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' }
})
</script>

<template>
  <div class="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-10">
    <div class="w-full max-w-2xl">
      <div class="rounded-2xl border border-gray-200 bg-white shadow-card overflow-hidden">
        <div class="px-6 py-5 border-b border-gray-100">
          <h1 class="text-lg font-semibold text-gray-900">{{ title }}</h1>
          <p v-if="subtitle" class="text-sm text-gray-500 mt-1">{{ subtitle }}</p>
        </div>

        <div class="p-6">
          <slot />
        </div>
      </div>

      <div class="mt-6 text-center text-xs text-gray-400">
        © {{ new Date().getFullYear() }} Celebrate It With Me
      </div>
    </div>
  </div>
</template>
