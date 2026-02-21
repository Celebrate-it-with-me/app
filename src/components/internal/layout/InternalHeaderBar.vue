<template>
  <header
    class="w-full h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 relative"
  >
    <div
      class="absolute inset-0 bg-gradient-to-r from-purple-50/20 to-pink-50/20 dark:from-purple-900/5 dark:to-pink-900/5"
    ></div>

    <div class="relative w-full h-full flex items-center justify-between px-6">
      <div class="flex items-center gap-4">
        <button
          class="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle mobile sidebar"
          @click="toggleMobileSidebar"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <!-- Clean Event Info (sin punto verde) -->
        <EventSwitcher />
      </div>

      <!-- Right Section -->
      <div class="flex items-center gap-3">
        <!-- Search -->
        <button
          class="hidden lg:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          @click="openQuickSearch"
        >
          <Search class="w-4 h-4" />
          <span>Search</span>
          <kbd
            class="px-1.5 py-0.5 text-xs font-mono bg-white dark:bg-gray-700 rounded border text-gray-500"
            >⌘K</kbd
          >
        </button>

        <!-- Mobile search -->
        <button
          class="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Search class="w-5 h-5" />
        </button>

        <!-- Quick Add -->
        <div class="relative">
          <button
            ref="quickActionButtonRef"
            class="p-2 text-gray-600 dark:text-gray-400 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-all"
            @click="toggleQuickAdd"
          >
            <Plus class="w-5 h-5" />
          </button>

          <!-- Quick Add Dropdown (version rica anterior) -->
          <div
            v-if="showQuickAdd"
            ref="quickActionRef"
            class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 z-50"
          >
            <div class="p-2">
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-2 px-2">
                Quick Add
              </h3>
              <button
                v-for="action in quickActions"
                :key="action.name"
                class="w-full flex items-center gap-2 px-2 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                @click="action.action"
              >
                <component :is="action.icon" class="w-4 h-4" />
                {{ action.name }}
              </button>
            </div>
          </div>
        </div>

        <!-- Notifications (version rica anterior) -->
        <div class="relative">
          <button
            class="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Toggle Theme"
            @click="toggleTheme"
          >
            <Sun v-if="theme === 'dark'" class="w-5 h-5" />
            <Moon v-else class="w-5 h-5" />
          </button>
        </div>

        <!-- Notifications (version rica anterior) -->
        <div class="relative">
          <button
            ref="notificationButtonRef"
            class="relative p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            @click="toggleNotifications"
          >
            <Bell class="w-5 h-5" />
            <span
              v-if="hasUnreadNotifications"
              class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full"
            ></span>
          </button>

          <!-- Enhanced Notifications Dropdown (version rica anterior) -->
          <div
            v-if="showNotifications"
            ref="notificationMenuRef"
            class="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          >
            <div
              class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700"
            >
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                <button
                  class="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                >
                  Mark all read
                </button>
              </div>
            </div>

            <div class="max-h-80 overflow-y-auto">
              <div
                v-for="(notification, index) in notifications"
                :key="index"
                class="flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div
                  class="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0"
                >
                  <component
                    :is="getNotificationIcon(notification.type)"
                    class="w-4 h-4 text-white"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-gray-900 dark:text-white font-medium">
                    {{ notification.title }}
                  </p>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {{ notification.message }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    {{ notification.time }}
                  </p>
                </div>
              </div>
            </div>

            <div
              class="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700"
            >
              <button
                class="w-full text-sm text-purple-600 dark:text-purple-400 font-medium hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
              >
                View All Notifications
              </button>
            </div>
          </div>
        </div>

        <!-- User Menu (version rica anterior) -->
        <div class="relative">
          <button
            ref="userButtonRef"
            class="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200"
            @click="toggleUserMenu"
          >
            <div
              class="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-sm"
            >
              <span class="text-xs font-bold text-white">{{ userInitials }}</span>
            </div>
            <ChevronDown class="w-4 h-4 text-gray-500 dark:text-gray-400 hidden md:block" />
          </button>

          <div
            v-if="showUserMenu"
            ref="userMenuRef"
            class="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          >
            <div
              class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 border-b border-gray-200 dark:border-gray-700"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg"
                >
                  <span class="text-sm font-bold text-white">{{ userInitials }}</span>
                </div>
                <div>
                  <p class="font-semibold text-gray-900 dark:text-white">{{ userName }}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ userEmail }}</p>
                </div>
              </div>
            </div>

            <div class="p-2">
              <RouterLink
                v-for="item in userMenuItems"
                :key="item.name"
                :to="item.to"
                class="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                @click="closeUserMenu"
              >
                <component :is="item.icon" class="w-4 h-4" />
                {{ item.name }}
              </RouterLink>
            </div>

            <div class="border-t border-gray-200 dark:border-gray-700 p-2">
              <button
                class="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                @click="logout"
              >
                <LogOut class="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/useUserStore'
