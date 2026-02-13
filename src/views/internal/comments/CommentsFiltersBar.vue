<template>
  <div class="flex flex-col md:flex-row items-center gap-4 mb-6">
    <div class="relative flex-grow w-full md:w-auto">
      <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <input
        type="text"
        :value="search"
        placeholder="Search by guest name or comment..."
        class="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
        @input="$emit('update:search', $event.target.value)"
      />
    </div>

    <div class="flex items-center gap-3 w-full md:w-auto">
      <select
        :value="statusFilter"
        class="bg-white border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm font-medium text-gray-700"
        @change="$emit('update:statusFilter', $event.target.value)"
      >
        <option value="all">All Status</option>
        <option value="visible">Visible</option>
        <option value="pending">Pending Review</option>
        <option value="hidden">Hidden</option>
      </select>

      <select
        :value="sortOrder"
        class="bg-white border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm font-medium text-gray-700"
        @change="$emit('update:sortOrder', $event.target.value)"
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="pinned">Pinned first</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { Search } from 'lucide-vue-next'

defineProps({
  search: { type: String, required: true },
  statusFilter: { type: String, required: true },
  sortOrder: { type: String, required: true }
})

defineEmits(['update:search', 'update:statusFilter', 'update:sortOrder'])
</script>
