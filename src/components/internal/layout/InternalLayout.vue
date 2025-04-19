<script setup>
import InternalSidebar from '@/components/internal/layout/InternalSidebar.vue'
import HeaderBar from '@/components/internal/layout/InternalHeaderBar.vue'
import InternalFooter from '@/components/internal/layout/InternalFooter.vue'
import { onMounted, ref } from 'vue'
import CEventsModal from '@/components/UI/modals/CEventsModal.vue'
import { useUserStore } from '@/stores/useUserStore'
import { useEventsStore } from '@/stores/useEventsStore'

const userStore = useUserStore()
const eventsStore = useEventsStore()
const showEventsModal = ref(false)
const loading = ref(false)

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

      console.log('checking just login', userStore.justLogin)
      if (userStore.justLogin === true) {
        console.log('entre')
        triggerEventsModal()
        userStore.justLogin = false
      }
    } else {
      // Todo we need to handle the edge cases
      console.log('Error loading events')
    }

  } catch (e) {
    console.log(e)
  } finally {
    loading.value = false
  }
}


const triggerEventsModal = () => {
  showEventsModal.value = true
}

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
