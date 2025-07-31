<script setup>
import { ref, computed } from 'vue'
import CCard from '@/components/UI/cards/CCard.vue'
import CHeading from '@/components/UI/headings/CHeading.vue'

// Icons
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  DollarSign,
  TrendingUp,
  PieChart,
  BarChart2,
  Calendar,
  ThumbsUp
} from 'lucide-vue-next'

// Mock data for the dashboard
const mockData = ref({
  totalGuests: 120,
  rsvpStatuses: {
    confirmed: 78,
    declined: 12,
    pending: 30
  },
  comments: 45,
  budget: {
    estimated: 15000,
    actual: 12500
  },
  recentActions: [
    { id: 1, type: 'rsvp_confirmed', user: 'John Smith', timestamp: '2023-10-15T14:30:00Z' },
    { id: 2, type: 'comment_added', user: 'Sarah Johnson', timestamp: '2023-10-15T13:45:00Z' },
    { id: 3, type: 'rsvp_declined', user: 'Michael Brown', timestamp: '2023-10-15T12:20:00Z' },
    { id: 4, type: 'menu_preference', user: 'Emily Davis', timestamp: '2023-10-15T11:10:00Z' },
    { id: 5, type: 'rsvp_confirmed', user: 'David Wilson', timestamp: '2023-10-15T10:05:00Z' },
    { id: 6, type: 'comment_added', user: 'Jessica Taylor', timestamp: '2023-10-14T22:30:00Z' },
    { id: 7, type: 'rsvp_confirmed', user: 'Daniel Martinez', timestamp: '2023-10-14T20:15:00Z' },
    { id: 8, type: 'menu_preference', user: 'Sophia Anderson', timestamp: '2023-10-14T18:40:00Z' },
    { id: 9, type: 'rsvp_declined', user: 'James Thomas', timestamp: '2023-10-14T16:25:00Z' },
    { id: 10, type: 'comment_added', user: 'Olivia Jackson', timestamp: '2023-10-14T14:50:00Z' }
  ]
})

// Format currency
const formatCurrency = value => {
  return '$' + value.toLocaleString()
}

// Format date
const formatDate = dateString => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Get icon and label for recent actions
const getActionDetails = action => {
  switch (action.type) {
    case 'rsvp_confirmed':
      return {
        icon: CheckCircle,
        label: `${action.user} confirmed attendance`,
        color: 'text-green-500'
      }
    case 'rsvp_declined':
      return {
        icon: XCircle,
        label: `${action.user} declined invitation`,
        color: 'text-red-500'
      }
    case 'comment_added':
      return {
        icon: MessageSquare,
        label: `${action.user} posted a comment`,
        color: 'text-blue-500'
      }
    case 'menu_preference':
      return {
        icon: ThumbsUp,
        label: `${action.user} updated menu preferences`,
        color: 'text-purple-500'
      }
    default:
      return {
        icon: Calendar,
        label: `${action.user} took an action`,
        color: 'text-gray-500'
      }
  }
}

// Chart options for RSVP Trend
const rsvpTrendOptions = {
  chart: {
    type: 'line',
    height: 280,
    toolbar: {
      show: false
    }
  },
  colors: ['#f43f5e', '#22c55e', '#3b82f6'],
  stroke: {
    curve: 'smooth',
    width: 3
  },
  xaxis: {
    categories: ['Sep 1', 'Sep 8', 'Sep 15', 'Sep 22', 'Sep 29', 'Oct 6', 'Oct 13']
  },
  legend: {
    position: 'top'
  },
  grid: {
    borderColor: '#e2e8f0',
    strokeDashArray: 5
  }
}

// Chart series for RSVP Trend
const rsvpTrendSeries = [
  {
    name: 'Confirmed',
    data: [10, 25, 32, 45, 56, 68, 78]
  },
  {
    name: 'Declined',
    data: [2, 4, 6, 8, 9, 10, 12]
  },
  {
    name: 'Pending',
    data: [88, 71, 62, 47, 35, 22, 30]
  }
]

// Chart options for Menu Preferences
const menuPreferencesOptions = {
  chart: {
    type: 'pie',
    height: 280
  },
  labels: ['Chicken', 'Beef', 'Fish', 'Vegetarian', 'Vegan'],
  colors: ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6'],
  legend: {
    position: 'bottom'
  },
  responsive: [
    {
      breakpoint: 480,
      options: {
        chart: {
          height: 300
        },
        legend: {
          position: 'bottom'
        }
      }
    }
  ]
}

// Chart series for Menu Preferences
const menuPreferencesSeries = [45, 30, 25, 15, 5]

// Chart options for Guest Engagement
const guestEngagementOptions = {
  chart: {
    type: 'bar',
    height: 280,
    toolbar: {
      show: false
    }
  },
  colors: ['#f43f5e'],
  plotOptions: {
    bar: {
      borderRadius: 4,
      horizontal: false
    }
  },
  dataLabels: {
    enabled: false
  },
  xaxis: {
    categories: ['RSVPs', 'Comments', 'Menu Choices', 'Song Requests', 'Photo Uploads']
  },
  grid: {
    borderColor: '#e2e8f0',
    strokeDashArray: 5
  }
}

