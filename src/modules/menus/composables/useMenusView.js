import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMenusStore } from '@/modules/menus/stores/useMenusStore'

export function useMenusView() {
  const router = useRouter()
  const menuStore = useMenusStore()
  const loading = ref(false)
  const menusTableRef = ref(null)
  const guestsMenuRef = ref(null)

  const guestMenuCount = computed(() => {
    return menuStore.guestsMenu?.length || 0
  })

  const createMenu = async () => {
    await router.push('/dashboard/menus/create')
  }

  const setLoading = isLoading => {
    loading.value = isLoading
  }

  const loadData = async () => {
    loading.value = true
    try {
      await menuStore.loadMenus()
      await menuStore.loadGuestsMenu()
    } catch (error) {
      console.error('Error loading menu data:', error)
    } finally {
      loading.value = false
    }
  }

  onMounted(async () => {
    await loadData()
  })

  return {
    loading,
    menusTableRef,
    guestsMenuRef,
    guestMenuCount,
    createMenu,
    setLoading,
    loadData
  }
}
