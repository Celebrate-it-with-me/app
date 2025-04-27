<script setup>
import InternalSidebar from '@/components/internal/layout/InternalSidebar.vue'
import HeaderBar from '@/components/internal/layout/InternalHeaderBar.vue'
import InternalFooter from '@/components/internal/layout/InternalFooter.vue'
import { onMounted, ref, watch } from 'vue'
import CEventsModal from '@/components/UI/modals/CEventsModal.vue'
import { useUserStore } from '@/stores/useUserStore'
import { useEventsStore } from '@/stores/useEventsStore'
import { useNotificationStore } from '@/stores/useNotificationStore'

const userStore = useUserStore()
const eventsStore = useEventsStore()
const showEventsModal = ref(false)
const loading = ref(false)
const notificationStore = useNotificationStore()

onMounted(() => {
  loadEvents()
})

const loadEvents = async () => {
  try {
    loading.value = true
    const response = await userStore.initUserEvents()

    if (response.status >= 200 && response.status < 300) {
      const result = response.data?.data ?? {}
      eventsStore.initUserEventsData(result)

      if (userStore.justLogin === true) {
        console.log('entre')
        triggerEventsModal()
        userStore.justLogin = false
      }
    } else {
      // Todo we need to handle the edge cases
      console.log('Error loading events')
      if (response.status === 401) {
        notificationStore.addNotification({
          type: 'error',
          message: 'Session expired. Please log in again.',
        })
      }

    }

  } catch (e) {
    console.log('aqui error', e.response.status)
    if (e.response.status === 401) {
      notificationStore.addNotification({
        type: 'error',
        message: 'Session expired. Please log in again.',
      })
    }

  } finally {
    loading.value = false
  }
}


const triggerEventsModal = () => {
  showEventsModal.value = true
}

watch(() => userStore?.preferences?.visualTheme,  () => {
  const theme = userStore?.preferences?.visualTheme
  switch (theme) {
    case 'dark':
      document.documentElement.classList.add('dark')
      break
    case 'light':
      document.documentElement.classList.remove('dark')
      break
    case 'system':
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      break
    default:
      document.documentElement.classList.remove('light')
  }

})

</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-text font-[Poppins]">
    <div class="flex flex-1">
      <!-- Sidebar -->
      <aside class="w-64 bg-white dark:bg-gray-800 shadow-md hidden md:block">
        <InternalSidebar />
      </aside>

      <!-- Main content -->
      <div class="flex-1 flex flex-col">
        <HeaderBar />
        <main class="flex-1 p-6 overflow-y-auto">
          <router-view />
        </main>
      </div>
    </div>

    <InternalFooter />
    <CEventsModal
      v-model="showEventsModal"
    />
  </div>
</template>
