<template>
  <nav class="h-full flex flex-col dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
    <div class="p-6 dark:border-gray-700 h-16 flex items-center justify-center">
      <RouterLink to="/" class="flex items-center gap-2 text-xl font-bold text-primary">
        <img src="@/assets/images/commons/logo_primary_2.png" alt="Logo" class="w-4/5" />
      </RouterLink>
    </div>

    <ul
      v-if="userStore.activeEvent"
      class="flex-1 px-4 py-6 space-y-2 text-sm"
    >
      <li v-for="item in activeMenuItems" :key="item.label">
        <RouterLink
          :to="item.to"
          class="flex items-center gap-3 p-3 rounded-lg transition hover:bg-primary/10 dark:hover:bg-primary/20"
          :class="{ 'bg-primary/10 dark:bg-primary/20 text-primary': isActive(item.to) }"
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </li>
    </ul>
    <ul
      v-else
      class="flex-1 px-4 py-6 space-y-2 text-sm"
    >
      <li>
        <RouterLink
          :to="'/dashboard/events/create'"
          class="flex items-center gap-3 p-3 rounded-lg transition hover:bg-primary/10
                 dark:hover:bg-primary/20 bg-primary/10 dark:bg-primary/20 text-primary"
        >
          <Calendar class="w-5 h-5" />
          <span>Create Event</span>
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
  MapPin
} from 'lucide-vue-next'
import { useUserStore } from '@/stores/useUserStore'
import { computed } from 'vue'
import { useEventsStore } from '@/stores/useEventsStore'

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
