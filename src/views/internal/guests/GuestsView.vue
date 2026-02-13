<template>
  <div class="space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Page Header -->
    <div class="relative mb-12">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 class="text-4xl font-black text-gray-900 tracking-tight mb-2">
            Event
            <span class="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600"
              >Guests</span
            >
          </h1>
          <p class="text-gray-500 font-medium">
            Manage your event guests and their companions. Keep track of guest information and
            dietary restrictions.
          </p>
        </div>

        <div v-if="hasGuests" class="flex flex-shrink-0">
          <CButton
            variant="gradient"
            class="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white shadow-xl shadow-purple-500/20 px-8 h-14 rounded-2xl transition-all hover:-translate-y-0.5 active:scale-95"
            :disabled="loading || menuStore.needMenu"
            @click="createGuest"
          >
            <PlusCircle class="w-5 h-5 mr-2" />
            <span class="font-bold">Add Guest</span>
          </CButton>
        </div>
      </div>
    </div>

    <!-- Guest List Section -->
    <section>
      <div v-if="hasGuests" class="flex items-center justify-between mb-6">
        <CHeading :level="2" weight="semibold" class="text-2xl">Guest List</CHeading>
      </div>

      <div
        v-if="menuStore.needMenu"
        class="not-menu bg-white dark:bg-gray-900 shadow-card rounded-2xl p-6"
      >
        <CAlert variant="info">
          This event does not have a menu yet. Please create a menu before adding guests.
        </CAlert>
      </div>
      <template v-else>
        <GuestsTable v-if="hasGuests" ref="guestsTableRef" @loading="setLoading" />
        <NoGuests v-else @add-first-guest="createGuest" />
      </template>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { PlusCircle } from 'lucide-vue-next'
import CButton from '@/components/UI/buttons/CButton.vue'
import CHeading from '@/components/UI/headings/CHeading.vue'
import { useGuestsStore } from '@/stores/useGuestStore'
import CAlert from '@/components/UI/alerts/CAlert.vue'
import { useRouter } from 'vue-router'
import { useMenusStore } from '@/stores/useMenusStore'
import GuestsTable from '@/views/internal/guests/GuestsTable.vue'
import NoGuests from '@/views/internal/guests/NoGuests.vue'

const router = useRouter()
const guestStore = useGuestsStore()
const menuStore = useMenusStore()
const loading = ref(false)
const guestsTableRef = ref(null)

const hasGuests = computed(() => {
  return guestStore.guests && guestStore.guests.length > 0
})

const createGuest = async () => {
  await router.push('/dashboard/guests/create')
}

const setLoading = isLoading => {
  loading.value = isLoading
}
</script>
