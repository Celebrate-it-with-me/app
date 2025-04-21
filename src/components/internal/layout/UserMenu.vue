<template>
  <div class="relative">
    <!-- Initials button -->
    <button
      ref="buttonRef"
      @click="toggleMenu"
      class="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-semibold uppercase hover:opacity-90 focus:outline-none"
    >
      {{ initials }}
    </button>

    <div
      v-if="open"
      ref="menuRef"
      class="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 z-50"
    >
      <ul class="text-sm text-gray-700 dark:text-gray-200 divide-y divide-gray-100 dark:divide-gray-700">
        <li>
          <RouterLink
            to="/settings/profile"
            class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Profile
          </RouterLink>
        </li>
        <li>
          <RouterLink
            to="/settings/preferences"
            class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Preferences
          </RouterLink>
        </li>
        <li>
          <RouterLink
            to="/settings/danger-zone"
            class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Danger Zone
          </RouterLink>
        </li>
        <li>
          <RouterLink
            to="/settings/security"
            class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Security
          </RouterLink>
        </li>
        <li>
          <button
            @click="logout"
            class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Log Out
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useUserStore } from '@/stores/useUserStore'
import { useRouter } from 'vue-router'

const open = ref(false)
const userStore = useUserStore()
const router = useRouter()

const initials = computed(() => {
  const name = userStore?.name || 'User'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
})

const toggleMenu = () => {
  console.log('Toggling menu', open.value)
  open.value = !open.value
  console.log('after toggle', open.value)
}

const menuRef = ref(null)
const buttonRef = ref(null)

const handleClickOutside = (event) => {
  setTimeout(() => {
    const menu = menuRef.value
    const button = buttonRef.value

    if (
      menu &&
      !menu.contains(event.target) &&
      button &&
      !button.contains(event.target)
    ) {
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

const logout = async () => {
  await userStore.logOut()
  await router.push({ name: 'sign-in' })
}
</script>
