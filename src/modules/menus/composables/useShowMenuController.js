import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/ui'
import { useMenusStore } from '@/modules/menus/stores/useMenusStore'
import { fieldErrors, groupMenuItems } from '@/modules/menus/utils/menus'

export function useShowMenuController() {
  const menuStore = useMenusStore()
  const { t } = useI18n()
  const toast = useToast()
  const loading = ref(true)
  const route = useRoute()
  const router = useRouter()
  const openItemForm = ref(false)
  const addingItem = ref(false)
  const itemErrors = ref({})

  onMounted(async () => {
    try {
      await menuStore.loadMenus()
      if (route.params.id) await menuStore.setCurrentMenu(route.params.id)
    } catch {
      toast.error(t('app.menus.loadError'))
    } finally {
      loading.value = false
    }
  })

  const menuSelected = computed(() => menuStore.currentMenu)
  const itemGroups = computed(() => groupMenuItems(menuStore.currentMenu))
  const itemCount = computed(() => menuStore.currentMenu?.menu_items?.length ?? 0)

  const addNewMenu = async () => {
    await router.push('/dashboard/menus/create')
  }

  const handleAddMenuItem = () => {
    itemErrors.value = {}
    openItemForm.value = true
  }

  const goToEditMenu = async () => {
    return await router.push(`/dashboard/menus/edit/${menuStore.currentMenu.id}`)
  }

  const handleAddItem = async item => {
    addingItem.value = true
    itemErrors.value = {}
    try {
      const response = await menuStore.addMenuItem({
        menuItem: item,
        menuId: menuStore.currentMenu.id
      })

      if (response.status >= 200 && response.status < 300) {
        const id = menuStore.currentMenu.id
        await menuStore.loadMenus()
        await menuStore.setCurrentMenu(id)
        toast.success(t('app.menus.itemAdded'))
        openItemForm.value = false
      }
    } catch (e) {
      const fields = e?.response?.status === 422 ? fieldErrors(e) : {}
      if (Object.keys(fields).length) {
        itemErrors.value = fields
      } else {
        toast.error(t('app.menus.itemAddError'))
      }
    } finally {
      addingItem.value = false
    }
  }

  return {
    menuStore,
    loading,
    openItemForm,
    addingItem,
    itemErrors,
    itemGroups,
    itemCount,
    addNewMenu,
    menuSelected,
    handleAddMenuItem,
    goToEditMenu,
    handleAddItem
  }
}
