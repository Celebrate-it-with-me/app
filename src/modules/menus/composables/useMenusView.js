import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/ui'
import { useMenusStore } from '@/modules/menus/stores/useMenusStore'

export function useMenusView() {
  const router = useRouter()
  const { t } = useI18n()
  const toast = useToast()
  const menuStore = useMenusStore()
  const loading = ref(true)

  const guestMenuCount = computed(() => menuStore.guestsMeta?.total ?? menuStore.guestsMenu?.length ?? 0)

  const createMenu = async () => {
    await router.push('/dashboard/menus/create')
  }

  const loadData = async () => {
    loading.value = true
    try {
      await Promise.all([menuStore.loadMenus(), menuStore.loadGuestsMenu()])
    } catch {
      toast.error(t('app.menus.loadError'))
    } finally {
      loading.value = false
    }
  }

  onMounted(loadData)

  return { loading, guestMenuCount, createMenu, loadData }
}
