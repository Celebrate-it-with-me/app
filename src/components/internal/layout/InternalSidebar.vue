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
      <li v-for="item in menuItems" :key="item.label">
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
  Map,
  LayoutDashboard,
  Utensils,
  ChefHat
} from 'lucide-vue-next'
import { useUserStore } from '@/stores/useUserStore'

const route = useRoute()

const isActive = (path) => {
  const current = route.path

  return current === path
}

const userStore = useUserStore()

const menuItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'My Events', to: '/dashboard/events', icon: Calendar },
  { label: 'Guests', to: '/dashboard/guests', icon: Users },
  { label: 'RSVP', to: '/dashboard/rsvp', icon: CheckSquare  },
  { label: 'Menu', to: '/dashboard/menus', icon: ChefHat },
  { label: 'Locations', to: '/dashboard/locations', icon: Map },
  { label: 'Save the Date', to: '/dashboard/save-the-date', icon: AlarmClock },
  { label: 'Sweet Memories', to: '/dashboard/sweet-memories', icon: Camera },
  { label: 'Suggested Music', to: '/dashboard/suggested-music', icon: Music },
  { label: 'Comments', to: '/dashboard/event-comments', icon: MessageCircle },
 /*
  { label: 'Timeline', to: '/timeline', icon: Calendar },
  { label: 'Checklist', to: '/checklist', icon: Calendar },
  { label: 'Budget Tracker', to: '/budget-tracker', icon: Calendar },
  { label: 'Photo Gallery', to: '/photo-gallery', icon: Calendar },
  { label: 'Music', to: '/music', icon: Music2 },
  { label: 'Calendar', to: '/calendar', icon: Calendar },
  { label: 'Settings', to: '/settings', icon: Settings },*/
]
</script>
