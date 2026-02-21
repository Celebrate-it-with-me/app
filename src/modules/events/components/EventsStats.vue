<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
    <!-- Stat Card 1 -->
    <div class="stat-card-gradient text-white p-6 rounded-3xl shadow-lg">
      <div class="flex justify-between items-start mb-4">
        <div class="p-2 bg-white/20 rounded-xl"><Calendar class="w-6 h-6" /></div>
        <span class="text-xs font-bold bg-white/20 px-2 py-1 rounded-lg">TOTAL</span>
      </div>
      <div class="text-3xl font-black mb-1">{{ totalEvents }}</div>
      <div class="text-sm font-medium text-purple-100 uppercase tracking-wider">Celebrations</div>
    </div>

    <!-- Stat Card 2 -->
    <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      <div class="flex justify-between items-start mb-4">
        <div class="p-2 bg-green-50 rounded-xl"><Zap class="w-6 h-6 text-green-500" /></div>
        <span class="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">LIVE</span>
      </div>
      <div class="text-3xl font-black text-gray-900 mb-1">{{ publicEvents }}</div>
      <div class="text-sm font-medium text-gray-400 uppercase tracking-wider">Published Now</div>
    </div>

    <!-- Stat Card 3 -->
    <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      <div class="flex justify-between items-start mb-4">
        <div class="p-2 bg-rose-50 rounded-xl"><Users class="w-6 h-6 text-rose-500" /></div>
        <span class="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">+12%</span>
      </div>
      <div class="text-3xl font-black text-gray-900 mb-1">{{ totalGuests }}</div>
      <div class="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Guests</div>
    </div>

    <!-- Stat Card 4 -->
    <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      <div class="flex justify-between items-start mb-4">
        <div class="p-2 bg-blue-50 rounded-xl"><CheckCircle class="w-6 h-6 text-blue-500" /></div>
        <span class="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">AVG</span>
      </div>
      <div class="text-3xl font-black text-gray-900 mb-1">{{ Math.round(avgResponse * 100) }}%</div>
      <div class="text-sm font-medium text-gray-400 uppercase tracking-wider">RSVP Completion</div>
    </div>
  </div>
</template>

<script setup>
import { Calendar, Zap, Users, CheckCircle } from 'lucide-vue-next'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { computed } from 'vue'

defineProps({
  totalGuests: { type: Number, required: false, default: 0 },
  avgResponse: { type: Number, required: false, default: 0 }
})

const eventStore = useEventsStore()

const totalEvents = computed(() => eventStore.eventsCount || 0)

const publicEvents = computed(
  () => eventStore.events.filter(event => event.status === 'published').length || 0
)
</script>

<style scoped>
.stat-card-gradient {
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #7e22ce 100%);
}
</style>
