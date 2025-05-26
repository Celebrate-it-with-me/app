<template>
  <nav class="h-full flex flex-col dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 relative transition-all duration-300 ease-in-out">
    <div class="p-6 dark:border-gray-700 h-16 flex items-center justify-center">
      <RouterLink to="/" class="flex items-center gap-2 text-xl font-bold text-primary">
        <img src="@/assets/images/commons/logo_primary_2.png" alt="Logo" :class="isExpanded ? 'w-4/5' : 'w-full'" />
      </RouterLink>
    </div>

    <!-- Toggle button -->
    <button
      @click="isExpanded = !isExpanded"
      class="absolute -right-3 top-20 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md border border-gray-200 dark:border-gray-700 z-10 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle sidebar"
    >
      <ChevronLeft v-if="isExpanded" class="w-4 h-4 text-gray-600 dark:text-gray-300" />
      <ChevronRight v-else class="w-4 h-4 text-gray-600 dark:text-gray-300" />
    </button>

    <ul
      v-if="userStore.activeEvent"
      class="flex-1 px-4 py-6 space-y-2 text-sm overflow-y-auto"
    >
      <li v-for="item in activeMenuItems" :key="item.label">
        <RouterLink
          :to="item.to"
          class="flex items-center gap-3 p-3 rounded-lg transition hover:bg-primary/10 dark:hover:bg-primary/20 whitespace-nowrap"
          :class="[
            { 'bg-primary/10 dark:bg-primary/20 text-primary': isActive(item.to) },
            { 'justify-center': !isExpanded }
          ]"
          :title="!isExpanded ? item.label : ''"
        >
          <component :is="item.icon" class="w-5 h-5 min-w-[20px]" />
          <span v-if="isExpanded" class="transition-opacity duration-300">{{ item.label }}</span>
        </RouterLink>
      </li>
    </ul>
    <ul
      v-else
      class="flex-1 px-4 py-6 space-y-2 text-sm overflow-y-auto"
    >
      <li>
        <RouterLink
          :to="'/dashboard/events/create'"
          class="flex items-center gap-3 p-3 rounded-lg transition hover:bg-primary/10 dark:hover:bg-primary/20 bg-primary/10 dark:bg-primary/20 text-primary whitespace-nowrap"
          :class="{ 'justify-center': !isExpanded }"
          title="Create Event"
        >
          <Calendar class="w-5 h-5 min-w-[20px]" />
          <span v-if="isExpanded" class="transition-opacity duration-300">Create Event</span>
        </RouterLink>
      </li>
    </ul>
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
  ChevronRight
} from 'lucide-vue-next'
import { useUserStore } from '@/stores/useUserStore'
import { computed, ref, watch } from 'vue'
import { useEventsStore } from '@/stores/useEventsStore'

const isExpanded = ref(true)

// Emit the sidebar state to parent component
const emit = defineEmits(['update:sidebarState'])

// Watch for changes in isExpanded and emit the new state
watch(isExpanded, (newValue) => {
  emit('update:sidebarState', newValue)
})

const route = useRoute()

const isActive = (path) => {
  const current = route.path

  return current === path
}

const userStore = useUserStore()
const eventStore = useEventsStore()

const menuItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, featureName: null },
  { label: 'My Events', to: '/dashboard/events', icon: Calendar, featureName: null },
  { label: 'Menu', to: '/dashboard/menus', icon: ChefHat, featureName: 'menu' },
  { label: 'Guests', to: '/dashboard/guests', icon: Users, featureName: null },
  { label: 'RSVP', to: '/dashboard/rsvp', icon: CheckSquare, featureName: 'rsvp'  },
  { label: 'Location', to: '/dashboard/locations', icon: MapPin, featureName: 'location' },
  { label: 'Save the Date', to: '/dashboard/save-the-date', icon: AlarmClock, featureName: 'saveTheDate' },
  { label: 'Sweet Memories', to: '/dashboard/sweet-memories', icon: Camera, featureName: 'sweetMemories' },
  { label: 'Suggested Music', to: '/dashboard/suggested-music', icon: Music, featureName: 'music' },
  { label: 'Comments', to: '/dashboard/event-comments', icon: MessageCircle, featureName: 'eventComments' },
 /*
  { label: 'Timeline', to: '/timeline', icon: Calendar },
  { label: 'Checklist', to: '/checklist', icon: Calendar },
  { label: 'Budget Tracker', to: '/budget-tracker', icon: Calendar },
  { label: 'Photo Gallery', to: '/photo-gallery', icon: Calendar },
  { label: 'Music', to: '/music', icon: Music2 },
  { label: 'Calendar', to: '/calendar', icon: Calendar },
  { label: 'Settings', to: '/settings', icon: Settings },*/
]

const activeMenuItems = computed(() => {
  let activeMenus = []

  menuItems.forEach(item => {
    if (item.featureName) {
      const feature = eventStore.activeEvent?.eventFeatures?.find(feature => feature.name === item.featureName)

      if (feature && feature.isActive) {
        activeMenus.push(item)
      }
    } else {
      activeMenus.push(item)
    }
  })

  return activeMenus
})


</script>
