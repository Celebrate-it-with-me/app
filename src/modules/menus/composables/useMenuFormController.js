import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '@/ui'
import { useMenusStore } from '@/modules/menus/stores/useMenusStore'
import { fieldErrors, menuTitleError } from '@/modules/menus/utils/menus'

export function useMenuFormController() {
  const { t } = useI18n()
  const toast = useToast()
  const menuStore = useMenusStore()
  const router = useRouter()
  const route = useRoute()

  const sending = ref(false)
  const loading = ref(false)
  const deleting = ref(false)
  const showDeleteMenuModal = ref(false)
  const touched = ref(false)
  const serverErrors = ref({})

  const mode = computed(() => (route.params.id ? 'edit' : 'create'))

  const menuState = reactive({
    title: '',
    description: '',
    allow_multiple_choices: false,
    allow_custom_request: false,
    main_menu: false
  })

  const errors = computed(() => ({
    title: touched.value && menuTitleError(menuState.title) ? t(menuTitleError(menuState.title)) : serverErrors.value.title ?? '',
    description: serverErrors.value.description ?? ''
  }))

  const loadRouteMenu = async menuId => {
    loading.value = true
    try {
      const ok = await menuStore.loadRouteMenu(menuId)
      if (ok && menuStore.menu) {
        menuState.title = menuStore.menu.title ?? ''
        menuState.description = menuStore.menu.description ?? ''
        menuState.allow_multiple_choices = !!menuStore.menu.allow_multiple_choices
        menuState.allow_custom_request = !!menuStore.menu.allow_custom_request
        menuState.main_menu = !!menuStore.menu.is_default
      } else {
        toast.error(t('app.menus.loadError'))
      }
    } catch {
      toast.error(t('app.menus.loadError'))
    } finally {
      loading.value = false
    }
  }

  onMounted(async () => {
    if (route.params.id) await loadRouteMenu(route.params.id)
  })

  const onSubmit = async () => {
    touched.value = true
    serverErrors.value = {}
    if (menuTitleError(menuState.title)) return

    sending.value = true
    try {
      const payload = { ...menuState, title: menuState.title.trim() }
      const response =
        mode.value === 'create'
          ? await menuStore.createMenu(payload)
          : await menuStore.updateMenu({ ...payload, id: route.params.id })

      if (response.status >= 200 && response.status < 300) {
        toast.success(t('app.menus.saved'))
        await menuStore.loadMenus()
        await router.push('/dashboard/menus')
      } else {
        toast.error(t('app.menus.saveError'))
      }
    } catch (e) {
      const fields = fieldErrors(e)
      if (e?.response?.status === 422 && Object.keys(fields).length) {
        serverErrors.value = fields
      } else {
        toast.error(t('app.menus.saveError'))
      }
    } finally {
      sending.value = false
    }
  }

  const handleDeleteMenu = async () => {
    deleting.value = true
    try {
      await menuStore.deleteMenu(menuStore.menu?.id ?? route.params.id)
      toast.success(t('app.menus.deleted'))
      await router.push('/dashboard/menus')
    } catch {
      toast.error(t('app.menus.deleteError'))
    } finally {
      deleting.value = false
      showDeleteMenuModal.value = false
    }
  }

  return { sending, loading, deleting, mode, showDeleteMenuModal, menuState, errors, onSubmit, handleDeleteMenu }
}
