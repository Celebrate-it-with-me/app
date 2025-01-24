<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'

const isProfileOpen = ref(false)

const toggleProfileMenuOpen = () => {
  isProfileOpen.value = !isProfileOpen.value
}

const handleClickOutside = (event) => {
  const menu = document.querySelector('.profile-menu')

  if (!menu || !menu.contains(event.target)) {
    closeProfileMenu()
  }
}

const closeProfileMenu = () => {
  isProfileOpen.value = false
  document.removeEventListener('click', handleClickOutside)
}

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(isProfileOpen, (value) => {
  if (value) {
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
    })
  }
}, {
  immediate: true
})

</script>

<template>
  <nav class="fixed top-10 left-1/2 transform -translate-x-1/2 w-[90%] md:w-[80%] bg-white/5 backdrop-blur-sm rounded-lg shadow-lg z-50">
    <div class="container mx-auto px-6 py-4 flex justify-between items-center">
      <div class="text-2xl font-bold">
        CelebrateItWith<span class="text-yellow-300">Me!</span>
      </div>
      <ul class="hidden md:flex space-x-6">
        <li><a href="#" class="hover:text-yellow-300 transition-colors duration-500">Home</a></li>
        <li>
          <router-link
            :to="'/dashboard/events'"
            class="hover:text-yellow-300 transition-colors duration-500"
          >
            Events
          </router-link>
        </li>
        <li><a href="#" class="hover:text-yellow-300 transition-colors duration-500">Calendar</a></li>
        <li class="relative">
          <!-- Profile Button -->
          <button
            class="hover:text-yellow-300 transition-colors duration-500 flex items-center"
            @click="toggleProfileMenuOpen"
          >
            Profile
            <svg
              class="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </button>

          <!-- Dropdown Menu -->
          <div
            v-show="isProfileOpen"
            @click="closeProfileMenu"
            class="absolute right-0 mt-2 w-40 bg-white text-black dark:bg-gray-800 dark:text-white
                   shadow-md rounded-lg z-50 profile-menu"
          >
            <ul>
              <li>
                <a
                  href="#"
                  class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                >
                  Settings
                </a>
              </li>
              <li>
                <a
                  href="#"
                  class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Account
                </a>
              </li>
              <li>
                <a
                  href="#"
                  class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
                >
                  Logout
                </a>
              </li>
            </ul>
          </div>
        </li>

      </ul>
      <button class="md:hidden">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
    </div>
  </nav>
</template>

<style scoped>

</style>
