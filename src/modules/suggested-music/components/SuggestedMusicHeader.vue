<script setup>
// All comments in code are in English, as requested.

import CButton from '@/components/UI/buttons/CButton.vue'
import { ChevronDown, Download, Loader2 } from 'lucide-vue-next'

const props = defineProps({
  loading: { type: Boolean, default: false },
  exporting: { type: Boolean, default: false },
  showExportDropdown: { type: Boolean, default: false }
})

const emit = defineEmits([
  'toggle-export-dropdown',
  'export' // payload: 'xlsx' | 'csv' | 'pdf'
])

const onToggle = () => emit('toggle-export-dropdown')
const onExport = format => emit('export', format)
</script>

<template>
  <div class="relative mb-12">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 class="text-4xl font-black text-gray-900 tracking-tight mb-2">
          Suggested
          <span class="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600"
            >Music</span
          >
        </h1>
        <p class="text-gray-500 font-medium">Manage music suggestions for your event</p>
      </div>

      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div class="relative">
          <CButton
            variant="outline"
            :disabled="props.exporting || props.loading"
            class="flex items-center gap-2"
            @click="onToggle"
          >
            <template v-if="props.exporting">
              <Loader2 class="w-4 h-4 animate-spin" />
              Exporting...
            </template>
            <template v-else>
              <Download class="w-4 h-4" />
              Export Playlist
              <ChevronDown class="w-4 h-4 ml-1" />
            </template>
          </CButton>

          <transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div
              v-if="props.showExportDropdown"
              class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50"
            >
              <div class="py-1" role="menu" aria-orientation="vertical">
                <button
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  role="menuitem"
                  @click="onExport('xlsx')"
                >
                  Excel (.xlsx)
                </button>
                <button
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  role="menuitem"
                  @click="onExport('csv')"
                >
                  CSV (.csv)
                </button>
                <button
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  role="menuitem"
                  @click="onExport('pdf')"
                >
                  PDF (.pdf)
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>
