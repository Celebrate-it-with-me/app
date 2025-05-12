<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <CHeading :level="2" weight="semibold">Event Menus</CHeading>
      <CButton
        variant="primary"
        @click="createMenu"
      >+ Add Menu</CButton>
    </div>

    <section
      v-if="!menuStore.hasMenu"
    >
      <CAlert
        variant="info"
      >
        There is no menus in this event.!
      </CAlert>
    </section>
    <section
      v-else
      class="mx-auto bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-md space-y-8"
    >
      <table
        class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
        v-if="menuStore.menus.length"
      >
        <thead class="bg-gray-50 dark:bg-gray-800">
        <tr>
          <th
            class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            Title
          </th>
          <th
            class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            Description
          </th>
          <th
            class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            Multiple Choice
          </th>
          <th
            class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            Custom Request
          </th>
          <th
            class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            Is Default
          </th>
          <th
            class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            Actions
          </th>
        </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
        <tr
          v-for="menu in menuStore.menus"
          :key="menu.id"
          class="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
            {{ menu.title }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
            {{ menu.description }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
            {{ menu.allow_multiple_choices ? 'Yes' : 'No' }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            {{ menu.allow_custom_request  ? 'Yes' : 'No' }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            {{ menu.is_default ? 'Yes' : 'No' }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-left flex flex-start gap-2 text-sm">
            <CButton size="sm" variant="primary" @click="gotToMenu(menu)">Details</CButton>
            <CButton size="sm" variant="outline" @click="confirmDeleteMenu(menu)">Delete</CButton>
          </td>
        </tr>
        </tbody>
      </table>
    </section>
    <CConfirmModal
      v-model="showConfirmDeleteModal"
      title="Are you sure?"
      message="You are about to delete this menu. This action cannot be undone."
      @confirm="deleteMenu()"
      @close="showConfirmDeleteModal = false"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CHeading from '@/components/UI/headings/CHeading.vue'
import CLoading from '@/components/UI/loading/CLoading.vue'
import { useRouter } from 'vue-router'
import { useMenusStore } from '@/stores/useMenusStore'
import CAddMenuItemModal from '@/components/UI/modals/CAddMenuItemModal.vue'
import MenuItem from '@/views/internal/menus/MenuItem.vue'
import CAlert from '@/components/UI/alerts/CAlert.vue'
import CConfirmModal from '@/components/UI/modals/CConfirmModal.vue'

const router = useRouter()
const menuStore = useMenusStore()
const openItemForm = ref(false)
const addingItem = ref(false)

const loading = ref()
const showConfirmDeleteModal = ref(false)
const menuSelectedForDelete = ref(null)

const hasMenu = computed(() => {
  return menuStore.menu !== null
})




const loadMenus = async () => {
  loading.value = true
  await menuStore.loadMenus()
  loading.value = false
}

const handleAddMenuItem = () => {
  openItemForm.value = true
}

const confirmDeleteMenu = (menu) => {
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



const gotToMenu = async (menu) => {
  await router.push(`/dashboard/menus/show/${menu.id}`)
}

const handleAddItem = async (item) => {
  try {
    addingItem.value = true

    const response = await menuStore.addMenuItem({
      menuItem: item,
      menuId: menuStore.menu.id
    })

    if (response.status >= 200 && response.status < 300) {
      await menuStore.loadMenu()
    }

    console.log(response)

  } catch (err) {
    console.log(err)
  } finally {
    addingItem.value = false
    openItemForm.value = false
  }
}

const goToEditMenu = async () => {
  return await router.push(`/dashboard/menus/edit/${menuStore.menu.id}`)
}

const createMenu = async () => {
  await router.push('/dashboard/menus/create')
}

onMounted(loadMenus)
</script>

<style scoped>
/* Custom styles if needed */
</style>
