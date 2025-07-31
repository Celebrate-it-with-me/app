<template>
  <div class="relative">
    <div
      v-if="userAvatarUrl"
      ref="buttonRef"
      class="flex items-center gap-x-2"
      @click="toggleMenu()"
    >
      <img
        :src="userAvatarUrl"
        class="w-10 h-10 rounded-full cursor-pointer border border-gray-200"
        alt="User Avatar"
      />

      <div class="hidden md:flex cursor-pointer">
        {{ userName }}

        <ChevronDown v-if="!open" />
        <ChevronUp v-else />
      </div>
    </div>

    <button
      v-else
      ref="buttonRef"
      class="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-semibold uppercase hover:opacity-90 focus:outline-none"
      @click="toggleMenu()"
    >
      {{ initials }}
    </button>

    <div
      v-if="open"
      ref="menuRef"
      class="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 z-50"
    >
      <div class="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <div>
          <p class="text-sm font-medium text-gray-900 dark:text-white">{{ userName }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ userEmail }}</p>
        </div>
      </div>

      <ul class="text-sm text-gray-700 dark:text-gray-200" @click="closeMenu">
        <li>
          <RouterLink
            to="/settings/profile"
            class="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <User class="w-4 h-4" /> Edit profile
          </RouterLink>
        </li>
        <li>
          <RouterLink
            to="/settings/preferences"
            class="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Settings class="w-4 h-4" /> Account settings
          </RouterLink>
        </li>
        <li>
          <RouterLink
            to="/settings/security"
            class="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ShieldCheck class="w-4 h-4" /> Security
          </RouterLink>
        </li>
        <li>
          <RouterLink
            to="/settings/danger-zone"
            class="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500 dark:text-red-400"
          >
            <Info class="w-4 h-4" /> Danger zone
          </RouterLink>
        </li>
      </ul>

      <div
        class="flex items-center gap-3 px-4 py-3 border-t border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <p
          class="flex items-center gap-x-2 text-sm font-medium text-gray-900 dark:text-white"
          @click="logout"
        >
          <LogOut class="w-4 h-4" />
          Sign Out
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/useUserStore'
import { useRouter } from 'vue-router'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  ChevronDown,
  ChevronUp,
  User,
  Settings,
  Info,
  LogOut,
  ShieldCheck,
  BadgeHelp
} from 'lucide-vue-next'

const userStore = useUserStore()

const menuRef = ref(null)
const buttonRef = ref(null)

const userAvatarUrl = computed(() => {
  return userStore.avatar ? userStore.avatar : null
})

const userName = computed(() => {
  return userStore.name ?? ''
})

const userEmail = computed(() => {
  return userStore.email ?? ''
})

const initials = computed(() => {
  const name = userStore?.name || 'User'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
})

const handleClickOutside = event => {
  setTimeout(() => {
    const menu = menuRef.value
    const button = buttonRef.value

    if (menu && !menu.contains(event.target) && button && !button.contains(event.target)) {
      open.value = false
    }
  }, 0)
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

const open = ref(false)
const router = useRouter()

const closeMenu = () => {
  open.value = false
}

const toggleMenu = () => {
  open.value = !open.value
}

const logout = async () => {
  await userStore.logOut()
  await router.push({ name: 'sign-in' })
}
</script>
