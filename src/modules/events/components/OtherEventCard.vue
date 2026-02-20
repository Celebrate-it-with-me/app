<script setup>
import CCard from '@/components/UI/cards/CCard.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import { computed } from 'vue'
import { Calendar, MapPin } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()
const props = defineProps({
  event: {
    type: Object,
    required: true
  }
})

const daysUntilEvent = computed(() => {
  const today = new Date()
  const eventDate = new Date(props.event.startDate)
  const diffTime = eventDate - today
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

const formatDate = date => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const goToEvent = async () => {
  await router.push({ name: 'event-details', params: { id: props.event.id } })
}
</script>

<template>
  <CCard class="hover:shadow-xl transition-all duration-300">
    <template #title>
      <div class="flex items-center justify-between">
        <h3 class="text-xl font-black text-gray-900 dark:text-white">{{ event.eventName }}</h3>
        <span
          class="text-xs px-2 py-1 rounded-full"
          :class="{
            'bg-green-100 text-green-700': event.status === 'published',
            'bg-yellow-100 text-yellow-700': event.status === 'draft',
            'bg-gray-100 text-gray-700': event.status === 'archived'
          }"
        >
          {{ event.status }}
        </span>
      </div>
    </template>

    <template #content>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 italic">
        "{{ event.eventDescription || 'No description provided' }}"
      </p>

      <div class="grid grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
        <div class="flex items-center gap-2">
          <Calendar class="w-4 h-4 text-purple-500" />
          {{ formatDate(event.startDate) }}
        </div>
        <div v-if="event.location" class="flex items-center gap-2">
          <MapPin class="w-4 h-4 text-purple-500" />
          {{ event.location }}
        </div>
      </div>
    </template>

    <template #cta>
      <div class="flex justify-end">
        <CButton variant="outline" @click="goToEvent">View Details</CButton>
      </div>
    </template>
  </CCard>
</template>

<style scoped></style>
