<script setup>
import CAlert from '@/components/UI/alerts/CAlert.vue'
import { computed, ref, watch } from 'vue'
import { useMenusStore } from '@/modules/menus/stores/useMenusStore'
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
    <CAlert
      variant="info"
      class="rounded-2xl border-0 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
    >
      No guest selections yet. Once guests confirm their attendance, their menu choices will appear
      here.
    </CAlert>
  </section>
  <section v-else class="space-y-6">
    <div class="flex justify-end">
      <button
        class="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:scale-105 active:scale-95 transition-all shadow-lg"
        @click="exportMenu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
        Export XLSX
      </button>
    </div>

    <div
      class="overflow-hidden bg-white dark:bg-gray-900/50 backdrop-blur-sm rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl"
    >
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
          <thead class="bg-gray-50/50 dark:bg-gray-800/50">
            <tr>
              <th
                class="px-8 py-5 text-left text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest"
              >
                Guest
              </th>
              <th
                class="px-8 py-5 text-left text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest"
              >
                Starter
              </th>
              <th
                class="px-8 py-5 text-left text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest"
              >
                Main
              </th>
              <th
                class="px-8 py-5 text-left text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest"
              >
                Dessert
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 dark:divide-gray-800">
            <tr
              v-for="guest in menuStore.guestsMenu"
              :key="guest.id"
              class="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all"
            >
              <td class="px-8 py-6 whitespace-nowrap">
                <div class="flex flex-col">
                  <span class="text-base font-bold text-gray-900 dark:text-white">{{
                    guest.name
                  }}</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">{{ guest.email }}</span>
                </div>
              </td>
              <td class="px-8 py-6 whitespace-nowrap">
                <span
                  class="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ guest.starterName || '—' }}
                </span>
              </td>
              <td class="px-8 py-6 whitespace-nowrap">
                <span
                  class="px-3 py-1 rounded-lg bg-rose/5 text-sm font-medium text-rose-dark dark:text-rose"
                >
                  {{ guest.mainName || '—' }}
                </span>
              </td>
              <td class="px-8 py-6 whitespace-nowrap">
                <span
                  class="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ guest.dessertName || '—' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        class="p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30 flex flex-col sm:flex-row items-center justify-between gap-6"
      >
        <div class="flex items-center gap-4">
          <span class="text-sm font-bold text-gray-400 uppercase tracking-widest">Show</span>
          <CSelect
            id="per-page"
            v-model="menuStore.perPage"
            :options="perPageOptions"
            name="perPage"
            class="w-24"
          />
        </div>
        <CPagination
          :total-pages="totalPages"
          :current-page="menuStore.pageSelected"
          @update:current-page="currentPage = $event"
        />
      </div>
    </div>
  </section>
</template>
