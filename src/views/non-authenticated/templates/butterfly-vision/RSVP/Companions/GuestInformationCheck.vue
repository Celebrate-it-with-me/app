<script setup>
import { computed, ref } from 'vue'
import { useTemplateStore } from '@/stores/useTemplateStore'

const emit = defineEmits(['goBack', 'submit'])
const templateStore = useTemplateStore()
const loading = ref(false)

const guestInfo = computed(() => templateStore.guest)
const companions = computed(() => templateStore.guest?.companions ?? [])

const goBack = () => {
  emit('goBack')
}

const submit = async () => {
  try {
    loading.value = true
    const response = await templateStore.rsvpSaveUpdate()

    if (response.status === 200) {
      templateStore.guest.rsvpCompleted = true
    } else {
      console.log(response)
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

</script>


<template>
  <div class="w-full flex flex-col items-center">
    <h2 class="text-2xl font-bold mb-6">Confirm Your Information</h2>

    <div
      class="w-full flex flex-row justify-between"
    >
      <!-- Guest Info -->
      <div class="mb-8">
        <h3 class="text-2xl font-semibold mb-4">Guest Information:</h3>
        <div>
          <p><strong>Name:</strong> {{ guestInfo?.firstName }} {{ guestInfo?.lastName }}</p>
          <p><strong>Email:</strong> {{ guestInfo?.email ?? 'N/A' }}</p>
          <p><strong>Phone:</strong> {{ guestInfo?.phoneNumber ?? 'N/A' }}</p>
          <p><strong>Meal Selected:</strong> {{ guestInfo?.mealPreference ?? 'N/A' }}</p>
          <p><strong>Attending:</strong> {{ guestInfo?.confirmed ?? 'N/A' }}</p>
        </div>
      </div>

      <!-- Companions Info -->
      <div
        v-if="templateStore.guest.confirmed === 'yes'"
        class="mb-8 w-[80%]"
      >
        <h3 class="text-2xl font-semibold mb-4">Companions Information:</h3>
        <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead
              class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
            >
            <tr>
              <th scope="col" class="px-6 py-3">Name</th>
              <th scope="col" class="px-6 py-3">Email</th>
              <th scope="col" class="px-6 py-3">Phone</th>
              <th scope="col" class="px-6 py-3">Meal</th>
              <th scope="col" class="px-6 py-3">Will Attend?</th>
            </tr>
            </thead>
            <tbody>
            <tr
              v-for="companion in companions"
              :key="companion.id"
              class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-700 border-b"
            >
              <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                {{ companion.firstName ?? 'N/A' }} {{ companion.lastName ?? '' }}
              </td>
              <td class="px-6 py-4">
                {{ companion.email ?? 'N/A' }}
              </td>
              <td class="px-6 py-4">
                {{ companion.phoneNumber ?? 'N/A' }}
              </td>
              <td class="px-6 py-4">
                {{ companion.mealPreference ?? 'N/A' }}
              </td>
              <td class="px-6 py-4">
                {{ companion.confirmed ?? 'N/A' }}
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div
        v-else
        class="mb-8 w-[60%]"
      >
        <div
          class="alert-container border border-[#f3a40a] px-10 py-5 rounded-lg"
        >
          <p class="">
            You have indicated that you are not attending. Therefore, we will assume that none of
            your companions will be attending either. If this is not the case, please contact
            the event organizer to request a new invitation with one of your companions as the
            main guest.
          </p>
        </div>
      </div>
    </div>

    <!-- Buttons -->
    <div class="w-full flex flex-row justify-end mt-10 gap-x-5">
      <button
        class="px-6 py-2 border-2 font-bold"
        style="font-family: inherit; color: #9a929e; background-color: transparent; border-color: #9a929e; border-radius: 8px;"
        @click="goBack"
      >
        Back
      </button>

      <button
        class="px-6 py-2 border-2 font-bold"
        style="font-family: inherit; color: #dba3ff; background-color: transparent; border-color: #dba3ff; border-radius: 8px;"
        @click="submit"
      >
        Submit
      </button>
    </div>
  </div>
</template>

<style scoped>

</style>
