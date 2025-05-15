<template>
  <section class="bg-white dark:bg-gray-900 shadow-card rounded-2xl p-6 space-y-6">
    <!-- Guest Info -->
    <div>
      <h3 class="text-base font-semibold text-gray-800 dark:text-white mb-2">Guest Info</h3>
      <ul class="text-sm text-gray-700 dark:text-gray-300 space-y-1">
        <li><strong>Name:</strong> {{ guestData.name }}</li>
        <li><strong>Email:</strong> {{ guestData.email || 'N/A' }}</li>
        <li><strong>Phone:</strong> {{ guestData.phone || 'N/A' }}</li>
        <li><strong>Menu:</strong> {{ guestDataMenu.title || 'N/A' }}</li>
      </ul>
    </div>

    <!-- Companions -->
    <div>
      <h3 class="text-base font-semibold text-gray-800 dark:text-white mb-2">Companions</h3>

      <div class="overflow-x-auto">
        <table class="min-w-full text-sm text-left text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
          <thead class="bg-gray-100 dark:bg-gray-800 uppercase text-xs text-gray-600 dark:text-gray-400">
          <tr>
            <th scope="col" class="px-4 py-2">Companion Name</th>
            <th scope="col" class="px-4 py-2">Email</th>
            <th scope="col" class="px-4 py-2">Phone</th>
            <th scope="col" class="px-4 py-2">Menu Selected</th>
          </tr>
          </thead>
          <tbody>
          <template v-if="namedCompanions.length">
            <template
              v-for="(companion, index) in namedCompanions"
              :key="index"

            >
              <GuestNamedCompanionTr
                class="border-t border-gray-200 dark:border-gray-700"
                :companion="companion"
              />
            </template>
          </template>
          <tr v-else>
            <td colspan="3" class="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
              No named companions
            </td>
          </tr>
          </tbody>
          <tfoot class="bg-gray-50 dark:bg-gray-900 text-sm">
            <tr class="border-t border-gray-200 dark:border-gray-700">
              <td colspan="3" class="px-4 py-2 font-semibold">Unnamed Companions</td>
              <td class="px-4 py-2 text-right">{{ unnamedCompanions || 0 }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Preferences -->
    <div>
      <h3 class="text-base font-semibold text-gray-800 dark:text-white mb-2">Preferences</h3>
      <ul class="text-sm text-gray-700 dark:text-gray-300 space-y-1">
        <li><strong>Meal Preference:</strong> {{ preferences.meal_preference || 'N/A' }}</li>
        <li><strong>Allergies:</strong> {{ preferences.allergies || 'N/A' }}</li>
        <li><strong>Notes:</strong> {{ preferences.notes || 'N/A' }}</li>
      </ul>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useMenusStore } from '@/stores/useMenusStore'
import GuestNamedCompanionTr from '@/components/internal/guests/GuestNamedCompanionTr.vue'

const props = defineProps({
  guestData: { type: Object, required: true },
  namedCompanions: { type: Array, required: true },
  unnamedCompanions: { type: Number, required: true },
  preferences: { type: Object, required: true },
})

const menusStore = useMenusStore()

const guestDataMenu = computed(() => {
  return menusStore.menus.find((menu) => menu.id === props.guestData.menuSelected)
})


</script>
