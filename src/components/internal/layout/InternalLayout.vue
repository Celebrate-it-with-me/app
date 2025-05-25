<script setup>
import InternalSidebar from '@/components/internal/layout/InternalSidebar.vue'
import HeaderBar from '@/components/internal/layout/InternalHeaderBar.vue'
import InternalFooter from '@/components/internal/layout/InternalFooter.vue'
import { onMounted, ref, watch } from 'vue'
import CEventsModal from '@/components/UI/modals/CEventsModal.vue'
import { useUserStore } from '@/stores/useUserStore'
import { useEventsStore } from '@/stores/useEventsStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { useHydrationStore } from '@/stores/useHydrationStore'
import CPageLoaderV2 from '@/components/UI/loading/CPageLoaderV2.vue'

const userStore = useUserStore()
const eventsStore = useEventsStore()
const hydrationStore = useHydrationStore()
const showEventsModal = ref(false)
const loading = ref(false)
const notificationStore = useNotificationStore()

onMounted(async () => {
  loading.value = true
  if (!hydrationStore.isHydrated) {
    await hydrationStore.hydrateAll()
  }

  await loadEvents()
  loading.value = false
})

const loadEvents = async () => {
  try {
    await eventsStore.loadEventsPlansAndType()
    const response = await userStore.initUserEvents()

    if (response.status >= 200 && response.status < 300) {
      const result = response.data?.data ?? {}
      await eventsStore.initUserEventsData(result)

      if (userStore.justLogin === true) {
        triggerEventsModal()
        userStore.justLogin = false
      }
    } else {
      if (response.status === 401) {
        notificationStore.addNotification({
          type: 'error',
          message: 'Session expired. Please log in again.',
        })
      }

    }

  } catch (e) {
    if (e.response.status === 401) {
      notificationStore.addNotification({
        type: 'error',
        message: 'Session expired. Please log in again.',
      })
    }
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
      <aside class="w-64 bg-white dark:bg-gray-800 shadow-md hidden md:block h-screen sticky top-0">
        <InternalSidebar />
      </aside>

      <!-- Main content -->
      <div class="flex-1 flex flex-col min-h-screen">
        <HeaderBar class="bg-white sticky top-0 z-10" />
        <CPageLoaderV2 v-if="loading" />
        <main
          v-else
          class="flex-1 p-6"
        >
          <router-view />
        </main>
        <InternalFooter />
      </div>
    </div>

    <!-- Modals -->
    <CEventsModal
      v-model="showEventsModal"
    />
  </div>
</template>