import { useGuestsStore } from '@/modules/guests/stores/useGuestStore'
import {
  Calendar,
  Search,
  Plus,
  Bell,
  ChevronDown,
  User,
  Settings,
  Shield,
  LogOut,
  UserPlus,
  MapPin,
  Music,
  Camera,
  MessageCircle,
  CheckSquare,
  Sun,
  Moon
} from 'lucide-vue-next'
import { useTheme } from '@/composables/useTheme'
import EventSwitcher from '@/components/internal/layout/EventSwitcher.vue'

const router = useRouter()
const userStore = useUserStore()
const guestStore = useGuestsStore()
const { theme, toggleTheme } = useTheme()

const emit = defineEmits(['toggle-mobile-sidebar'])

// Refs para dropdowns
const notificationButtonRef = ref(null)
const notificationMenuRef = ref(null)
const quickActionRef = ref(null)
const userButtonRef = ref(null)
const userMenuRef = ref(null)
const quickActionButtonRef = ref(null)

// States
const showNotifications = ref(false)
const showUserMenu = ref(false)
const showQuickAdd = ref(false)

// Computed properties
const userName = computed(() => userStore.name || 'User')
const userEmail = computed(() => userStore.email || '')
const userInitials = computed(() => {
  const name = userName.value
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const hasUnreadNotifications = computed(() => {
  return notifications.value.some(n => !n.read)
})

// Data
const notifications = ref([
  {
    id: 1,
    type: 'guest',
    title: 'New RSVP Response',
    message: 'John Doe has accepted your invitation',
    time: '5 minutes ago',
    read: false
  },
  {
    id: 2,
    type: 'event',
    title: 'Event Update',
    message: 'Your event location has been confirmed',
    time: '1 hour ago',
    read: false
  }
])

const quickActions = [
  { name: 'Add Guest', icon: UserPlus, action: () => router.push('/dashboard/guests') },
  { name: 'Add Location', icon: MapPin, action: () => router.push('/dashboard/locations') },
  { name: 'Add Music', icon: Music, action: () => router.push('/dashboard/suggested-music') },
  { name: 'Add Memory', icon: Camera, action: () => router.push('/dashboard/memories') }
]

const userMenuItems = [
  { name: 'Edit Profile', to: '/settings/profile', icon: User },
  { name: 'Account Settings', to: '/settings/preferences', icon: Settings },
  { name: 'Security', to: '/settings/security', icon: Shield }
]

// Methods
const toggleMobileSidebar = () => {
  emit('toggle-mobile-sidebar')
}

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  showUserMenu.value = false
  showQuickAdd.value = false
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  showNotifications.value = false
  showQuickAdd.value = false
}

const toggleQuickAdd = () => {
  showQuickAdd.value = !showQuickAdd.value
  showNotifications.value = false
  showUserMenu.value = false
}

const closeUserMenu = () => {
  showUserMenu.value = false
}

const openQuickSearch = () => {
  console.log('Open quick search')
}

const logout = async () => {
  await userStore.logOut()
  await router.push({ name: 'sign-in' })
}

const getNotificationIcon = type => {
  const icons = {
    guest: UserPlus,
    event: Calendar,
    message: MessageCircle,
    rsvp: CheckSquare
  }
  return icons[type] || Bell
}

// Click outside handlers
const handleClickOutside = event => {
  if (
    notificationMenuRef.value &&
    !notificationMenuRef.value.contains(event.target) &&
    notificationButtonRef.value &&
    !notificationButtonRef.value.contains(event.target)
  ) {
    showNotifications.value = false
  }
  if (
    userMenuRef.value &&
    !userMenuRef.value.contains(event.target) &&
    userButtonRef.value &&
    !userButtonRef.value.contains(event.target)
  ) {
    showUserMenu.value = false
  }

  if (
    quickActionRef.value &&
    !quickActionRef.value.contains(event.target) &&
    quickActionButtonRef.value &&
    !quickActionButtonRef.value.contains(event.target)
  ) {
    showQuickAdd.value = false
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)

  await guestStore.countTotalAssistant()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(
  () => userStore.activeEvent,
  async newValue => {
    if (newValue) {
      await guestStore.countTotalAssistant()
    }
  }
)
</script>
