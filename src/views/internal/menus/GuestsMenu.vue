<script setup>
import CAlert from '@/components/UI/alerts/CAlert.vue'
import { computed, ref, watch } from 'vue'
import { useMenusStore } from '@/stores/useMenusStore'
import CPagination from '@/components/UI/pagination/CPagination.vue'
import CSelect from '@/components/UI/form2/CSelect.vue'
import { useUserStore } from '@/stores/useUserStore'

const menuStore = useMenusStore()
const userStore = useUserStore()
const loading = ref(false)
const currentPage = ref(1)

const perPageOptions = [
  { value: 5, label: '5' },
  { value: 10, label: '10' },
  { value: 20, label: '20' }
]

const totalPages = computed(() => {
  if (!menuStore?.guestsMenu?.length) {
    return 1
  }

  return Math.ceil(menuStore.guestsMenu.length / menuStore.perPage)
})

const loadGuestsMenu = async () => {
  loading.value = true
  await menuStore.loadGuestsMenu()
  loading.value = false
}

const exportMenu = async () => {
  try {
    const response = await menuStore.exportGuestsMenu()

    if (response.status === 200) {
      const blob = new Blob([response.data], { type: response.headers['content-type'] })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `guest-menus-${userStore.activeEvent}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
    } else {
      throw new Error('Failed to export data')
    }
  } catch (error) {
    console.error('Error exporting data:', error)
  } finally {
    loading.value = false
  }
}

watch(
  () => menuStore.pageSelected,
  async () => {
    await loadGuestsMenu()
  }
)

watch(
  () => menuStore.perPage,
  async () => {
    await loadGuestsMenu()
  }
)
</script>

<template>
  <section v-if="!menuStore?.guestsMenu?.length">
    <CAlert variant="info"> There is no guest menu selection yet in this event.! </CAlert>
  </section>
  <section v-else class="mx-auto bg-white dark:bg-gray-900 p-8 rounded-xl shadow-md space-y-8">
    <button
      class="px-4 py-2 rounded-xl bg-primary text-white hover:bg-pink-600 transition"
      @click="exportMenu"
    >
      Export All to XLSX
    </button>
    <table
      v-if="menuStore?.menus?.length"
      class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
    >
      <thead class="bg-gray-50 dark:bg-gray-800">
        <tr>
          <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
            Name
          </th>
          <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
            email
          </th>
          <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
            Starter
          </th>
          <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
            Main Course
          </th>
          <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
            Dessert
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
        <tr
          v-for="guest in menuStore.guestsMenu"
          :key="guest.id"
          class="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
            {{ guest.name }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
            {{ guest.email }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
            {{ guest.starterName }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            {{ guest.mainName }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            {{ guest.dessertName }}
          </td>
        </tr>
      </tbody>
    </table>
    <div class="pagination-section mt-4 flex items-center justify-between">
      <div>
        <CSelect
          id="per-page"
          v-model="menuStore.perPage"
          :options="perPageOptions"
          name="perPage"
        />
      </div>
      <div>
        <CPagination
          :total-pages="totalPages"
          :current-page="menuStore.pageSelected"
          @update:current-page="currentPage = $event"
        />
      </div>
    </div>
  </section>
</template>