// Chart series for Guest Engagement
const guestEngagementSeries = [
  {
    name: 'Engagement Count',
    data: [90, 45, 75, 30, 20]
  }
]
</script>

<template>
  <section class="analytics-view">
    <!-- Page Header -->
    <div class="flex justify-between items-center mb-6">
      <CHeading :level="3">Event Analytics</CHeading>
    </div>

    <!-- Top Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <!-- Total Guests Card -->
      <CCard class="bg-white dark:bg-gray-800 p-4">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-sm mb-1">Total Guests</p>
            <p class="text-2xl font-semibold">{{ mockData.totalGuests }}</p>
          </div>
          <div class="bg-rose-100 dark:bg-rose-900 p-2 rounded-lg">
            <Users class="w-6 h-6 text-rose-600 dark:text-rose-300" />
          </div>
        </div>
      </CCard>

      <!-- RSVP Statuses Card -->
      <CCard class="bg-white dark:bg-gray-800 p-4">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-sm mb-1">RSVP Status</p>
            <div class="flex items-center gap-2">
              <span class="text-green-500 font-medium">{{ mockData.rsvpStatuses.confirmed }}</span>
              <span class="text-gray-400">/</span>
              <span class="text-red-500 font-medium">{{ mockData.rsvpStatuses.declined }}</span>
              <span class="text-gray-400">/</span>
              <span class="text-yellow-500 font-medium">{{ mockData.rsvpStatuses.pending }}</span>
            </div>
            <div class="flex items-center text-xs mt-1">
              <span class="text-green-500 mr-2">Confirmed</span>
              <span class="text-red-500 mr-2">Declined</span>
              <span class="text-yellow-500">Pending</span>
            </div>
          </div>
          <div class="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
            <CheckCircle class="w-6 h-6 text-blue-600 dark:text-blue-300" />
          </div>
        </div>
      </CCard>

      <!-- Comments Card -->
      <CCard class="bg-white dark:bg-gray-800 p-4">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-sm mb-1">Comments</p>
            <p class="text-2xl font-semibold">{{ mockData.comments }}</p>
          </div>
          <div class="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
            <MessageSquare class="w-6 h-6 text-purple-600 dark:text-purple-300" />
          </div>
        </div>
      </CCard>

      <!-- Budget Card -->
      <CCard class="bg-white dark:bg-gray-800 p-4">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-sm mb-1">Budget</p>
            <p class="text-lg font-semibold">
              {{ formatCurrency(mockData.budget.actual) }}
              <span class="text-sm text-gray-500"
                >/ {{ formatCurrency(mockData.budget.estimated) }}</span
              >
            </p>
            <p class="text-xs text-green-500 mt-1">
              {{ Math.round((mockData.budget.actual / mockData.budget.estimated) * 100) }}% of
              estimated
            </p>
          </div>
          <div class="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
            <DollarSign class="w-6 h-6 text-green-600 dark:text-green-300" />
          </div>
        </div>
      </CCard>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <!-- RSVP Trend Chart -->
      <CCard class="bg-white dark:bg-gray-800 p-4 lg:col-span-1">
        <div class="flex items-center mb-4">
          <TrendingUp class="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
          <h3 class="text-gray-700 dark:text-gray-300 font-medium">RSVP Trend</h3>
        </div>
        <div>
          <apexchart
            type="line"
            height="280"
            :options="rsvpTrendOptions"
            :series="rsvpTrendSeries"
          />
        </div>
      </CCard>

      <!-- Menu Preferences Chart -->
      <CCard class="bg-white dark:bg-gray-800 p-4 lg:col-span-1">
        <div class="flex items-center mb-4">
          <PieChart class="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
          <h3 class="text-gray-700 dark:text-gray-300 font-medium">Menu Preferences</h3>
        </div>
        <div>
          <apexchart
            type="pie"
            height="280"
            :options="menuPreferencesOptions"
            :series="menuPreferencesSeries"
          />
        </div>
      </CCard>

      <!-- Guest Engagement Chart -->
      <CCard class="bg-white dark:bg-gray-800 p-4 lg:col-span-1">
        <div class="flex items-center mb-4">
          <BarChart2 class="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
          <h3 class="text-gray-700 dark:text-gray-300 font-medium">Guest Engagement</h3>
        </div>
        <div>
          <apexchart
            type="bar"
            height="280"
            :options="guestEngagementOptions"
            :series="guestEngagementSeries"
          />
        </div>
      </CCard>
    </div>

    <!-- Recent Actions List -->
    <CCard class="bg-white dark:bg-gray-800 p-4 mb-6">
      <div class="flex items-center mb-4">
        <Clock class="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
        <h3 class="text-gray-700 dark:text-gray-300 font-medium">Recent Guest Activity</h3>
      </div>
      <div class="overflow-y-auto max-h-80">
        <ul class="divide-y divide-gray-200 dark:divide-gray-700">
          <li v-for="action in mockData.recentActions" :key="action.id" class="py-3">
            <div class="flex items-center">
              <div :class="`${getActionDetails(action).color} p-2 rounded-full mr-3`">
                <component :is="getActionDetails(action).icon" class="w-5 h-5" />
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ getActionDetails(action).label }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatDate(action.timestamp) }}
                </p>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </CCard>
  </section>
</template>

<style scoped>
.analytics-view {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
