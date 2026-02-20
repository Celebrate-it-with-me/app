<template>
  <section class="bg-white dark:bg-gray-900 shadow-card rounded-2xl p-6 space-y-6">
    <!-- Guest Info -->
    <div>
      <h3 class="text-base font-semibold text-gray-800 dark:text-white mb-2">Guest Info</h3>
      <ul class="text-sm text-gray-700 dark:text-gray-300 space-y-1">
        <li><strong>Name:</strong> {{ guestData.name }}</li>
        <li><strong>Email:</strong> {{ guestData.email || 'N/A' }}</li>
        <li><strong>Phone:</strong> {{ guestData.phone || 'N/A' }}</li>
        <li v-if="eventHasMenu">
          <strong> Menu: </strong>
          {{ guestDataMenu.title || 'N/A' }}
        </li>
      </ul>
    </div>

    <!-- Companions -->
    <div v-if="hasCompanions">
      <h3 class="text-base font-semibold text-gray-800 dark:text-white mb-2">Companions</h3>

      <div class="overflow-x-auto">
        <table
          class="min-w-full text-sm text-left text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
        >
          <thead
            class="bg-gray-100 dark:bg-gray-800 uppercase text-xs text-gray-600 dark:text-gray-400"
          >
            <tr>
              <th scope="col" class="px-4 py-2">Companion Name</th>
              <th scope="col" class="px-4 py-2">Email</th>
              <th scope="col" class="px-4 py-2">Phone</th>
              <th v-if="eventHasMenu" scope="col" class="px-4 py-2">Menu Selected</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="namedCompanions.length">
              <template v-for="(companion, index) in namedCompanions" :key="index">
                <GuestNamedCompanionTr
                  class="border-t border-gray-200 dark:border-gray-700"
                  :companion="companion"
                />
              </template>
            </template>
            <tr v-else>
              <td
                :colspan="eventHasMenu ? 3 : 2"
                class="px-4 py-3 text-center text-gray-500 dark:text-gray-400"
              >
                No named companions
              </td>
            </tr>
          </tbody>
          <tfoot class="bg-gray-50 dark:bg-gray-900 text-sm">
            <tr class="border-t border-gray-200 dark:border-gray-700">
              <td :colspan="eventHasMenu ? 3 : 2" class="px-4 py-2 font-semibold">
                Unnamed Companions
              </td>
              <td class="px-4 py-2 text-right">{{ unnamedCompanions || 0 }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
    <div v-else class="border border-gray-200 dark:border-gray-700 rounded-lg">
      <div class="p-6 text-center">
        <svg
          class="w-12 h-12 mx-auto mb-3 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <h4 class="text-sm font-medium text-gray-800 dark:text-white mb-1">No Companions</h4>
        <p class="text-xs text-gray-500 dark:text-gray-400">This guest is attending solo</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useMenusStore } from '@/modules/menus/stores/useMenusStore'
import GuestNamedCompanionTr from '@/components/internal/guests/GuestNamedCompanionTr.vue'

const props = defineProps({
  guestData: { type: Object, required: true },
  namedCompanions: { type: Array, required: true },
  unnamedCompanions: { type: Number, required: true },
  preferences: { type: Object, required: true }
})

const menusStore = useMenusStore()

const guestDataMenu = computed(() => {
  return menusStore.menus?.find(menu => menu.id === props.guestData.menuSelected)
})

const eventHasMenu = computed(() => menusStore.hasMenu)

const hasCompanions = computed(
  () => props.namedCompanions.length > 0 || props.unnamedCompanions > 0
)
</script>
