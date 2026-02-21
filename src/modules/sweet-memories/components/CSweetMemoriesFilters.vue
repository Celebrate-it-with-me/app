<script setup>
defineProps({
  searchQuery: { type: String, required: true },
  yearFilter: { type: [String, Number], required: true },
  sortOrder: { type: String, required: true },
  availableYears: { type: Array, required: true }
})

const emit = defineEmits(['update:searchQuery', 'update:yearFilter', 'update:sortOrder', 'clear'])
</script>

<template>
  <div class="mb-6">
    <div class="flex flex-col sm:flex-row gap-4">
      <!-- Search -->
      <div class="flex-1 relative">
        <input
          :value="searchQuery"
          type="text"
          placeholder="Search memories..."
          class="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          @input="emit('update:searchQuery', $event.target.value)"
        />
        <svg
          class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <!-- Year -->
      <select
        :value="yearFilter"
        class="bg-white border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        @change="emit('update:yearFilter', $event.target.value)"
      >
        <option value="">All Years</option>
        <option v-for="year in availableYears" :key="year" :value="year">
          {{ year }}
        </option>
      </select>

      <!-- Sort -->
      <select
        :value="sortOrder"
        class="bg-white border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        @change="emit('update:sortOrder', $event.target.value)"
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="most-loved">Most Loved</option>
      </select>

      <!-- Clear -->
      <button
        type="button"
        class="px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-all"
        @click="emit('clear')"
      >
        Clear
      </button>
    </div>
  </div>
</template>
