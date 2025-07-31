<template>
  <div class="relative">
    <div
      ref="buttonRef"
      class="flex items-center justify-center gap-x-2 border border-gray-200 w-10 h-10 rounded-full cursor-pointer relative"
      @click="toggleMenu()"
    >
      <Bell />

      <span
        v-if="hasUnread"
        class="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full"
      ></span>
    </div>

    <div
      v-if="open"
      ref="menuRef"
      class="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 z-50"
    >
      <div class="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <div>
          <h2 class="text-xl font-medium text-gray-900 dark:text-white">Notifications</h2>
        </div>
      </div>

      <ul class="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
        <li
          v-for="(n, index) in notifications"
          :key="index"
          class="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <p class="text-sm text-gray-800 dark:text-gray-200">
            <span class="font-medium">{{ n.name }}</span> {{ n.message }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ n.date }}</p>
        </li>
      </ul>

      <div class="border-t border-gray-100 dark:border-gray-700">
        <button
          class="w-full text-sm text-primary dark:text-primary font-medium py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          View All Notifications
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Bell } from 'lucide-vue-next'

const menuRef = ref(null)
const buttonRef = ref(null)

const hasUnread = computed(() => {
  // return notifications.some(n => !n.read)
  return true
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

const notifications = [
  {
    name: 'Terry Franci',
    message: 'requests permission to change Project - Ngantner App',
    date: '5 min ago'
  },
  {
    name: 'Alena Franci',
    message: 'requests permission to change Project - Ngantner App',
    date: '8 min ago'
  },
  {
    name: 'Jocelyn Kenter',
    message: 'requests permission to change Project - Ngantner App',
    date: '15 min ago'
  },
  {
    name: 'Brandon Philips',
    message: 'requests permission to change Project - Ngantner App',
    date: '1 hr ago'
  }
]

const toggleMenu = () => {
  open.value = !open.value
}
</script>
