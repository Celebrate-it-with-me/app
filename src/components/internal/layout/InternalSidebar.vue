<template>
  <nav
    class="h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 relative transition-all duration-300 ease-in-out shadow-xl"
    :class="{ 'w-64': isExpanded, 'w-20': !isExpanded }"
  >
    <!-- Logo Section con gradient background -->
    <div class="relative overflow-hidden">
      <div
        class="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-purple-800"
      ></div>
      <div
        class="relative h-20 flex items-center justify-center"
        :class="{ 'p-6': isExpanded, 'p-3': !isExpanded }"
      >
        <RouterLink
          to="/"
          class="flex items-center gap-2 text-xl font-bold text-white drop-shadow-sm"
        >
          <img
            v-if="isExpanded"
            src="@/assets/images/commons/logo_primary_2.png"
            alt="Logo"
            class="w-4/5 filter brightness-0 invert"
          />
          <img
            v-else
            src="@/assets/images/commons/logo.png"
            alt="Logo"
            class="w-8 h-8 filter brightness-0 invert"
          />
        </RouterLink>
      </div>
      <!-- Decorative gradient overlay -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"
      ></div>
    </div>

    <!-- Event Info Section -->
    <div
      v-if="eventStore.activeEvent"
      class="bg-gradient-to-r from-gray-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/20 border-b border-gray-200 dark:border-gray-700"
      :class="{ 'px-4 py-4': isExpanded, 'px-2 py-3': !isExpanded }"
    >
      <div v-if="isExpanded" class="space-y-3">
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 dark:text-white truncate mb-1">
              {{ eventName }}
            </p>
            <div class="flex items-center gap-2 mb-2">
              <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span class="text-xs text-gray-600 dark:text-gray-400">Active Event</span>
            </div>
          </div>
          <div
            class="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-sm"
          >
            <Calendar class="w-4 h-4 text-white" />
          </div>
        </div>
        <div
          class="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 bg-white/50 dark:bg-gray-700/50 rounded-lg px-2 py-1"
        >
          <AlarmClock class="w-3 h-3" />
          <span>{{ formatEventDate() }}</span>
        </div>
      </div>
      <div v-else class="flex justify-center">
        <div
          class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg"
        >
          <Calendar class="w-6 h-6 text-white" />
        </div>
      </div>
    </div>

    <!-- Toggle button -->
    <button
      class="absolute -right-4 top-24 bg-white dark:bg-gray-800 rounded-full p-2 shadow-xl border-2 border-purple-200 dark:border-purple-700 z-10 hover:shadow-2xl hover:scale-110 transition-all duration-200 group hover:border-purple-300 dark:hover:border-purple-600"
      aria-label="Toggle sidebar"
      @click="isExpanded = !isExpanded"
    >
      <ChevronLeft
        v-if="isExpanded"
        class="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors"
      />
      <ChevronRight
        v-else
        class="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors"
      />
    </button>

    <!-- Navigation Menu -->
    <div
      v-if="eventStore.hasEvents"
      class="flex-1 py-6 space-y-6 overflow-y-auto custom-scrollbar"
      :class="{ 'px-3': isExpanded, 'px-2': !isExpanded }"
    >
      <!-- Create Event button inside scrollable area when user has events -->
      <div v-if="!eventStore.activeEvent" class="mb-4">
        <RouterLink
          to="/dashboard/events/create"
          class="group flex items-center rounded-xl transition-all duration-200 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-purple-500/25 hover:scale-105"
          :class="[
            {
              'gap-3 px-3 py-3': isExpanded,
              'justify-center p-3 mx-1': !isExpanded
            }
          ]"
          title="Create Event"
        >
          <Calendar
            class="text-white drop-shadow-sm flex-shrink-0 transition-all duration-200"
            :class="{ 'w-5 h-5': isExpanded, 'w-6 h-6': !isExpanded }"
          />
          <span v-if="isExpanded" class="font-medium">Create Event</span>
        </RouterLink>
      </div>
      <!-- Core Section -->
      <div>
        <h3
          v-if="isExpanded"
          class="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2"
        >
          <div class="w-4 h-px bg-gradient-to-r from-purple-400 to-transparent"></div>
          Core
        </h3>
        <ul class="space-y-1">
          <li v-for="item in coreMenuItems" :key="item.label">
            <RouterLink
              :to="item.to"
              class="group flex items-center rounded-xl transition-all duration-200 hover:bg-purple-50 dark:hover:bg-purple-900/20 relative overflow-hidden"
              :class="[
                {
                  'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-purple-500/25 transform translate-x-1':
                    isActive(item.to),
                  'text-gray-700 dark:text-gray-300 hover:translate-x-1 hover:shadow-sm': !isActive(
                    item.to
                  )
                },
                {
                  'gap-3 px-3 py-3': isExpanded,
                  'justify-center p-3 mx-1': !isExpanded
                }
              ]"
              :title="!isExpanded ? item.label : ''"
            >
              <component
                :is="item.icon"
                class="transition-all duration-200 flex-shrink-0"
                :class="[
                  {
                    'text-white drop-shadow-sm': isActive(item.to),
                    'group-hover:text-purple-600 dark:group-hover:text-purple-400': !isActive(
                      item.to
                    )
                  },
                  {
                    'w-5 h-5': isExpanded,
                    'w-6 h-6': !isExpanded
                  }
                ]"
              />
              <span v-if="isExpanded" class="font-medium transition-all duration-200 truncate">{{
                item.label
              }}</span>
              <div
                v-if="isActive(item.to)"
                class="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-xl"
              ></div>
            </RouterLink>
          </li>
        </ul>
      </div>

      <!-- Planning Section -->
      <div v-if="planningMenuItems.length">
        <h3
          v-if="isExpanded"
          class="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2"
        >
          <div class="w-4 h-px bg-gradient-to-r from-blue-400 to-transparent"></div>
          Planning
        </h3>
        <ul class="space-y-1">
          <li v-for="item in planningMenuItems" :key="item.label">
            <RouterLink
              :to="item.to"
              class="group flex items-center rounded-xl transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 relative overflow-hidden"
              :class="[
                {
                  'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-blue-500/25 transform translate-x-1':
                    isActive(item.to),
                  'text-gray-700 dark:text-gray-300 hover:translate-x-1 hover:shadow-sm': !isActive(
                    item.to
                  )
                },
                {
                  'gap-3 px-3 py-3': isExpanded,
                  'justify-center p-3 mx-1': !isExpanded
                }
              ]"
              :title="!isExpanded ? item.label : ''"
            >
              <component
                :is="item.icon"
                class="transition-all duration-200 flex-shrink-0"
                :class="[
                  {
                    'text-white drop-shadow-sm': isActive(item.to),
                    'group-hover:text-blue-600 dark:group-hover:text-blue-400': !isActive(item.to)
                  },
                  {
                    'w-5 h-5': isExpanded,
                    'w-6 h-6': !isExpanded
                  }
                ]"
              />
              <span v-if="isExpanded" class="font-medium transition-all duration-200 truncate">{{
                item.label
              }}</span>
              <div
                v-if="isActive(item.to)"
                class="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-xl"
              ></div>
            </RouterLink>
          </li>
        </ul>
      </div>

      <!-- Engagement Section -->
      <div v-if="engagementMenuItems.length">
        <h3
          v-if="isExpanded"
          class="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2"
        >
          <div class="w-4 h-px bg-gradient-to-r from-green-400 to-transparent"></div>
          Engagement
        </h3>
        <ul class="space-y-1">
          <li v-for="item in engagementMenuItems" :key="item.label">
            <RouterLink
              :to="item.to"
              class="group flex items-center rounded-xl transition-all duration-200 hover:bg-green-50 dark:hover:bg-green-900/20 relative overflow-hidden"
              :class="[
                {
                  'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-green-500/25 transform translate-x-1':
                    isActive(item.to),
                  'text-gray-700 dark:text-gray-300 hover:translate-x-1 hover:shadow-sm': !isActive(
                    item.to
                  )
                },
                {
                  'gap-3 px-3 py-3': isExpanded,
                  'justify-center p-3 mx-1': !isExpanded
                }
              ]"
              :title="!isExpanded ? item.label : ''"
            >
              <component
                :is="item.icon"
                class="transition-all duration-200 flex-shrink-0"
                :class="[
                  {
                    'text-white drop-shadow-sm': isActive(item.to),
                    'group-hover:text-green-600 dark:group-hover:text-green-400': !isActive(item.to)
                  },
                  {
                    'w-5 h-5': isExpanded,
                    'w-6 h-6': !isExpanded
                  }
                ]"
              />
              <span v-if="isExpanded" class="font-medium transition-all duration-200 truncate">{{
                item.label
              }}</span>
              <div
                v-if="isActive(item.to)"
                class="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-xl"
              ></div>
            </RouterLink>
          </li>
        </ul>
      </div>

      <!-- Experience Section -->
      <div v-if="experienceMenuItems.length">
        <h3
          v-if="isExpanded"
          class="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2"
        >
          <div class="w-4 h-px bg-gradient-to-r from-pink-400 to-transparent"></div>
          Experience
        </h3>
        <ul class="space-y-1">
          <li v-for="item in experienceMenuItems" :key="item.label">
            <RouterLink
              :to="item.to"
              class="group flex items-center rounded-xl transition-all duration-200 hover:bg-pink-50 dark:hover:bg-pink-900/20 relative overflow-hidden"
              :class="[
                {
                  'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg hover:shadow-pink-500/25 transform translate-x-1':
                    isActive(item.to),
                  'text-gray-700 dark:text-gray-300 hover:translate-x-1 hover:shadow-sm': !isActive(
                    item.to
                  )
                },
                {
                  'gap-3 px-3 py-3': isExpanded,
                  'justify-center p-3 mx-1': !isExpanded
                }
              ]"
              :title="!isExpanded ? item.label : ''"
            >
              <component
                :is="item.icon"
                class="transition-all duration-200 flex-shrink-0"
                :class="[
                  {
                    'text-white drop-shadow-sm': isActive(item.to),
                    'group-hover:text-pink-600 dark:group-hover:text-pink-400': !isActive(item.to)
                  },
                  {
                    'w-5 h-5': isExpanded,
                    'w-6 h-6': !isExpanded
                  }
                ]"
              />
              <span v-if="isExpanded" class="font-medium transition-all duration-200 truncate">{{
                item.label
              }}</span>
              <div
                v-if="isActive(item.to)"
                class="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-xl"
              ></div>
            </RouterLink>
          </li>
        </ul>
      </div>

      <!-- Analytics Section -->
      <div v-if="analyticsMenuItems.length">
        <h3
          v-if="isExpanded"
          class="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2"
        >
          <div class="w-4 h-px bg-gradient-to-r from-indigo-400 to-transparent"></div>
          Analytics
        </h3>
        <ul class="space-y-1">
          <li v-for="item in analyticsMenuItems" :key="item.label">
            <RouterLink
              :to="item.to"
              class="group flex items-center rounded-xl transition-all duration-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 relative overflow-hidden"
              :class="[
                {
                  'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg hover:shadow-indigo-500/25 transform translate-x-1':
                    isActive(item.to),
                  'text-gray-700 dark:text-gray-300 hover:translate-x-1 hover:shadow-sm': !isActive(
                    item.to
                  )
                },
                {
                  'gap-3 px-3 py-3': isExpanded,
                  'justify-center p-3 mx-1': !isExpanded
                }
              ]"
              :title="!isExpanded ? item.label : ''"
            >
              <component
                :is="item.icon"
                class="transition-all duration-200 flex-shrink-0"
                :class="[
                  {
                    'text-white drop-shadow-sm': isActive(item.to),
                    'group-hover:text-indigo-600 dark:group-hover:text-indigo-400': !isActive(
                      item.to
                    )
                  },
                  {
                    'w-5 h-5': isExpanded,
                    'w-6 h-6': !isExpanded
                  }
                ]"
              />
              <span v-if="isExpanded" class="font-medium transition-all duration-200 truncate">{{
                item.label
              }}</span>
              <div
                v-if="isActive(item.to)"
                class="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-xl"
              ></div>
            </RouterLink>
          </li>
        </ul>
      </div>
    </div>

    <!-- No Event State -->
    <ul
      v-if="!eventStore.hasEvents"
      class="flex-1 py-6 space-y-2 overflow-y-auto"
      :class="{ 'px-3': isExpanded, 'px-2': !isExpanded }"
    >
      <li>
        <RouterLink
          to="/dashboard/events/create"
          class="group flex items-center rounded-xl transition-all duration-200 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-purple-500/25 hover:scale-105"
          :class="[
            {
              'gap-3 px-3 py-3': isExpanded,
              'justify-center p-3 mx-1': !isExpanded
            }
          ]"
          title="Create Event"
        >
          <Calendar
            class="text-white drop-shadow-sm flex-shrink-0 transition-all duration-200"
            :class="{ 'w-5 h-5': isExpanded, 'w-6 h-6': !isExpanded }"
          />
          <span v-if="isExpanded" class="font-medium">Create Event</span>
        </RouterLink>
      </li>
    </ul>

    <!-- Bottom Section con user info (solo expanded) -->
    <div
      v-if="isExpanded && eventStore.activeEvent"
      class="p-4 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/20"
    >
      <div class="flex items-center gap-3 mb-3">
        <div
          class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg"
        >
          <span class="text-sm font-bold text-white">{{ userInitials }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ userName }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">Event Planner</p>
        </div>
      </div>
      <RouterLink
        to="/dashboard/events"
        class="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-purple-600 hover:text-white hover:bg-purple-600 dark:text-purple-400 dark:hover:bg-purple-600 dark:hover:text-white bg-white/50 dark:bg-gray-700/50 hover:bg-purple-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <Calendar class="w-3 h-3" />
        View All Events
      </RouterLink>
    </div>

    <!-- Collapsed bottom section -->
    <div
      v-if="!isExpanded && eventStore.activeEvent"
      class="p-3 border-t border-gray-200 dark:border-gray-700 flex justify-center"
    >
      <div
        class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg"
      >
        <span class="text-sm font-bold text-white">{{ userInitials }}</span>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRoute, RouterLink } from 'vue-router'
