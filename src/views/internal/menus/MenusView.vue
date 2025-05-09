<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <CHeading :level="2" weight="semibold">Event Menus</CHeading>
      <CButton
        variant="primary"
        @click="createMenu"
        v-if="!menuStore.menu"
      >+ Add Menu</CButton>
    </div>

    <section
      v-if="menuStore.menu"
      class="mx-auto bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-md space-y-8"
    >
      <div class="menu-title text-center text-gray-900">
        <CHeading :level="3" weight="semibold">
          {{ menuStore.menu?.title ?? '' }}
        </CHeading>
        <CHeading :level="6" weight="normal">
          {{ menuStore.menu?.description ?? '' }}
        </CHeading>

        <div class="mt-4 flex justify-center">
          <CButton @click="handleAddMenuItem" >
            Add Menu Item
          </CButton>
        </div>
      </div>

      <CLoading
        v-if="loading"
      />
      <div
        v-if="menu?.menu_items.length"
        class="space-y-6"
      >
        <div
          v-for="item in menu?.menu_items ?? []"
          :key="item.id"
          class="flex items-start gap-4 border-b border-gray-200 pb-4"
        >
          <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              {{ item.name }}
              <span
                v-if="item.diet_type"
                class="ml-2 text-sm text-green-600 dark:text-green-400 italic"
              >
              ({{ item.diet_type }})
            </span>
            </h3>
            <p class="text-gray-600 dark:text-gray-400 text-sm mt-1" v-if="item.notes">
              {{ item.notes }}
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
  <CAddMenuItemModal
    v-model="openItemForm"
    :menu="menuStore.menu"
    @close="openItemForm = false"
    @submitted="handleAddItem"
  />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CHeading from '@/components/UI/headings/CHeading.vue'
import CLoading from '@/components/UI/loading/CLoading.vue'
import CAlert from '@/components/UI/alerts/CAlert.vue'
import { useRouter } from 'vue-router'
import CConfirmModal from '@/components/UI/modals/CConfirmModal.vue'
import { useMenusStore } from '@/stores/useMenusStore'
import CAddMenuItemModal from '@/components/UI/modals/CAddMenuItemModal.vue'

const router = useRouter()
const menuStore = useMenusStore()
const openItemForm = ref(false)
const addingItem = ref(false)

const loading = ref()
const confirmDeleteModal = ref(false)

const loadMenus = async () => {
  loading.value = true
  await menuStore.loadMenu()
  loading.value = false
}

const handleAddMenuItem = () => {
  openItemForm.value = true
}

const handleAddItem = (item) => {
  try {
    addingItem.value = true

    const response = menuStore.addMenuItem({
      menuItem: item,
      menuId: menuStore.menu.id
    })

    console.log(response)

  } catch (err) {
    console.log(err)
  } finally {
    addingItem.value = false
    openItemForm.value = false
  }
}

const viewMenu = (menu) => {
  showDetailsModal.value = true
}

const createMenu = async () => {
  await router.push('/dashboard/menus/create')
}

const deleteMenu = async () => {

}

const confirmDelete = (menu) => {
  confirmDeleteModal.value = true
}

onMounted(loadMenus)
</script>

<style scoped>
/* Custom styles if needed */
</style>
