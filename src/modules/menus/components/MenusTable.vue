<script setup>
import CButton from '@/components/UI/buttons/CButton.vue'
import CAlert from '@/components/UI/alerts/CAlert.vue'
import CConfirmModal from '@/components/UI/modals/CConfirmModal.vue'
import { useMenusStore } from '@/modules/menus/stores/useMenusStore'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const menuStore = useMenusStore()
const loading = ref(false)
const showConfirmDeleteModal = ref(false)
const menuSelectedForDelete = ref(null)
const router = useRouter()

const confirmDeleteMenu = menu => {
  menuSelectedForDelete.value = menu
  showConfirmDeleteModal.value = true
}

const deleteMenu = async () => {
  try {
    const response = await menuStore.deleteMenu(menuSelectedForDelete.value.id)

    if (response.status >= 200 && response.status < 300) {
      await loadMenus()
    }
  } catch (err) {
    console.log(err)
  } finally {
    showConfirmDeleteModal.value = false
  }
}

const loadMenus = async () => {
  loading.value = true
  await menuStore.loadMenus()
  loading.value = false
}

const goToMenu = async menu => {
  await router.push(`/dashboard/menus/show/${menu.id}`)
}
</script>

<template>
  <section v-if="!menuStore.hasMenu">
    <CAlert
      variant="info"
      class="rounded-2xl border-0 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
    >
      There are no menus in this event yet. Start by adding one!
    </CAlert>
  </section>
  <section
    v-else
    class="overflow-hidden bg-white dark:bg-gray-900/50 backdrop-blur-sm rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl"
  >
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
        <thead class="bg-gray-50/50 dark:bg-gray-800/50">
          <tr>
            <th
              class="px-8 py-5 text-left text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest"
            >
              Menu Title
            </th>
            <th
              class="px-8 py-5 text-left text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest"
            >
              Description
            </th>
            <th
              class="px-8 py-5 text-center text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest"
            >
              Options
            </th>
            <th
              class="px-8 py-5 text-center text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest"
            >
              Status
            </th>
            <th
              class="px-8 py-5 text-right text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50 dark:divide-gray-800">
          <tr
            v-for="menu in menuStore.menus"
            :key="menu.id"
            class="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all cursor-pointer"
            @click="goToMenu(menu)"
          >
            <td class="px-8 py-6 whitespace-nowrap">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-xl bg-rose/10 flex items-center justify-center text-rose font-bold"
                >
                  {{ menu.title.charAt(0).toUpperCase() }}
                </div>
                <span
                  class="text-base font-bold text-gray-900 dark:text-white group-hover:text-rose transition-colors"
                >
                  {{ menu.title }}
                </span>
              </div>
            </td>
            <td class="px-8 py-6 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
              {{ menu.description || 'No description' }}
            </td>
            <td class="px-8 py-6 whitespace-nowrap">
              <div class="flex justify-center gap-2">
                <span
                  v-if="menu.allowMultipleChoices"
                  class="px-2 py-1 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-tighter"
                >
                  Multiple
                </span>
                <span
                  v-if="menu.allowCustomRequest"
                  class="px-2 py-1 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-tighter"
                >
                  Custom
                </span>
              </div>
            </td>
            <td class="px-8 py-6 whitespace-nowrap text-center">
              <span
                v-if="menu.isDefault"
                class="px-3 py-1 rounded-full bg-rose/10 text-rose text-[10px] font-black uppercase tracking-widest border border-rose/20"
              >
                Default
              </span>
              <span
                v-else
                class="text-[10px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest"
              >
                Optional
              </span>
            </td>
            <td class="px-8 py-6 whitespace-nowrap text-right" @click.stop>
              <div
                class="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <CButton
                  size="sm"
                  variant="secondary"
                  class="rounded-xl h-9 px-4 font-bold"
                  @click="goToMenu(menu)"
                >
                  Details
                </CButton>
                <CButton
                  size="sm"
                  variant="danger"
                  class="rounded-xl h-9 px-4 font-bold"
                  @click="confirmDeleteMenu(menu)"
                >
                  Delete
                </CButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <CConfirmModal
      v-model="showConfirmDeleteModal"
      title="Delete Menu"
      message="Are you sure you want to delete this menu? This action cannot be undone and will remove all associated menu items and guest selections."
      @confirm="deleteMenu()"
      @close="showConfirmDeleteModal = false"
    />
  </section>
</template>
