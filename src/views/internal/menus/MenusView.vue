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
      v-if="hasMenu"
      class="mx-auto bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-md space-y-8"
    >
      <div class="menu-title text-center text-gray-900">
        <CHeading :level="3" weight="semibold">
          {{ menuStore.menu?.title ?? '' }}
        </CHeading>
        <CHeading :level="6" weight="normal">
          {{ menuStore.menu?.description ?? '' }}
        </CHeading>

        <div class="mt-4 flex justify-center gap-x-2">
          <CButton @click="handleAddMenuItem" >
            Add Menu Item
          </CButton>

          <CButton
            @click="goToEditMenu"
            variant="secondary"
          >
            Details
          </CButton>

        </div>
      </div>

      <CLoading
        v-if="loading"
      />

      <div class="menu-sections" v-if="starterMenuItems.length">
        <h3 class="text-xl font-bold text-primary border-b-2 border-primary pb-1 mb-4 uppercase tracking-wide">
          Starters
        </h3>
        <div
          v-for="(item, index) in starterMenuItems"
          :key="index"
          class="mb-8"
        >
          <MenuItem :item="item" />
        </div>
      </div>

      <div class="menu-sections" v-if="mainMenuItems.length">
        <h3 class="text-xl font-bold text-primary border-b-2 border-primary pb-1 mb-4 uppercase tracking-wide">
          Main
        </h3>
        <div
          v-for="(item, index) in mainMenuItems"
          :key="index"
          class="mb-8"
        >
          <MenuItem :item="item" />
        </div>
      </div>

      <div class="menu-sections" v-if="desertMenuItems.length">
        <h3 class="text-xl font-bold text-primary border-b-2 border-primary pb-1 mb-4 uppercase tracking-wide">
          Dessert
        </h3>
        <div
          v-for="(item, index) in desertMenuItems"
          :key="index"
          class="mb-8"
        >
          <div class="space-y-4">
            <MenuItem :item="item" />
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
import { computed, onMounted, ref } from 'vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CHeading from '@/components/UI/headings/CHeading.vue'
import CLoading from '@/components/UI/loading/CLoading.vue'
import { useRouter } from 'vue-router'
import { useMenusStore } from '@/stores/useMenusStore'
import CAddMenuItemModal from '@/components/UI/modals/CAddMenuItemModal.vue'
import MenuItem from '@/views/internal/menus/MenuItem.vue'

const router = useRouter()
const menuStore = useMenusStore()
const openItemForm = ref(false)
const addingItem = ref(false)

const loading = ref()
const confirmDeleteModal = ref(false)

const hasMenu = computed(() => {
  return menuStore.menu !== null
})

const starterMenuItems = computed(() => {
  if (!menuStore.menu?.menu_items) {
    return []
  }

  return menuStore.menu?.menu_items?.filter((item) => {
    return item.type === 'starter'
  })
})

const mainMenuItems = computed(() => {
  if (!menuStore.menu?.menu_items) {
    return []
  }

  return menuStore.menu?.menu_items?.filter((item) => {
    return item.type === 'main'
  })
})

const desertMenuItems = computed(() => {
  if (!menuStore.menu?.menu_items) {
    return []
  }

  return menuStore.menu?.menu_items?.filter((item) => {
    return item.type === 'dessert'
  })
})

const loadMenus = async () => {
  loading.value = true
  await menuStore.loadMenu()
  loading.value = false
}

const handleAddMenuItem = () => {
  openItemForm.value = true
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
