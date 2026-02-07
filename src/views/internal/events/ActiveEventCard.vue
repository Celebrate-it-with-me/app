<script setup>
import CCard from '@/components/UI/cards/CCard.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { Calendar, Clock, MapPin, ExternalLink, Edit, UserCircle } from 'lucide-vue-next'

const router = useRouter()
const props = defineProps({
  activeEvent: {
    type: Object,
    required: true
  },
  userRole: {
    type: String,
    default: 'viewer'
  }
})

const goToEvent = async () => {
  await router.push({ name: 'event-details', params: { id: props.activeEvent.id } })
}

const editEvent = async () => {
  await router.push({ name: 'edit-event', params: { id: props.activeEvent.id } })
}

const formatDate = date => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const daysUntilEvent = computed(() => {
  const today = new Date()
  const eventDate = new Date(props.activeEvent.startDate)
  const diffTime = eventDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
})

const eventStatus = computed(() => {
  const days = daysUntilEvent.value
  if (days < 0) return { text: 'Past Event', color: 'text-gray-500' }
  if (days === 0) return { text: 'Today!', color: 'text-green-500' }
  if (days <= 7) return { text: `${days} days away`, color: 'text-amber-500' }
  if (days <= 30) return { text: `${days} days away`, color: 'text-blue-500' }
  return { text: `${days} days away`, color: 'text-purple-500' }
})
</script>

<template>
  <CCard
    variant="feature"
    class="border-l-4 border-l-rose overflow-visible relative hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
  >
    <!-- Header with status and role -->
    <div class="flex justify-between items-start mb-4">
      <div
        class="inline-flex items-center bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm border border-gray-100 dark:border-gray-700"
      >
        <span :class="['text-[10px] font-bold tracking-wider uppercase', eventStatus.color]">{{
          eventStatus.text
        }}</span>
      </div>

      <div
        class="inline-flex items-center bg-rose-light/20 dark:bg-rose-dark/10 px-2.5 py-1 rounded-lg border border-rose/10"
      >
        <UserCircle
          class="w-3.5 h-3.5 mr-1.5"
          :class="{
            'text-purple-600': userRole === 'owner',
            'text-blue-600': userRole === 'editor',
            'text-gray-600': userRole === 'viewer'
          }"
        />
        <span
          class="text-[10px] font-bold capitalize tracking-tight"
          :class="{
            'text-purple-700 dark:text-purple-400': userRole === 'owner',
            'text-blue-700 dark:text-blue-400': userRole === 'editor',
            'text-gray-700 dark:text-gray-400': userRole === 'viewer'
          }"
          >{{ userRole }}</span
        >
      </div>
    </div>

    <template #title>
      <div class="flex flex-col gap-1 mb-2">
        <h3 class="text-2xl font-black text-rose-darken leading-tight tracking-tight">
          {{ activeEvent.eventName }}
        </h3>
      </div>
    </template>

    <template #content>
      <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-6 italic leading-relaxed">
        "{{ activeEvent.eventDescription }}"
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 mb-4">
        <div class="flex items-center group">
          <div class="p-2.5 bg-rose/5 dark:bg-rose/10 rounded-xl mr-3.5 group-hover:bg-rose/10 transition-colors">
            <Calendar class="w-4 h-4 text-rose" />
          </div>
          <div class="flex flex-col">
            <span class="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Date</span>
            <span class="text-sm font-semibold text-gray-700 dark:text-gray-200">{{ formatDate(activeEvent.startDate) }} – {{ formatDate(activeEvent.endDate) }}</span>
          </div>
        </div>

        <div
          v-if="activeEvent.eventTime"
          class="flex items-center group"
        >
          <div class="p-2.5 bg-rose/5 dark:bg-rose/10 rounded-xl mr-3.5 group-hover:bg-rose/10 transition-colors">
            <Clock class="w-4 h-4 text-rose" />
          </div>
          <div class="flex flex-col">
            <span class="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Time</span>
            <span class="text-sm font-semibold text-gray-700 dark:text-gray-200">{{ activeEvent.eventTime }}</span>
          </div>
        </div>

        <div
          v-if="activeEvent.location"
          class="flex items-center group md:col-span-2"
        >
          <div class="p-2.5 bg-rose/5 dark:bg-rose/10 rounded-xl mr-3.5 group-hover:bg-rose/10 transition-colors">
            <MapPin class="w-4 h-4 text-rose" />
          </div>
          <div class="flex flex-col">
            <span class="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Location</span>
            <span class="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">{{ activeEvent.location }}</span>
          </div>
        </div>
      </div>
    </template>

    <template #cta>
      <div class="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700/50">
        <CButton
          variant="gradient"
          class="bg-gradient-to-r from-rose to-rose-dark hover:from-rose-dark hover:to-rose-darken text-white px-8 py-2.5 rounded-xl shadow-lg shadow-rose/20 transition-all active:scale-95"
          @click="goToEvent"
        >
          <ExternalLink class="w-4 h-4 mr-2" />
          Manage Event
        </CButton>

        <CButton
          variant="outline"
          class="border-rose/20 text-rose hover:bg-rose/5 dark:hover:bg-rose/10 px-6 py-2.5 rounded-xl transition-all active:scale-95"
          @click="editEvent"
        >
          <Edit class="w-4 h-4 mr-2" />
          Edit Details
        </CButton>
      </div>
    </template>
  </CCard>
</template>

<style scoped>
.card-menu {
  position: absolute;
  top: -9.5rem;
  right: -10px;
  z-index: 10;
}
</style>
