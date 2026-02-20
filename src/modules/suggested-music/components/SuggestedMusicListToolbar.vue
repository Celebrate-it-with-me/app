<script setup>
// All comments in code are in English, as requested.

import CButton from '@/components/UI/buttons/CButton.vue'
import { Filter, Flame, Search, SortDesc, User, Users } from 'lucide-vue-next'

const props = defineProps({
  localSearch: { type: String, default: '' },
  sortBy: { type: String, default: 'recent' },
  filterBy: { type: String, default: 'all' }
})

const emit = defineEmits(['update:localSearch', 'update:sortBy', 'update:filterBy'])

const setFilter = value => emit('update:filterBy', value)
</script>

<template>
  <div class="mb-6 space-y-4">
    <!-- Row 1: Search and Sort -->
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="flex-1 relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          :value="props.localSearch"
          type="text"
          class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
          placeholder="Search in list..."
          @input="e => emit('update:localSearch', e.target.value)"
        />
      </div>

      <div class="sm:w-64">
        <div class="relative">
          <SortDesc class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            :value="props.sortBy"
            class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white appearance-none cursor-pointer"
            @change="e => emit('update:sortBy', e.target.value)"
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
            <option value="mostVoted">Most Voted</option>
            <option value="alphabetical">A-Z Title</option>
          </select>

          <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              class="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 2: Filter Buttons -->
    <div class="flex items-center gap-2 flex-wrap">
      <div class="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
        <Filter class="w-4 h-4" />
        <span class="font-medium">Filter:</span>
      </div>

      <div class="flex gap-2 flex-wrap">
        <CButton
          :variant="props.filterBy === 'all' ? 'primary' : 'outline'"
          size="sm"
          @click="setFilter('all')"
        >
          All Songs
        </CButton>

        <CButton
          :variant="props.filterBy === 'admin' ? 'primary' : 'outline'"
          size="sm"
          @click="setFilter('admin')"
        >
          <User class="w-4 h-4 mr-1" />
          Admin Added
        </CButton>

        <CButton
          :variant="props.filterBy === 'guest' ? 'primary' : 'outline'"
          size="sm"
          @click="setFilter('guest')"
        >
          <Users class="w-4 h-4 mr-1" />
          Guest Suggested
        </CButton>

        <CButton
          :variant="props.filterBy === 'topVoted' ? 'primary' : 'outline'"
          size="sm"
          @click="setFilter('topVoted')"
        >
          <Flame class="w-4 h-4 mr-1" />
          Top Voted
        </CButton>
      </div>
    </div>
  </div>
</template>
