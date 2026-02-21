<script setup>
import { Camera } from 'lucide-vue-next'

defineProps({
  totalMemories: { type: Number, required: true },
  totalReactions: { type: Number, required: true },
  totalViews: { type: Number, required: true }
})
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <!-- Total Memories -->
    <div
      class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
          <Camera class="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <div class="text-2xl font-bold text-gray-900">{{ totalMemories }}</div>
          <div class="text-sm text-gray-600">Total Memories</div>
        </div>
      </div>
    </div>

    <!-- Total Reactions -->
    <div
      class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-pink-100 flex items-center justify-center">
          <svg class="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div>
          <div class="text-2xl font-bold text-gray-900">{{ totalReactions }}</div>
          <div class="text-sm text-gray-600">Total Reactions</div>
        </div>
      </div>
    </div>

    <!-- Total Views -->
    <div
      class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
          <svg
            class="w-6 h-6 text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </div>
        <div>
          <div class="text-2xl font-bold text-gray-900">{{ totalViews }}</div>
          <div class="text-sm text-gray-600">Total Views</div>
        </div>
      </div>
    </div>
  </div>
</template>
