<script setup>
import { FwbButton, FwbDropdown, FwbListGroup, FwbListGroupItem } from 'flowbite-vue'
import { computed, ref } from 'vue'
import { useGuestsStore } from '@/modules/guests/stores/useGuestStore'
import RemoveCompanion from '@/components/UI/Modal/companions/RemoveCompanion.vue'
import CreateUpdateCompanion from '@/components/UI/Modal/companions/CreateUpdateCompanion.vue'

const view = ref('list')
const companionSelected = ref(null)
const guestStore = useGuestsStore()

const changeView = (newView, companion = null) => {
  view.value = newView
  if (companion) {
    companionSelected.value = companion
  }
}

const selectedGuest = computed(() => guestStore.currentGuest)
</script>

<template>
  <div v-if="view === 'list'" class="w-full">
    <div class="flex justify-end gap-x-2 mb-4">
      <fwb-button color="yellow" @click="changeView('create')"> Add Companion </fwb-button>
    </div>

    <div v-if="!selectedGuest.companions.length">
      The selected guest have {{ selectedGuest.companionQty }} companions, but they are not assigned
      yet!
    </div>
    <table
      v-if="selectedGuest.companions.length > 0"
      class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 mt-5"
    >
      <caption
        class="p-5 mb-6 text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white dark:text-white dark:bg-gray-800"
      >
        <p class="mb-4 text-base font-medium text-gray-700 dark:text-gray-300">
          <strong>Guest Name: </strong>
          <span class="font-extralight">
            {{ selectedGuest?.firstName }} {{ selectedGuest?.lastName }}
          </span>
        </p>
        <p class="mb-4 text-base font-medium text-gray-700 dark:text-gray-300">
          <strong>Email: </strong>
          <span v-if="!selectedGuest?.email" class="font-extralight"> No Email</span>
          <span v-else class="font-extralight"> {{ selectedGuest.email }}</span>
        </p>
        <p class="mb-4 text-base font-medium text-gray-700 dark:text-gray-300">
          <strong>Phone Number: </strong>
          <span v-if="!selectedGuest?.phoneNumber" class="font-extralight"> No Phone Number</span
          ><span v-else class="font-extralight"> {{ selectedGuest.phoneNumber }}</span>
        </p>
        <p class="mb-4 text-base font-medium text-gray-700 dark:text-gray-300">
          <strong>Companions Type: </strong>
          <span class="font-extralight"> {{ selectedGuest.companionType }}</span>
        </p>
      </caption>
      <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th scope="col" class="px-6 py-3">Name</th>
          <th scope="col" class="px-6 py-3">Email</th>
          <th scope="col" class="px-6 py-3">Phone Number</th>
          <th scope="col" class="px-6 py-3">Meal Preference</th>
          <th scope="col" class="px-6 py-3">Confirmed Status</th>
          <th scope="col" class="px-6 py-3">Actions</th>
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
            <fwb-dropdown text="Actions" content-class="rounded-lg" color="yellow">
              <fwb-list-group class="text-sm text-gray-700 dark:text-gray-200">
                <fwb-list-group-item
                  class="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  @click="changeView('update', companion)"
                >
                  Update
                </fwb-list-group-item>
                <fwb-list-group-item
                  class="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  @click="changeView('remove', companion)"
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
  <RemoveCompanion
    v-if="view === 'remove'"
    :companion="companionSelected"
    @removed-companion="view = 'list'"
  />
  <CreateUpdateCompanion
    v-if="view === 'create' || view === 'update'"
    :mode="view"
    :companion="companionSelected"
    @processed-companion="view = 'list'"
  />
</template>

<style scoped></style>
