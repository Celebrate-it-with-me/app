<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <!-- Attending Card -->
    <div class="bg-white rounded-lg border p-4 shadow-sm border-l-4 border-green-500">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <CheckCircle class="w-5 h-5 text-green-600" />
          <span class="text-sm font-medium text-gray-600 uppercase tracking-wider">Attending</span>
        </div>
      </div>

      <!-- CHANGED: Show both numbers -->
      <div class="mb-2">
        <div class="text-3xl font-bold text-gray-900">{{ attending.guests }}</div>
        <div class="text-lg font-medium text-gray-600 mt-1">{{ attending.total }} total</div>
      </div>

      <!-- Progress bar -->
      <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          class="bg-green-500 h-2 rounded-full transition-all duration-500"
          :style="{ width: `${attendingPercentage}%` }"
        ></div>
      </div>

      <!-- CHANGED: Show breakdown -->
      <div class="text-xs text-gray-500">
        {{ attendingPercentage }}% • {{ attending.guests }} guests
        <span v-if="attending.companions > 0">
          + {{ attending.companions }} companions
        </span>
      </div>
    </div>

    <!-- Pending Card -->
    <div class="bg-white rounded-lg border p-4 shadow-sm border-l-4 border-yellow-500">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <Clock class="w-5 h-5 text-yellow-600" />
          <span class="text-sm font-medium text-gray-600 uppercase tracking-wider">Pending</span>
        </div>
      </div>

      <!-- CHANGED: Show both numbers -->
      <div class="mb-2">
        <div class="text-3xl font-bold text-gray-900">{{ pending.guests }}</div>
        <div class="text-lg font-medium text-gray-600 mt-1">{{ pending.total }} total</div>
      </div>

      <!-- Progress bar -->
      <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          class="bg-yellow-500 h-2 rounded-full transition-all duration-500"
          :style="{ width: `${pendingPercentage}%` }"
        ></div>
      </div>

      <!-- CHANGED: Show breakdown -->
      <div class="text-xs text-gray-500">
        {{ pendingPercentage }}% • {{ pending.guests }} guests
        <span v-if="pending.companions > 0">
          + {{ pending.companions }} companions
        </span>
      </div>
    </div>

    <!-- Not Attending Card -->
    <div class="bg-white rounded-lg border p-4 shadow-sm border-l-4 border-red-500">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <XCircle class="w-5 h-5 text-red-600" />
          <span class="text-sm font-medium text-gray-600 uppercase tracking-wider">Not Attending</span>
        </div>
      </div>

      <!-- CHANGED: Show both numbers -->
      <div class="mb-2">
        <div class="text-3xl font-bold text-gray-900">{{ notAttending.guests }}</div>
        <div class="text-lg font-medium text-gray-600 mt-1">{{ notAttending.total }} total</div>
      </div>

      <!-- Progress bar -->
      <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          class="bg-red-500 h-2 rounded-full transition-all duration-500"
          :style="{ width: `${notAttendingPercentage}%` }"
        ></div>
      </div>

      <!-- CHANGED: Show breakdown -->
      <div class="text-xs text-gray-500">
        {{ notAttendingPercentage }}% • {{ notAttending.guests }} guests
        <span v-if="notAttending.companions > 0">
          + {{ notAttending.companions }} companions
        </span>
      </div>
    </div>

    <!-- Response Rate Card -->
    <div class="bg-white rounded-lg border p-4 shadow-sm border-l-4 border-purple-500">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <Mail class="w-5 h-5 text-purple-600" />
          <span class="text-sm font-medium text-gray-600 uppercase tracking-wider">Response Rate</span>
        </div>
      </div>

      <!-- Number -->
      <div class="mb-2">
        <div class="text-3xl font-bold text-gray-900">{{ responseRate }}%</div>
      </div>

      <!-- Progress bar -->
      <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          class="bg-purple-500 h-2 rounded-full transition-all duration-500"
          :style="{ width: `${responseRate}%` }"
        ></div>
      </div>

      <!-- CHANGED: Show responded count -->
      <div class="text-xs text-gray-500">
        {{ totals.responded }} of {{ totals.guests }} guests responded
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { CheckCircle, Clock, XCircle, Mail } from 'lucide-vue-next';

const props = defineProps({
  attending: {
    type: Object,  // { guests: 9, companions: 14, total: 23 }
    required: true
  },
  pending: {
    type: Object,  // { guests: 4, companions: 7, total: 11 }
    required: true
  },
  notAttending: {
    type: Object,  // { guests: 7, companions: 19, total: 26 }
    required: true
  },
  totals: {
    type: Object,  // { guests: 20, companions: 40, people: 60, responded: 16 }
    required: true
  },
  responseRate: {
    type: Number,
    required: true
  }
});

const attendingPercentage = computed(() => {
  if (props.totals.guests === 0) return 0;
  return Math.round((props.attending.guests / props.totals.guests) * 100);
});

const pendingPercentage = computed(() => {
  if (props.totals.guests === 0) return 0;
  return Math.round((props.pending.guests / props.totals.guests) * 100);
});

const notAttendingPercentage = computed(() => {
  if (props.totals.guests === 0) return 0;
  return Math.round((props.notAttending.guests / props.totals.guests) * 100);
});

</script>
