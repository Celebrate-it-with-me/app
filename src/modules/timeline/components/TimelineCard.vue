<template>
  <div class="relative">
    <CCard variant="feature" class="transition-all duration-300 hover:shadow-md">
      <template #title>
        <div class="flex justify-between items-start">
          <div class="flex items-center">
            <component
              :is="getIconComponent(item.icon)"
              v-if="item.icon"
              class="w-5 h-5 mr-2 text-primary"
            />
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ item.title }}
            </h3>
          </div>
          <div class="flex space-x-2">
            <button
              class="text-gray-500 hover:text-primary transition-colors"
              title="Edit"
              @click="$emit('edit', item)"
            >
              <Edit class="w-4 h-4" />
            </button>
            <button
              class="text-gray-500 hover:text-red-500 transition-colors"
              title="Delete"
              @click="$emit('delete', item)"
            >
              <Trash class="w-4 h-4" />
            </button>
          </div>
        </div>
      </template>

      <template #content>
        <div class="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
          <Clock class="w-4 h-4 mr-2" />
          <span>{{ formatTimeRange(item.start_time, item.end_time) }}</span>
        </div>
        <p v-if="item.description" class="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {{ item.description }}
        </p>
      </template>
    </CCard>
  </div>
</template>

<script setup>
import {
  Clock,
  Edit,
  Trash,
  Calendar,
  Music,
  Utensils,
  Camera,
  Gift,
  Cake,
  GlassWater,
  MicVocal,
  PartyPopper,
  Users
} from 'lucide-vue-next'
import CCard from '@/components/UI/cards/CCard.vue'

defineProps({
  item: {
    type: Object,
    required: true
  }
})

defineEmits(['edit', 'delete'])

const getIconComponent = iconName => {
  if (!iconName) return Clock

  const iconMap = {
    Calendar,
    Clock,
    Utensils,
    Music,
    Camera,
    Gift,
    Cake,
    GlassWater,
    MicVocal,
    PartyPopper,
    Users
  }

  return iconMap[iconName] || Clock
}

const formatTimeRange = (start, end) => {
  if (!start) return ''

  const options = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }

  // Handle both formats: "MM/DD/YYYY HH:mm" and "YYYY-MM-DD HH:mm:ss"
  const parseDate = dateStr => {
    const d = new Date(dateStr)
    if (!isNaN(d.getTime())) return d

    // Manual parse for MM/DD/YYYY HH:mm
    const [datePart, timePart = '00:00'] = dateStr.replace(',', '').split(' ')
    const [month, day, year] = datePart.split('/').map(Number)
    const [hour, minute] = timePart.split(':').map(Number)
    return new Date(year, month - 1, day, hour, minute)
  }

  const startTime = parseDate(start)
  const startTimeStr = startTime.toLocaleTimeString([], options)

  if (!end) return startTimeStr

  const endTime = parseDate(end)
  const endTimeStr = endTime.toLocaleTimeString([], options)
  return `${startTimeStr} - ${endTimeStr}`
}
</script>
