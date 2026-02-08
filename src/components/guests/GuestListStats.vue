<template>
  <div class="bg-white rounded-lg border border-gray-200 p-4 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div class="flex items-center gap-6">
      <div class="flex items-center gap-2">
        <Users class="w-5 h-5 text-purple-600" />
        <span class="text-gray-900 font-medium">
          {{ totalGuests }} <span class="text-gray-500 font-normal">guests</span>
        </span>
      </div>
      <div class="h-4 w-px bg-gray-200"></div>
      <div class="flex items-center gap-2">
        <span class="text-purple-600 font-bold">{{ totalAttendees }}</span>
        <span class="text-gray-500">total attendees</span>
      </div>
    </div>

    <div v-if="showFilterToggle" class="flex items-center gap-2">
      <label class="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          class="sr-only peer"
          :checked="modelValue"
          @change="$emit('update:modelValue', $event.target.checked); $emit('filter-companions', $event.target.checked)"
        >
        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
        <span class="ml-3 text-sm font-medium text-gray-700 flex items-center gap-2">
          <Filter class="w-4 h-4 text-purple-600" />
          Show only with companions
        </span>
      </label>
    </div>
  </div>
</template>

<script setup>
import { Users, Filter } from 'lucide-vue-next';

defineProps({
  totalGuests: {
    type: Number,
    default: 0
  },
  totalAttendees: {
    type: Number,
    default: 0
  },
  showFilterToggle: {
    type: Boolean,
    default: true
  },
  modelValue: {
    type: Boolean,
    default: false
  }
});

defineEmits(['filter-companions', 'update:modelValue']);
</script>
