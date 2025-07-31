<template>
  <div class="space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Page Header -->
    <div class="border-b border-gray-200 dark:border-gray-700 pb-5">
      <CHeading :level="1" weight="semibold" class="text-3xl sm:text-4xl mb-2"
        >Event Guests</CHeading
      >
      <p class="text-gray-600 dark:text-gray-400 max-w-3xl">
        Manage your event guests and their companions. Keep track of guest information and dietary
        restrictions.
      </p>
    </div>

    <!-- Guest List Section -->
    <section>
      <div class="flex items-center justify-between mb-6">
        <CHeading :level="2" weight="semibold" class="text-2xl">Guest List</CHeading>
        <CButton variant="primary" :disabled="loading || menuStore.needMenu" @click="createGuest">
          <span v-if="loading" class="mr-2">
            <span
              class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"
            ></span>
          </span>
          <span>+ Add Guest</span>
        </CButton>
      </div>

      <div
        v-if="menuStore.needMenu"
        class="not-menu bg-white dark:bg-gray-900 shadow-card rounded-2xl p-6"
      >
        <CAlert variant="info">
          This event does not have a menu yet. Please create a menu before adding guests.
        </CAlert>
      </div>
      <GuestsTable v-else ref="guestsTableRef" @loading="setLoading" />
    </section>

    <!-- Guest Companions Section -->
    <section v-if="!menuStore.needMenu">
      <div class="flex items-center justify-between mb-6">
        <CHeading :level="2" weight="semibold" class="text-2xl">Guest Companions</CHeading>
        <div class="flex items-center">
          <span v-if="companionCount" class="text-sm text-gray-600 dark:text-gray-400 mr-4">
            {{ companionCount }} companions
          </span>
        </div>
      </div>
      <GuestCompanions ref="guestCompanionsRef" @loading="setLoading" />
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CHeading from '@/components/UI/headings/CHeading.vue'
import { useGuestsStore } from '@/stores/useGuestStore'
import CAlert from '@/components/UI/alerts/CAlert.vue'
import { useRouter } from 'vue-router'
import { useMenusStore } from '@/stores/useMenusStore'
import GuestsTable from '@/views/internal/guests/GuestsTable.vue'
import GuestCompanions from '@/views/internal/guests/GuestCompanions.vue'

const router = useRouter()
const guestStore = useGuestsStore()
const menuStore = useMenusStore()
const loading = ref(false)
const guestsTableRef = ref(null)
const guestCompanionsRef = ref(null)

const companionCount = computed(() => {
  let count = 0
  if (guestStore.guests && guestStore.guests.length) {
    guestStore.guests.forEach(guest => {
      if (guest.companions && guest.companions.length) {
        count += guest.companions.length
      }
    })
  }
  return count
})

const createGuest = async () => {
  await router.push('/dashboard/guests/create')
}

const setLoading = isLoading => {
  loading.value = isLoading
}

onMounted(async () => {
  // Initial data loading
  loading.value = true
  try {
    await menuStore.loadMenus() // Check if menu exists
    await guestStore.loadGuests()
  } catch (error) {
    console.error('Error loading guest data:', error)
  } finally {
    loading.value = false
  }
})
</script>
