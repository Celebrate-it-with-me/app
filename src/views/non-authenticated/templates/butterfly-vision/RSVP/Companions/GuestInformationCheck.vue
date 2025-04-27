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
    <h2 class="text-2xl font-semibold mb-6 pt-4 text-dark-blue">Confirm your Information</h2>

    <div
      class="w-full flex flex-col md:flex-row justify-between text-dark-blue"
    >
      <!-- Guest Info -->
      <div class="w-full md:w-[50%] p-6">
        <h3 class="text-xl font-semibold mb-4 border-b pb-2">Main Guest Information:</h3>
        <div class="space-y-2">
          <p class="flex items-center">
            <span class="font-semibold w-24">Name:</span> {{ guestInfo?.name }}</p>
          <p class="flex items-center">
            <span class="font-semibold w-24">Email:</span> {{ guestInfo?.email ?? 'N/A' }}</p>
          <p class="flex items-center">
            <span class="font-semibold w-24">Phone:</span> {{ guestInfo?.phone ?? 'N/A' }}</p>
          <p class="flex items-center">
            <span class="font-semibold w-24">Attending:</span> {{ guestInfo?.rsvpStatus ?? 'N/A' }}</p>
        </div>
      </div>


      <!-- Companions Info -->
      <div
        class="w-full md:w-[50%] p-6"
      >
        <h3 class="text-xl font-semibold mb-4 border-b pb-2">Companions List:</h3>
        <div class="relative overflow-x-auto">
          <ul class="space-y-2">
            <li
              v-for="companion in companions"
              :key="companion.id"
              class="bg-white"
            >
              <p class="flex items-center mb-1">
                <span class="font-semibold w-24">Name:</span>
                {{ companion.name ?? 'N/A' }}
              </p>
              <p class="flex items-center">
                <b class="font-semibold w-24">
                  Attending:
                </b>
                <span
                  v-if="companion.rsvpStatus === 'attending'"
                >
                   Attending
                </span>
                <span
                  v-else-if="companion.rsvpStatus === 'not-attending'"
                >
                   Not Attending
                </span>
                <span
                  v-else
                >
                  Pending
                </span>
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Buttons -->
    <div class="w-full mb-2 flex flex-row justify-end mt-10 gap-x-2">
      <button
        class="px-6 py-2 border-2 font-bold mr-2 mb-2"
        style="font-family: inherit; color: #9a929e; background-color: transparent; border-color: #9a929e; border-radius: 8px;"
        @click="goBack"
      >
        Back
      </button>

      <button
        class="px-6 py-2 border-2 font-bold mr-2 mb-2"
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
