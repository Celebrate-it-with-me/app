<script setup></script>

<template>
  <div class="relative mb-8">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 class="text-4xl font-black text-gray-900 tracking-tight mb-2">
          Sweet
          <span class="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
            Memories
          </span>
        </h1>
        <p class="text-gray-500 font-medium">
          Create a timeline of special moments to share the honoree's story
        </p>
      </div>

      <slot name="actions" />
    </div>
  </div>
</template>
