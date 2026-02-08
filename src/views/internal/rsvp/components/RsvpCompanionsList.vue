<template>
  <div class="bg-gray-50 border-t border-gray-200 px-4 py-1">
    <div
      v-for="companion in companions"
      :key="companion.id"
      class="grid grid-cols-[20px_1fr_auto] gap-3 py-2 items-center border-b border-gray-100 last:border-0"
    >
      <CornerDownRight class="w-4 h-4 text-gray-400" />
      <span class="text-sm text-gray-600 font-medium">{{ companion.name }}</span>
      <RsvpStatusBadge :status="companion.rsvpStatus" compact />
    </div>
  </div>
</template>

<script setup>
import { CornerDownRight } from 'lucide-vue-next';
import RsvpStatusBadge from './RsvpStatusBadge.vue';

defineProps({
  companions: {
    type: Array,
    default: () => []
  }
});
</script>
