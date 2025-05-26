<template>
  <div class="bg-white dark:bg-gray-900 shadow-lg rounded-xl p-6">
    <div class="overflow-x-auto">
      <div v-if="loading">
        <CLoading />
      </div>
      <div v-else>
        <table
          class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
          v-if="companions.length"
        >
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Name
              </th>
              <th
                class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Guest
              </th>
              <th
                class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Dietary Restrictions
              </th>
              <th
                class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            <tr
              v-for="companion in companions"
              :key="companion.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
                {{ companion.name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {{ findGuestName(companion.guestId) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {{ companion.dietaryRestrictions || 'None' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-left flex flex-start gap-2 text-sm">
                <CButton size="sm" variant="primary" @click="viewCompanion(companion)">Details</CButton>
                <CButton size="sm" variant="outline" @click="confirmDelete(companion)">Delete</CButton>
              </td>
            </tr>
          </tbody>
        </table>
        <CAlert variant="" v-else> There are no companions for guests yet. </CAlert>
      </div>

      <CConfirmModal
        :modelValue="confirmDeleteModal"
        title="Delete Companion"
        message="Are you sure you want to delete this companion? This action cannot be undone."
        @confirm="deleteCompanion()"
        @update:modelValue="confirmDeleteModal = false"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import { useGuestsStore } from '@/stores/useGuestStore'
import CLoading from '@/components/UI/loading/CLoading.vue'
import CAlert from '@/components/UI/alerts/CAlert.vue'
import CConfirmModal from '@/components/UI/modals/CConfirmModal.vue'

const emit = defineEmits(['loading'])

const guestStore = useGuestsStore()
const loading = ref(false)
const companionToDelete = ref(null)
const confirmDeleteModal = ref(false)

// Computed property to get all companions from all guests
const companions = computed(() => {
  const allCompanions = []
  if (guestStore.guests && guestStore.guests.length) {
    guestStore.guests.forEach(guest => {
      if (guest.companions && guest.companions.length) {
        guest.companions.forEach(companion => {
          allCompanions.push({
            ...companion,
            guestId: guest.id
          })
        })
      }
    })
  }
  return allCompanions
})

const findGuestName = (guestId) => {
  const guest = guestStore.guests.find(g => g.id === guestId)
  return guest ? guest.name : 'Unknown'
}

const viewCompanion = (companion) => {
  // This would typically open a modal or navigate to a details page
  console.log('View companion details:', companion)
}

const loadCompanions = async () => {
  loading.value = true
  emit('loading', true)
  await guestStore.loadGuests() // This will load guests with their companions
  loading.value = false
  emit('loading', false)
}

const deleteCompanion = async () => {
  if (companionToDelete.value) {
    loading.value = true
    emit('loading', true)

    try {
      // This would typically call an API to delete the companion
      // For now, we'll just log it
      console.log('Deleting companion:', companionToDelete.value)

      // Reload the data after deletion
      await loadCompanions()
      companionToDelete.value = null
    } catch (error) {
      console.error('Failed to delete companion:', error)
    } finally {
      confirmDeleteModal.value = false
      loading.value = false
      emit('loading', false)
    }
  }
}

const confirmDelete = (companion) => {
  companionToDelete.value = companion
  confirmDeleteModal.value = true
}

onMounted(async () => {
  await loadCompanions()
})
</script>
