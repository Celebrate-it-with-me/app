<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEventsStore } from '@/stores/useEventsStore'
import { useRsvpStore } from '@/stores/useRsvpStore'
import { useBudgetStore } from '@/stores/useBudgetStore'
import { useActivityStore } from '@/stores/useActivityStore'
import {
  Users,
  TrendingUp,
  LayoutGrid,
  Music,
  Camera,
  DollarSign,
  UtensilsCrossed,
  Calendar,
  Plus,
  Send,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-vue-next'

// Stores
const router = useRouter()
const eventsStore = useEventsStore()
const rsvpStore = useRsvpStore()
const budgetStore = useBudgetStore()
const activityStore = useActivityStore()

// Computed (Real Data)
const activeEvent = computed(() => eventsStore.activeEvent)

const daysUntilEvent = computed(() => {
  if (!activeEvent.value?.startDate && !activeEvent.value?.event_date) return 0
  const dateStr = activeEvent.value.startDate || activeEvent.value.event_date
  const eventDate = new Date(dateStr)
  const today = new Date()
  const diff = eventDate - today
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
})

const rsvpStats = computed(() => {
  const stats = rsvpStore.stats?.data || {}
  return {
    total: stats.totals?.people || activeEvent.value?.guest_count || 0,
    confirmed: stats.attending?.total || 0,
    pending: stats.pending?.total || 0,
    rsvp_rate: stats.totals?.people
      ? Math.round((stats.attending?.total / stats.totals?.people) * 100)
      : 0
  }
})

const completionPercentage = computed(() => {
  let completed = 0
  const total = 5
  if (activeEvent.value?.location_id || activeEvent.value?.venue_name) completed++
  if (rsvpStats.value.total > 0) completed++
  if (budgetStore.eventBudget?.budget_cap) completed++
  completed += 1 // Assume checklist started
  return Math.round((completed / total) * 100)
})

const budget = computed(() => {
  if (budgetStore.eventBudget) {
    const spent = parseFloat(budgetStore.eventBudget.total_paid || 0)
    const total = parseFloat(budgetStore.eventBudget.budget_cap || 0)
    return {
      spent,
      total,
      percentage: total > 0 ? Math.round((spent / total) * 100) : 0
    }
  }
  return { spent: 0, total: 0, percentage: 0 }
})

// Conditionals
const showMenuWidget = computed(() => activeEvent.value?.has_menu === true)

const rsvpRate = computed(() => rsvpStats.value.rsvp_rate)
const pendingGuests = computed(() => rsvpStats.value.total - rsvpStats.value.confirmed)
const unseatedGuests = computed(() => (activeEvent.value?.guest_count || 60) - seatedGuests.value)
const totalSpent = computed(() => budget.value.spent)
const menuConfigured = ref(false) // TODO: Replace with real data

const nextStep = computed(() => {
  const event = activeEvent.value
  if (!event) return null

  // Priority 1: RSVP deadline approaching (< 30 days)
  if (daysUntilEvent.value <= 30 && rsvpRate.value < 80) {
    return {
      id: 'finalize-rsvp',
      title: 'Finalize Guest List',
      description: `${pendingGuests.value} guests haven't responded yet`,
      urgencyText: 'Due in 5 days',
      urgencyClass: 'bg-red-100 text-red-700',
      icon: Users,
      route: '/dashboard/rsvp',
      cta: 'Send Reminders'
    }
  }

  // Priority 2: Budget not set
  if (totalSpent.value === 0) {
    return {
      id: 'set-budget',
      title: 'Set Your Budget',
      description: 'Track expenses and stay within limits',
      urgencyText: 'Recommended now',
      urgencyClass: 'bg-yellow-100 text-yellow-700',
      icon: DollarSign,
      route: '/dashboard/budget',
      cta: 'Set Budget'
    }
  }

  // Priority 3: Seating incomplete (< 14 days)
  if (seatingPercentage.value < 50 && daysUntilEvent.value <= 14) {
    return {
      id: 'arrange-seating',
      title: 'Arrange Seating Chart',
      description: `${unseatedGuests.value} guests need seats`,
      urgencyText: 'Due in 2 weeks',
      urgencyClass: 'bg-yellow-100 text-yellow-700',
      icon: LayoutGrid,
      route: '/dashboard/seating',
      cta: 'Arrange Seats'
    }
  }

  // Priority 4: No music
  if (songCount.value === 0) {
    return {
      id: 'add-music',
      title: 'Create Your Playlist',
      description: 'Add songs for the perfect atmosphere',
      urgencyText: 'Recommended',
      urgencyClass: 'bg-blue-100 text-blue-700',
      icon: Music,
      route: '/dashboard/suggested-music',
      cta: 'Add Songs'
    }
  }

  // Priority 5: Menu not configured (if applicable)
  if (event?.has_menu && !menuConfigured.value) {
    return {
      id: 'configure-menu',
      title: 'Select Menu Items',
      description: 'Choose appetizers, mains, and desserts',
      urgencyText: 'Due in 3 weeks',
      urgencyClass: 'bg-yellow-100 text-yellow-700',
      icon: UtensilsCrossed,
      route: '/dashboard/menus',
      cta: 'Configure Menu'
    }
  }

  return null
})

const allTasksComplete = computed(() => {
  return nextStep.value === null && activeEvent.value !== null
})

// Mock Data (clearly labeled)
// TODO: Replace with real API data when RSVP trend feature is built
const rsvpTrend = ref([
  { label: 'Week 1', count: 8, percentage: 40 },
  { label: 'Week 2', count: 12, percentage: 60 },
  { label: 'Week 3', count: 6, percentage: 30 },
  { label: 'Week 4', count: 5, percentage: 25 },
  { label: 'Week 5', count: 15, percentage: 75 }
])

// TODO: Replace with real RSVP store data
const recentConfirmations = ref([
  { id: 1, name: 'Maria Garcia', guests: 2, timeAgo: '2 hours ago' },
  { id: 2, name: 'John Smith', guests: 4, timeAgo: '5 hours ago' },
  { id: 3, name: 'Elena Rodriguez', guests: 1, timeAgo: 'Yesterday' },
  { id: 4, name: 'David Wilson', guests: 3, timeAgo: '2 days ago' },
  { id: 5, name: 'Sofia Hernandez', guests: 2, timeAgo: '3 days ago' }
])

// TODO: Replace with real API data when budget breakdown feature is built
const budgetCategories = ref([
  { name: 'Venue', amount: 2160, percentage: 40, color: '#a855f7' },
  { name: 'Catering', amount: 1620, percentage: 30, color: '#f59e0b' },
  { name: 'Photos', amount: 810, percentage: 15, color: '#10b981' },
  { name: 'Other', amount: 810, percentage: 15, color: '#ec4899' }
])

// TODO: Replace with real API when menu feature is built
const menu = ref({
  appetizers: 3,
  mains: 4,
  desserts: 2
})

const dietaryRestrictions = ref({
  vegetarian: 8,
  vegan: 3,
  allergies: 5
})

// TODO: Replace with real seating API
const seatedGuests = ref(45)
const seatingPercentage = computed(() =>
  Math.round((seatedGuests.value / (activeEvent.value?.guest_count || 60)) * 100)
)
const totalTables = ref(12)
const filledTables = ref(9)
const tables = ref([
  { id: 1, number: 1, filled: true },
  { id: 2, number: 2, filled: true },
  { id: 3, number: 3, filled: true },
  { id: 4, number: 4, filled: true },
  { id: 5, number: 5, filled: true },
  { id: 6, number: 6, filled: true },
  { id: 7, number: 7, filled: true },
  { id: 8, number: 8, filled: true },
  { id: 9, number: 9, filled: true },
  { id: 10, number: 10, filled: false },
  { id: 11, number: 11, filled: false },
  { id: 12, number: 12, filled: false }
])

// TODO: Replace with real music API
const songCount = ref(12)
const playlistDuration = ref('2.5')
const recentSongs = ref([
  { id: 1, title: 'Vals de las Mariposas', artist: 'Banda MS', duration: '3:45' },
  { id: 2, title: 'Quinceañera', artist: 'Chayanne', duration: '4:12' },
  { id: 3, title: 'Tiempo de Vals', artist: 'Banda El Recodo', duration: '3:28' }
])

// TODO: Replace with real memories API
const photoCount = ref(24)
const lastPhotoTime = ref('2 hours ago')
const recentPhotos = ref([
  { id: 1, thumbnail: 'https://picsum.photos/200?random=1', caption: 'Venue' },
  { id: 2, thumbnail: 'https://picsum.photos/200?random=2', caption: 'Decorations' },
  { id: 3, thumbnail: 'https://picsum.photos/200?random=3', caption: 'Dress' },
  { id: 4, thumbnail: 'https://picsum.photos/200?random=4', caption: 'Flowers' }
])

// Methods
function navigateTo(path) {
  router.push(path)
}

function getColorForInitial(letter) {
  const colors = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6']
  return colors[letter.charCodeAt(0) % colors.length]
}

onMounted(async () => {
  if (activeEvent.value?.id) {
    await rsvpStore.fetchStats()
    await budgetStore.getEventBudget()
    await activityStore.loadDashboardActivities()
  }
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-6 py-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
    <!-- Section 1: Event Health Hero -->
    <section
      class="relative overflow-hidden bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl"
    >
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="space-y-2">
          <h1 class="text-3xl md:text-4xl font-bold">
            {{ activeEvent?.name || "Isabella's Quinceañera" }}
          </h1>
          <div class="flex items-center gap-2 text-pink-100">
            <Calendar class="w-5 h-5" />
            <span class="font-semibold">{{ daysUntilEvent }} Days Remaining</span>
          </div>
        </div>

        <div class="w-full md:w-72 space-y-2">
          <div class="flex justify-between text-sm font-semibold">
            <span>Overall Planning Progress</span>
            <span>{{ completionPercentage }}%</span>
          </div>
          <div class="h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              class="h-full bg-white transition-all duration-1000 ease-out"
              :style="`width: ${completionPercentage}%`"
            ></div>
          </div>
        </div>
      </div>
      <div class="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      <div
        class="absolute -left-20 -bottom-20 w-64 h-64 bg-purple-900/20 rounded-full blur-3xl"
      ></div>
    </section>

    <!-- Section 2: Quick Stats Grid -->
    <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center gap-4">
          <div class="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
            <Users class="w-6 h-6 text-pink-600 dark:text-pink-400" />
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400 font-semibold">Guests</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ rsvpStats.total }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ rsvpStats.confirmed }} Confirmed / {{ rsvpStats.pending }} Pending
            </p>
          </div>
        </div>
      </div>

      <div
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center gap-4">
          <div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <DollarSign class="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400 font-semibold">Budget Spent</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              ${{ budget.spent.toLocaleString() }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              of ${{ budget.total.toLocaleString() }} goal
            </p>
          </div>
        </div>
      </div>

      <div
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center gap-4">
          <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <CheckSquare class="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400 font-semibold">Tasks</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">8/15</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Completed so far</p>
          </div>
        </div>
      </div>

      <div
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center gap-4">
          <div class="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
            <Clock class="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400 font-semibold">Days Left</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ daysUntilEvent }}</p>
            <div class="flex items-center gap-1">
              <span
                class="w-2 h-2 rounded-full"
                :class="daysUntilEvent < 30 ? 'bg-red-500' : 'bg-green-500'"
              ></span>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ daysUntilEvent < 30 ? 'Getting close!' : 'Plenty of time' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 3: Quick Actions Bar -->
    <section class="flex flex-wrap items-center gap-4 py-2">
      <button
        class="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg px-6 py-3 font-semibold hover:shadow-lg transition-all flex items-center gap-2"
        @click="navigateTo('/dashboard/guests/create')"
      >
        <Plus class="w-5 h-5" /> Add Guest
      </button>
      <button
        class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg px-4 py-3 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2"
      >
        <Send class="w-5 h-5" /> Send Invites
      </button>
      <button
        class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg px-4 py-3 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2"
        @click="navigateTo('/dashboard/budget')"
      >
        <DollarSign class="w-5 h-5" /> Update Budget
      </button>
      <button
        class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg px-4 py-3 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2"
        @click="navigateTo('/dashboard/locations')"
      >
        <MapPin class="w-5 h-5" /> View Location
      </button>
    </section>

    <!-- Section 4: Two-Column Layout -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-6 mt-6">
      <!-- LEFT COLUMN (3/5) -->
      <div class="md:col-span-3 space-y-6">
        <!-- RSVP Overview Widget -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
        >
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-2">
              <Users class="w-5 h-5 text-pink-500" />
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">Guest RSVPs</h3>
            </div>
            <a
              href="/dashboard/rsvp"
              class="text-sm text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 font-medium"
            >
              View All →
            </a>
          </div>

          <!-- Quick stats -->
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ rsvpStats.confirmed }}
              </p>
              <p class="text-xs text-gray-600 dark:text-gray-400">Confirmed</p>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-400 dark:text-gray-500">
                {{ rsvpStats.pending }}
              </p>
              <p class="text-xs text-gray-600 dark:text-gray-400">Pending</p>
            </div>
            <div>
              <p class="text-2xl font-bold text-pink-600 dark:text-pink-400">
                {{ rsvpStats.rsvp_rate }}%
              </p>
              <p class="text-xs text-gray-600 dark:text-gray-400">Response Rate</p>
            </div>
          </div>

          <!-- Trend Chart -->
          <div class="mb-6">
            <p
              class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider"
            >
              Confirmation Trend
            </p>
            <div class="space-y-2">
              <div v-for="week in rsvpTrend" :key="week.label" class="flex items-center gap-3">
                <span class="text-xs text-gray-500 dark:text-gray-400 w-16">{{ week.label }}</span>
                <div class="flex-1 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <div
                    class="h-full bg-gradient-to-r from-pink-400 to-pink-600 flex items-center justify-end px-2 transition-all duration-1000"
                    :style="`width: ${week.percentage}%`"
                  >
                    <span class="text-xs font-semibold text-white">{{ week.count }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent confirmations -->
          <div>
            <p
              class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider"
            >
              Recent Confirmations
            </p>
            <div class="space-y-3">
              <div
                v-for="guest in recentConfirmations"
                :key="guest.id"
                class="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    :style="`background: ${getColorForInitial(guest.name[0])}`"
                  >
                    {{ guest.name[0] }}
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ guest.name }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      {{ guest.guests }} guest(s) • {{ guest.timeAgo }}
                    </p>
                  </div>
                </div>
                <span
                  class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full"
                >
                  CONFIRMED
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Menu Status Widget (Conditional) -->
        <div
          v-if="showMenuWidget"
          class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
        >
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-2">
              <UtensilsCrossed class="w-5 h-5 text-pink-500" />
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">Menu Selection</h3>
            </div>
            <a
              href="/dashboard/menus"
              class="text-sm text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 font-medium"
            >
              Manage →
            </a>
          </div>

          <div class="space-y-3 mb-6">
            <div
              class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <span class="text-sm text-gray-700 dark:text-gray-300 font-medium">Appetizers</span>
              <span class="text-lg font-bold text-gray-900 dark:text-white">{{
                menu.appetizers
              }}</span>
            </div>
            <div
              class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <span class="text-sm text-gray-700 dark:text-gray-300 font-medium">Main Courses</span>
              <span class="text-lg font-bold text-gray-900 dark:text-white">{{ menu.mains }}</span>
            </div>
            <div
              class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <span class="text-sm text-gray-700 dark:text-gray-300 font-medium">Desserts</span>
              <span class="text-lg font-bold text-gray-900 dark:text-white">{{
                menu.desserts
              }}</span>
            </div>
          </div>

          <div class="pt-4 border-t border-gray-100 dark:border-gray-700">
            <p
              class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider"
            >
              Dietary Restrictions
            </p>
            <div class="flex flex-wrap gap-2">
              <span
                class="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full"
              >
                {{ dietaryRestrictions.vegetarian }} Vegetarian
              </span>
              <span
                class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full"
              >
                {{ dietaryRestrictions.vegan }} Vegan
              </span>
              <span
                class="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded-full"
              >
                {{ dietaryRestrictions.allergies }} Allergies
              </span>
            </div>
          </div>
        </div>

        <!-- Seating Progress Widget -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
        >
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-2">
              <LayoutGrid class="w-5 h-5 text-pink-500" />
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">Seating Chart</h3>
            </div>
            <a
              href="/dashboard/seating"
              class="text-sm text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 font-medium"
            >
              Manage →
            </a>
          </div>

          <div class="mb-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-600 dark:text-gray-400"
                >{{ seatedGuests }}/{{ rsvpStats.total }} guests seated</span
              >
              <span class="text-sm font-semibold text-gray-900 dark:text-white"
                >{{ seatingPercentage }}%</span
              >
            </div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-1000"
                :style="`width: ${seatingPercentage}%`"
              ></div>
            </div>
          </div>

          <div>
            <p
              class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider"
            >
              Tables Overview
            </p>
            <div class="grid grid-cols-4 sm:grid-cols-6 gap-2">
              <div
                v-for="table in tables"
                :key="table.id"
                class="aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold transition-all duration-300"
                :class="
                  table.filled
                    ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 border-2 border-pink-300 dark:border-pink-800 shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-2 border-gray-200 dark:border-gray-700'
                "
              >
                T{{ table.number }}
              </div>
            </div>
          </div>

          <div
            class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between text-sm"
          >
            <span class="text-gray-600 dark:text-gray-400 font-medium"
              >{{ filledTables }}/{{ totalTables }} tables filled</span
            >
            <span class="text-gray-600 dark:text-gray-400 font-medium"
              >{{ rsvpStats.total - seatedGuests }} seats left</span
            >
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN (2/5) -->
      <div class="md:col-span-2 space-y-6">
        <!-- Smart Assistant - Active State -->
        <div
          v-if="nextStep"
          class="sticky top-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-0.5 mb-6 z-10"
        >
          <div class="bg-white dark:bg-gray-800 rounded-[11px] p-5">
            <!-- Header -->
            <div class="flex items-center gap-2 mb-3">
              <Sparkles class="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h4 class="font-bold text-sm text-gray-900 dark:text-white">Your Next Step</h4>
            </div>

            <!-- Step Content -->
            <div class="mb-4">
              <div class="flex items-center gap-2 mb-2">
                <component :is="nextStep.icon" class="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <h5 class="font-semibold text-sm text-gray-900 dark:text-white">
                  {{ nextStep.title }}
                </h5>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {{ nextStep.description }}
              </p>

              <!-- Urgency Badge -->
              <div
                class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
                :class="nextStep.urgencyClass"
              >
                <Clock class="w-3 h-3" />
                <span>{{ nextStep.urgencyText }}</span>
              </div>
            </div>

            <!-- CTA Button -->
            <button
              class="w-full py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all"
              @click="navigateTo(nextStep.route)"
            >
              {{ nextStep.cta }} →
            </button>
          </div>
        </div>

        <!-- Smart Assistant - Celebration State -->
        <div
          v-else-if="allTasksComplete"
          class="sticky top-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-0.5 mb-6 z-10"
        >
          <div class="bg-white rounded-[11px] p-5 text-center">
            <div class="text-4xl mb-2">🎊</div>
            <h4 class="font-bold text-gray-900 mb-1">You're All Set!</h4>
            <p class="text-sm text-gray-600">Everything is on track for your event</p>
          </div>
        </div>

        <!-- Budget Breakdown Widget -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
        >
          <div class="flex items-center gap-2 mb-6">
            <TrendingUp class="w-5 h-5 text-pink-500" />
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Budget Breakdown</h3>
          </div>

          <div v-if="budget.spent > 0" class="space-y-6">
            <div class="relative w-40 h-40 mx-auto">
              <svg viewBox="0 0 100 100" class="transform -rotate-90 w-full h-full">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#f3f4f6"
                  stroke-width="15"
                  class="dark:stroke-gray-700"
                />
                <!-- Venue (40%) -->
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#a855f7"
                  stroke-width="15"
                  stroke-dasharray="100.48 251.2"
                  class="transition-all duration-1000"
                />
                <!-- Catering (30%) -->
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#f59e0b"
                  stroke-width="15"
                  stroke-dasharray="75.36 251.2"
                  stroke-dashoffset="-100.48"
                  class="transition-all duration-1000"
                />
                <!-- Photos (15%) -->
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#10b981"
                  stroke-width="15"
                  stroke-dasharray="37.68 251.2"
                  stroke-dashoffset="-175.84"
                  class="transition-all duration-1000"
                />
                <!-- Other (15%) -->
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#ec4899"
                  stroke-width="15"
                  stroke-dasharray="37.68 251.2"
                  stroke-dashoffset="-213.52"
                  class="transition-all duration-1000"
                />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
                <p class="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">
                  Total Spent
                </p>
                <p class="text-xl font-bold text-gray-900 dark:text-white">
                  ${{ budget.spent.toLocaleString() }}
                </p>
              </div>
            </div>

            <div class="space-y-3">
              <div
                v-for="category in budgetCategories"
                :key="category.name"
                class="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full" :style="`background: ${category.color}`"></div>
                  <span class="text-sm text-gray-700 dark:text-gray-300 font-medium">{{
                    category.name
                  }}</span>
                </div>
                <div class="text-right">
                  <p class="text-sm font-bold text-gray-900 dark:text-white">
                    ${{ category.amount.toLocaleString() }}
                  </p>
                  <p class="text-[10px] text-gray-500 dark:text-gray-400 font-bold">
                    {{ category.percentage }}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8">
            <div
              class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <DollarSign class="w-8 h-8 text-purple-600" />
            </div>
            <p class="text-gray-600 mb-4 text-sm font-medium">No budget set yet</p>
            <button
              class="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-bold text-sm hover:shadow-lg transition-all"
              @click="navigateTo('/dashboard/budget')"
            >
              Set Budget
            </button>
          </div>
        </div>

        <!-- Music Summary Widget -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
        >
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-2">
              <Music class="w-5 h-5 text-pink-500" />
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">Event Playlist</h3>
            </div>
            <a
              href="/dashboard/suggested-music"
              class="text-sm text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 font-medium"
            >
              Manage →
            </a>
          </div>

          <div class="grid grid-cols-2 gap-3 mb-6">
            <div class="text-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
              <p class="text-3xl font-bold text-purple-600 dark:text-purple-400">{{ songCount }}</p>
              <p class="text-[10px] text-gray-600 dark:text-gray-400 font-bold uppercase mt-1">
                Songs
              </p>
            </div>
            <div class="text-center p-4 bg-pink-50 dark:bg-pink-900/30 rounded-lg">
              <p class="text-3xl font-bold text-pink-600 dark:text-pink-400">
                {{ playlistDuration }}
              </p>
              <p class="text-[10px] text-gray-600 dark:text-gray-400 font-bold uppercase mt-1">
                Hours
              </p>
            </div>
          </div>

          <div v-if="songCount > 0">
            <p
              class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider"
            >
              Recently Added
            </p>
            <div class="space-y-2">
              <div
                v-for="song in recentSongs"
                :key="song.id"
                class="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors group"
              >
                <div
                  class="w-8 h-8 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center group-hover:bg-pink-200 dark:group-hover:bg-pink-900/50 transition-colors"
                >
                  <Music class="w-4 h-4 text-pink-600 dark:text-pink-400" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {{ song.title }}
                  </p>
                  <p class="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                    {{ song.artist }}
                  </p>
                </div>
                <span class="text-[10px] text-gray-400 font-bold">{{ song.duration }}</span>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-6">
            <Music class="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p class="text-sm text-gray-600 mb-3">No songs yet</p>
            <button
              class="text-sm text-pink-600 hover:text-pink-700 font-bold"
              @click="navigateTo('/dashboard/suggested-music')"
            >
              Add First Song →
            </button>
          </div>
        </div>

        <!-- Gallery Preview Widget (Conditional) -->
        <div
          v-if="photoCount > 0"
          class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <Camera class="w-5 h-5 text-pink-500" />
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">Sweet Memories</h3>
            </div>
            <a
              href="/dashboard/memories"
              class="text-sm text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 font-medium"
            >
              View All ({{ photoCount }}) →
            </a>
          </div>

          <div class="grid grid-cols-2 gap-2 mb-4">
            <div
              v-for="photo in recentPhotos"
              :key="photo.id"
              class="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 hover:opacity-90 cursor-pointer transition-all duration-300 hover:scale-[1.02]"
            >
              <img :src="photo.thumbnail" :alt="photo.caption" class="w-full h-full object-cover" />
            </div>
          </div>

          <div class="text-center">
            <p class="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">
              Last updated {{ lastPhotoTime }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style>
