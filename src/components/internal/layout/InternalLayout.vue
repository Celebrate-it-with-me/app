<script setup>
import InternalSidebar from '@/components/internal/layout/InternalSidebar.vue'
import HeaderBar from '@/components/internal/layout/InternalHeaderBar.vue'
import InternalFooter from '@/components/internal/layout/InternalFooter.vue'
import { computed, onMounted, ref, watch } from 'vue'
import CEventsModal from '@/components/UI/modals/CEventsModal.vue'
import { useUserStore } from '@/stores/useUserStore'
import { useEventsStore } from '@/stores/useEventsStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { useHydrationStore } from '@/stores/useHydrationStore'
import CPageLoaderV2 from '@/components/UI/loading/CPageLoaderV2.vue'
import { useCollaboratorsStore } from '@/stores/useCollaboratorsStore'
import CAlert from '@/components/UI/alerts/CAlert.vue'
import { useRoute } from 'vue-router'

const userStore = useUserStore()
const eventsStore = useEventsStore()
const hydrationStore = useHydrationStore()
const showEventsModal = ref(false)
const loading = ref(false)
const notificationStore = useNotificationStore()
const sidebarExpanded = ref(true)
const mobileSidebarOpen = ref(false)
const collaboratorsStore = useCollaboratorsStore()
const route = useRoute()

const shouldShowRouteView = computed(() => {
  if (route.name === 'invitations-processor') {
    return true
  }

  return eventsStore.activeEvent
})

onMounted(async () => {
  loading.value = true
  if (!hydrationStore.isHydrated) {
    await hydrationStore.hydrateAll()
  }

  await collaboratorsStore.loadInvitations()
  loading.value = false

  if (userStore.justLogin === true) {
    triggerEventsModal()
    userStore.justLogin = false
  }
})

const triggerEventsModal = () => {
  showEventsModal.value = true
}

watch(
  () => userStore?.preferences?.visualTheme,
  () => {
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
  }
)
</script>
<template>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-text font-[Poppins]">
    <div class="flex flex-1">
      <!-- Mobile sidebar backdrop -->
      <div
        v-if="mobileSidebarOpen"
        class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        @click="mobileSidebarOpen = false"
      ></div>

      <!-- Sidebar -->
      <aside
        :class="[
          sidebarExpanded ? 'w-64' : 'w-20',
          'bg-white dark:bg-gray-800 shadow-md h-screen transition-all duration-300 ease-in-out',
          mobileSidebarOpen
            ? 'fixed inset-y-0 left-0 z-50 md:relative md:z-auto'
            : 'hidden md:block',
          'md:sticky md:top-0'
        ]"
      >
        <InternalSidebar @update:sidebar-state="sidebarExpanded = $event" />
      </aside>

      <!-- Main content -->
      <div class="flex-1 flex flex-col min-h-screen overflow-hidden">
        <HeaderBar
          class="bg-white sticky top-0 z-10"
          @toggle-mobile-sidebar="mobileSidebarOpen = !mobileSidebarOpen"
        />
        <CPageLoaderV2 v-if="loading" />
        <main v-else class="flex-1 p-6 overflow-hidden">
          <CAlert v-if="!shouldShowRouteView">
            <template #icon>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-yellow-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </template>
            <template #title> No active event found </template>
            Please select or create an event to continue.
          </CAlert>
          <router-view v-else />
          <!-- Modals -->
          <CEventsModal v-model="showEventsModal" />
        </main>
        <InternalFooter />
      </div>
    </div>
  </div>
</template>
