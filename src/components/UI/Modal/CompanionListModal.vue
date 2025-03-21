<script setup>
import CWMModal from '@/components/UI/Modal/CWMModal.vue'
import { computed, ref, watch } from 'vue'
import { FwbDropdown, FwbListGroup, FwbListGroupItem } from 'flowbite-vue'
import RemoveCompanion from '@/components/UI/Modal/companions/RemoveCompanion.vue'
import { useGuestsStore } from '@/stores/useGuestStore'
import CWMAlert from '@/components/UI/alerts/CWMAlert.vue'

const emit = defineEmits(['closeModal'])
const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
})

const guestStore = useGuestsStore()

const showModal = ref(props.open)
const viewSelected = ref('companionList')
const companionSelected = ref(null)

const handleClose = () => {
  emit('closeModal')
}

const changeViewSelected = (view, companion = null) => {
  viewSelected.value = view
  if (companion) {
    companionSelected.value = companion
  }
}

const selectedGuest = computed(() => guestStore.currentGuest)

watch(
  () => props.open,
  (newValue) => {
    showModal.value = newValue
  }
)
</script>

<template>
  <CWMModal
    :show-modal="showModal"
    :size="'6xl'"
    @close="handleClose"
  >
    <template #header> Companions List </template>

    <template #body>
      <div
        v-if="viewSelected === 'companionList'"
      >
        <div
          v-if="!selectedGuest.companions.length"
        >
          <CWMAlert
            alertType="warning"
          >
            This guest does not have companions
          </CWMAlert>
        </div>

        <table
          class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 mt-5"
          v-if="selectedGuest.companions.length > 0"
        >
          <caption
            class="p-5 mb-6 text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white dark:text-white dark:bg-gray-800"
          >
            <p class="mb-4 text-base font-medium text-gray-700 dark:text-gray-300">
              <strong>Guest Name:</strong> {{ selectedGuest?.firstName }}
              {{ selectedGuest?.lastName }}
            </p>
            <p class="mb-4 text-base font-medium text-gray-700 dark:text-gray-300">
              <strong>Email:</strong> <span v-if="!selectedGuest?.email">No Email</span
            ><span v-else>{{ selectedGuest.email }}</span>
            </p>
            <p class="mb-4 text-base font-medium text-gray-700 dark:text-gray-300">
              <strong>Phone Number:</strong>
              <span v-if="!selectedGuest?.phoneNumber">No Phone Number</span
              ><span v-else>{{ selectedGuest.phoneNumber }}</span>
            </p>
          </caption>
          <thead
            class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
          >
          <tr>
            <th scope="col" class="px-6 py-3">Name</th>
            <th scope="col" class="px-6 py-3">Email</th>
            <th scope="col" class="px-6 py-3">Phone Number</th>
            <th scope="col" class="px-6 py-3">Meal Preference</th>
            <th scope="col" class="px-6 py-3">Confirmed Status</th>
            <th scope="col" class="px-6 py-3">
              Actions
            </th>
          </tr>
          </thead>
          <tbody>
          <tr
            v-for="companion in selectedGuest.companions"
            :key="companion.id"
            class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200"
          >
            <th
              scope="row"
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              {{ companion.firstName }} {{ companion.lastName }}
            </th>
            <td class="px-6 py-4">
              <span v-if="!companion.email">No Email</span>
              <span v-else>{{ companion.email }}</span>
            </td>
            <td class="px-6 py-4">
              <span v-if="!companion.phoneNumber">No phone number</span>
              <span v-else>{{ companion.phoneNumber }}</span>
            </td>
            <td class="px-6 py-4">
              {{ companion.mealPreference }}
            </td>
            <td class="px-6 py-4">
              {{ companion.confirmed }}
            </td>
            <td class="px-6 py-4 text-center">
              <fwb-dropdown
                text="Actions"
                content-class="rounded-lg"
                color="yellow"
              >
                <fwb-list-group class="text-sm text-gray-700 dark:text-gray-200">
                  <fwb-list-group-item
                    class="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    @click="changeViewSelected('update', companion)"
                  >
                    Update
                  </fwb-list-group-item>
                  <fwb-list-group-item
                    class="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    @click="changeViewSelected('remove', companion)"
                  >
                    Remove
                  </fwb-list-group-item>
                </fwb-list-group>
              </fwb-dropdown>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
      <div
        v-else-if="viewSelected === 'update'"
      >
        Update View
      </div>
      <div
        v-else-if="viewSelected === 'remove'"
      >
        <RemoveCompanion
          :companion="companionSelected"
          @removed-companion="changeViewSelected('companionList')"
        />
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end">
        <div class="action-container flex gap-x-2">
          <button
            type="button"
            class="bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium py-2 px-6 rounded-md"
            @click="handleClose"
          >
            Close
          </button>
        </div>
      </div>
    </template>
  </CWMModal>
</template>

<style scoped></style>
