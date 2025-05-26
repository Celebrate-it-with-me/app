<template>
  <div class="space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Page Header -->
    <div class="border-b border-gray-200 dark:border-gray-700 pb-5">
      <CHeading :level="1" weight="semibold" class="text-3xl sm:text-4xl mb-2">Event Menus</CHeading>
      <p class="text-gray-600 dark:text-gray-400 max-w-3xl">
        Manage your event menus and track guest selections. Create multiple menu options for your guests to choose from.
      </p>
    </div>

    <!-- Event Menus Section -->
    <section>
      <div class="flex items-center justify-between mb-6">
        <CHeading :level="2" weight="semibold" class="text-2xl">Menu Options</CHeading>
        <CButton variant="primary" @click="createMenu" :disabled="loading">
          <span v-if="loading" class="mr-2">
            <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
          </span>
          <span>+ Add Menu</span>
        </CButton>
      </div>
      <MenusTable ref="menusTableRef" @loading="setLoading" />
    </section>

    <!-- Guest Menu Selection Section -->
    <section>
      <div class="flex items-center justify-between mb-6">
        <CHeading :level="2" weight="semibold" class="text-2xl">Guest Menu Selection</CHeading>
        <div class="flex items-center">
          <span v-if="guestMenuCount" class="text-sm text-gray-600 dark:text-gray-400 mr-4">
            {{ guestMenuCount }} guest selections
          </span>
        </div>
      </div>
      <GuestsMenu ref="guestsMenuRef" @loading="setLoading" />
    </section>
  </div>
</template>

<script setup>
import CButton from '@/components/UI/buttons/CButton.vue'
import CHeading from '@/components/UI/headings/CHeading.vue'
import { useRouter } from 'vue-router'
import MenusTable from '@/views/internal/menus/MenusTable.vue'
import GuestsMenu from '@/views/internal/menus/GuestsMenu.vue'
import { ref, computed, onMounted } from 'vue'
import { useMenusStore } from '@/stores/useMenusStore'

const router = useRouter()
const menuStore = useMenusStore()
const loading = ref(false)
const menusTableRef = ref(null)
const guestsMenuRef = ref(null)

const guestMenuCount = computed(() => {
  return menuStore.guestsMenu?.length || 0
})

const createMenu = async () => {
  await router.push('/dashboard/menus/create')
}

const setLoading = (isLoading) => {
  loading.value = isLoading
}

onMounted(async () => {
  // Initial data loading
  loading.value = true
  try {
    await menuStore.loadMenus()
    await menuStore.loadGuestsMenu()
  } catch (error) {
    console.error('Error loading menu data:', error)
  } finally {
    loading.value = false
  }
})
</script>
