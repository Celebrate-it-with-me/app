<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import CWMPagination from '@/components/UI/pagination/CWMPagination.vue'
import CWMLoading from '@/components/UI/loading/CWMLoading.vue'
import { useEventsStore } from '@/stores/useEventsStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { useGuestsStore } from '@/stores/useGuestStore'
import CWMAlert from '@/components/UI/alerts/CWMAlert.vue'
import CompanionListModal from '@/components/UI/Modal/CompanionListModal.vue'

const emit = defineEmits(['showAddGuest'])

const eventGuests = ref([])
const perPage = ref(5)
const loading = ref(false)
const pageSelected = ref(1)
const totalItems = ref(0)
const eventStore = useEventsStore()
const notificationStore = useNotificationStore()
const guestStore = useGuestsStore()
const companionsModal = ref(false)
const selectedGuest = ref(null)


onMounted(() => {
  loadEventGuests()
})

const eventTitle = computed(() => {
  return eventStore.currentEvent?.eventName
})

const loadEventGuests = async () => {
  try {
    loading.value = true

    const response = await guestStore.loadGuests({
      perPage: perPage.value,
      pageSelected: pageSelected.value
    })

    if (response.status === 200) {
      eventGuests.value = response.data?.data ?? []
      totalItems.value = response.data?.meta?.total ?? 0
      pageSelected.value = response.data?.meta?.current_page ?? 1

      notificationStore.addNotification({
        type: 'success',
        message: 'Guests loaded successfully!'
      })
    } else {
      notificationStore.addNotification({
        type: 'error',
        message: 'Oops something went wrong!'
      })
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

const handleUpdatePerPage = (value) => {
  guestStore.perPage = value
}

const showAddGuestView = () => {
  emit('showAddGuest')
}

const showCompanionsList = (guest) => {
  selectedGuest.value = guest
  companionsModal.value = true
}

watch(pageSelected, () => {
  loadEventGuests()
})

watch(perPage, () => {
  loadEventGuests()
})

</script>

<template>
  <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
    <div v-if="loading" class="loading-class flex justify-center items-center">
      <CWMLoading />
    </div>

    <div
      class="flex w-full justify-end"
    >
      <button
        class="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-6 rounded-md"
        @click="showAddGuestView"
      >
        Add Guest
      </button>
    </div>

    <div
      class="mt-5"
      v-if="!loading"
    >
      <CWMAlert
        type="info"
        v-if="!eventGuests.length"
      >
        There is not guests for this event yet!
      </CWMAlert>
      <table
        v-else
        class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 mt-5"
      >
        <caption
          class="p-5 text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white dark:text-white dark:bg-gray-800"
        >
          Guest List
          <p class="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
            This is the guest list for your event **{{ eventTitle }}**. To see more information,
            click on **more info**, to view companions, click on **companions**, and to edit a value,
            click on the value you want to edit.

          </p>
        </caption>
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th scope="col" class="px-6 py-3">Guest Name</th>
          <th scope="col" class="px-6 py-3">Email</th>
          <th scope="col" class="px-6 py-3">Phone Number</th>
          <th scope="col" class="px-6 py-3">Companions</th>
          <th scope="col" class="px-6 py-3">
            <span class="sr-only">Edit</span>
          </th>
        </tr>
        </thead>
        <tbody>
        <tr
          v-for="guest in eventGuests"
          :key="guest.id"
          class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200"
        >
          <th
            scope="row"
            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
          >
            {{ guest.firstName }} {{ guest.lastName }}
          </th>
          <td class="px-6 py-4">
            <span v-if="!guest.email">No Email</span>
            <span v-else>{{ guest.email }}</span>
          </td>
          <td class="px-6 py-4">
            <span v-if="!guest.phoneNumber">No phone number</span>
            <span v-else>{{ guest.phoneNumber }}</span>
          </td>
          <td class="px-6 py-4">
            <span v-if="guest.companionType === 'no_companion' ">
              <span class="bg-red-300 text-white text-xs font-medium me-2 px-2.5 py-0.5
                          rounded-full dark:bg-red-500/50 dark:text-white">
                No companions
              </span>
            </span>
            <span v-else>
              <span
                class="bg-yellow-300 text-white text-xs font-medium me-2 px-2.5 py-0.5
                          rounded-full dark:bg-yellow-600 dark:text-white cursor-pointer"
                @click="showCompanionsList(guest)"
              >
                {{ guest.companionQty }}
              </span>
            </span>
          </td>
          <td class="px-6 py-4 text-right">
            <a href="#" class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            >more info</a
            >
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <CompanionListModal
      :open="companionsModal"
      @close-modal="companionsModal = false"
    ></CompanionListModal>
  </div>
  <CWMPagination
    v-if="eventGuests.length"
    v-model="pageSelected"
    :total-items="totalItems"
    @update:per-page="handleUpdatePerPage"
  />
</template>

<style scoped></style>
