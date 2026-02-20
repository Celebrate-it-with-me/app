import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMenusStore } from '@/modules/menus/stores/useMenusStore'

export function useShowMenuController() {
  const menuStore = useMenusStore()
  const loading = ref(false)
  const route = useRoute()
  const router = useRouter()
  const openItemForm = ref(false)
  const addingItem = ref(false)

  onMounted(async () => {
    loading.value = true
    await menuStore.loadMenus()
    loading.value = false
    let menuId = route.params.id
    if (menuId) {
      await menuStore.setCurrentMenu(menuId)
    }
  })

  const starterMenuItems = computed(() => {
    if (!menuStore.currentMenu?.menu_items) {
      return []
    }

    return menuStore.currentMenu?.menu_items?.filter(item => {
      return item.type === 'starter'
    })
  })

  const mainMenuItems = computed(() => {
    if (!menuStore.currentMenu?.menu_items) {
      return []
    }

    return menuStore.currentMenu?.menu_items?.filter(item => {
      return item.type === 'main'
    })
  })

  const desertMenuItems = computed(() => {
    if (!menuStore.currentMenu?.menu_items) {
      return []
    }

    return menuStore.currentMenu?.menu_items?.filter(item => {
      return item.type === 'dessert'
    })
  })

  const addNewMenu = async () => {
    await router.push('/dashboard/menus/create')
  }

  const menuSelected = computed(() => {
    return menuStore.currentMenu
  })

  const handleAddMenuItem = () => {
    openItemForm.value = true
  }

  const goToEditMenu = async () => {
    return await router.push(`/dashboard/menus/edit/${menuStore.currentMenu.id}`)
  }

  const handleAddItem = async item => {
    try {
      addingItem.value = true

      const response = await menuStore.addMenuItem({
        menuItem: item,
        menuId: menuStore.currentMenu.id
      })

      if (response.status >= 200 && response.status < 300) {
        await menuStore.loadMenus()
        await menuStore.setCurrentMenu(menuStore.currentMenu.id)
      }

      console.log(response)
    } catch (err) {
      console.log(err)
    } finally {
      addingItem.value = false
      openItemForm.value = false
    }
  }

  return {
    menuStore,
    loading,
    openItemForm,
    addingItem,
    starterMenuItems,
    mainMenuItems,
    desertMenuItems,
    addNewMenu,
    menuSelected,
    handleAddMenuItem,
    goToEditMenu,
    handleAddItem
  }
}
