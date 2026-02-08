<template>
  <div class="bg-gray-50 border-t border-gray-200 px-4 py-3">
    <div class="space-y-2">
      <div
        v-for="companion in companions"
        :key="companion.id"
        class="grid grid-cols-[20px_1fr_1fr_1fr] gap-3 text-sm text-gray-600 opacity-80 py-1 items-center"
      >
        <CornerDownRight class="w-4 h-4 text-gray-400" />
        <div class="font-medium text-gray-700 truncate">{{ companion.name }}</div>
        <div class="flex items-center gap-1.5 truncate">
          <Mail class="w-3.5 h-3.5 text-gray-400" />
          <span class="truncate">{{ companion.email || 'N/A' }}</span>
        </div>
        <div class="flex items-center gap-1.5 truncate">
          <Phone class="w-3.5 h-3.5 text-gray-400" />
          <span class="truncate">{{ companion.phone || 'N/A' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { CornerDownRight, Mail, Phone } from 'lucide-vue-next';

defineProps({
  companions: {
    type: Array,
    default: () => []
  }
});
</script>
