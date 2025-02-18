<script setup>
import { computed } from 'vue'
import { useTemplateStore } from '@/stores/useTemplateStore'

const mealsAvailable = [
  { value: 1, text: 'Chicken Soup'},
  { value: 2, text: 'Motton Kabab'},
  { value: 3, text: 'Chicken BBQ'},
  { value: 4, text: 'Mix Salad'},
  { value: 5, text: 'Beef Ribs'},
]

const emit = defineEmits(['setCurrentCompanion'])
const templateStore = useTemplateStore()

const companions = computed(() => {
  return templateStore.guest?.companions ?? []
})

const handleConfirmation = (companion) => {
  emit('setCurrentCompanion', companion)
}

const getMealName = (mealId) => {
  if (!mealId) {
    return ''
  }

  const meal = mealsAvailable.find((meal) => meal.value === mealId )
  return meal ? meal.text : ''
}

</script>

<template>
  <div
    class="w-[80%]"
  >
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
          <th scope="col" class="px-6 py-3">Action</th>
        </tr>
        </thead>
        <tbody>
        <tr
          v-for="companion in companions"
          class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200"
          :key="companion.id"
        >
          <th
            scope="row"
            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
          >
            {{ companion.firstName }} {{ companion.lastName }}
          </th>
          <td class="px-6 py-4">
            {{ companion.email ?? '' }}
          </td>
          <td class="px-6 py-4">
            {{ companion.phoneNumber ?? '' }}
          </td>
          <td class="px-6 py-4">
            {{ getMealName(companion.mealPreference) ?? '' }}
          </td>
          <td class="px-6 py-4">
            <span>{{ companion.confirmed }}</span>
          </td>
          <td class="px-6 py-4">
                <span
                  class="font-medium text-blue-600 dark:text-blue-500 hover:underline cursor-pointer"
                  @click="handleConfirmation(companion)"
                >
                  <span v-if="companion.confirmed === 'pending'">Confirmar</span>
                  <span v-else>Editar</span>
                </span>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>

</style>
