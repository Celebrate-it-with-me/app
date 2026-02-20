<template>
  <div
    class="bg-white rounded-lg border border-gray-200 mb-3 hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
  >
    <!-- Main Guest Row -->
    <div
      class="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
      @click="isExpanded = !isExpanded"
    >
      <div class="flex items-center gap-4 flex-1">
        <!-- Chevron Icon -->
        <div class="flex-shrink-0">
          <ChevronDown v-if="isExpanded" class="w-5 h-5 text-purple-600 transition-transform" />
          <ChevronRight v-else class="w-5 h-5 text-purple-600 transition-transform" />
        </div>

        <!-- Guest Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-3 mb-1">
            <h3 class="font-semibold text-gray-900 truncate">{{ guest.name }}</h3>
            <div
              v-if="guest.companions?.length"
              class="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
            >
              <Users class="w-3 h-3" />
              {{ guest.companions.length }}
            </div>
          </div>

          <div class="flex flex-wrap gap-x-4 gap-y-1">
            <div class="flex items-center text-sm text-gray-600 gap-1.5">
              <Mail class="w-4 h-4 text-gray-400" />
              <span class="truncate">{{ guest.email || 'N/A' }}</span>
            </div>
            <div class="flex items-center text-sm text-gray-600 gap-1.5">
              <Phone class="w-4 h-4 text-gray-400" />
              <span>{{ guest.phone || 'N/A' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2" @click.stop>
        <button
          class="p-2 hover:bg-purple-50 text-gray-400 hover:text-purple-600 rounded-lg transition-colors"
          title="View Details"
          @click="emit('show-details', guest)"
        >
          <Eye class="w-5 h-5" />
        </button>
        <button
          class="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
          title="Delete Guest"
          @click="emit('delete-guest', guest.id)"
        >
          <Trash2 class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Collapsible Companions List -->
    <transition name="expand">
      <div v-if="isExpanded && guest.companions?.length">
        <CompanionsList :companions="guest.companions" />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ChevronRight, ChevronDown, Users, Mail, Phone, Eye, Trash2 } from 'lucide-vue-next'
import CompanionsList from './CompanionsList.vue'

defineProps({
  guest: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['show-details', 'delete-guest'])

const isExpanded = ref(false)
</script>

<style scoped></style>