import {
  Users,
  Music,
  Calendar,
  Camera,
  CheckSquare,
  AlarmClock,
  MessageCircle,
  LayoutDashboard,
  ChefHat,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Shirt,
  NotebookPen,
  ChartNoAxesCombined
} from 'lucide-vue-next'
import { useUserStore } from '@/stores/useUserStore'
import { computed, ref, watch } from 'vue'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'

const isExpanded = ref(true)

// Emit the sidebar state to parent component
const emit = defineEmits(['update:sidebarState'])

// Watch for changes in isExpanded and emit the new state
watch(isExpanded, newValue => {
  emit('update:sidebarState', newValue)
})

const route = useRoute()

const isActive = path => {
  return route.path === path
}

const userStore = useUserStore()
const eventStore = useEventsStore()

const eventName = computed(() => eventStore.activeEvent?.eventName || 'No Event Selected')

const userName = computed(() => userStore.name || 'User')
const userInitials = computed(() => {
  const name = userName.value
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const formatEventDate = () => {
  if (!eventStore.activeEvent?.startDate) return 'No date set'
  const date = new Date(eventStore.activeEvent.startDate)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const menuItems = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: LayoutDashboard,
    featureName: null,
    category: 'core'
  },
  {
    label: 'My Events',
    to: '/dashboard/events',
    icon: Calendar,
    featureName: null,
    category: 'core'
  },
  {
    label: 'Menu',
    to: '/dashboard/menus',
    icon: ChefHat,
    featureName: 'menu',
    category: 'planning'
  },
  {
    label: 'Budget',
    to: '/dashboard/budget',
    icon: Wallet,
    featureName: 'budget',
    category: 'planning'
  },
  {
    label: 'Location',
    to: '/dashboard/locations',
    icon: MapPin,
    featureName: 'location',
    category: 'planning'
  },
  {
    label: 'Seating',
    to: '/dashboard/seating',
    icon: NotebookPen,
    featureName: 'seatsAccommodation',
    category: 'planning'
  },
  {
    label: 'Guests',
    to: '/dashboard/guests',
    icon: Users,
    featureName: null,
    category: 'engagement'
  },
  {
    label: 'RSVP',
    to: '/dashboard/rsvp',
    icon: CheckSquare,
    featureName: 'rsvp',
    category: 'engagement'
  },
  {
    label: 'Save the Date',
    to: '/dashboard/save-the-date',
    icon: AlarmClock,
    featureName: 'saveTheDate',
    category: 'engagement'
  },
  {
    label: 'Comments',
    to: '/dashboard/event-comments',
    icon: MessageCircle,
    featureName: 'eventComments',
    category: 'engagement'
  },
  {
    label: 'Dress Code',
    to: '/dashboard/dress-code',
    icon: Shirt,
    featureName: 'dressCode',
    category: 'experience'
  },
  {
    label: 'Sweet Memories',
    to: '/dashboard/memories',
    icon: Camera,
    featureName: 'sweetMemories',
    category: 'experience'
  },
  {
    label: 'Suggested Music',
    to: '/dashboard/suggested-music',
    icon: Music,
    featureName: 'music',
    category: 'experience'
  }
]

const activeMenuItems = computed(() => {
  let activeMenus = []

  menuItems.forEach(item => {
    if (item.featureName) {
      const feature = eventStore.activeEvent?.eventFeatures?.find(
        feature => feature.name === item.featureName
      )

      if (feature && feature.isActive) {
        activeMenus.push(item)
      }
    } else {
      activeMenus.push(item)
    }
  })

  return activeMenus
})

const coreMenuItems = computed(() => {
  const items = activeMenuItems.value.filter(item => item.category === 'core')
  // If there is no active event, we only want to show Dashboard and My Events
  if (!eventStore.activeEvent && eventStore.events.length > 0) {
    return items.filter(item => ['Dashboard', 'My Events'].includes(item.label))
  }
  return items
})

const planningMenuItems = computed(() =>
  activeMenuItems.value.filter(item => item.category === 'planning')
)

const engagementMenuItems = computed(() =>
  activeMenuItems.value.filter(item => item.category === 'engagement')
)

const experienceMenuItems = computed(() =>
  activeMenuItems.value.filter(item => item.category === 'experience')
)

const analyticsMenuItems = computed(() =>
  activeMenuItems.value.filter(item => item.category === 'analytics')
)
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(168, 85, 247, 0.3);
  border-radius: 2px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(168, 85, 247, 0.5);
}
</style>
