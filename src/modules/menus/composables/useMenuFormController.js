import { onMounted, reactive, ref } from 'vue'
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useMenusStore } from '@/modules/menus/stores/useMenusStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { useRoute, useRouter } from 'vue-router'

export function useMenuFormController() {
  const sending = ref(false)
  const menuStore = useMenusStore()
  const notification = useNotificationStore()
  const router = useRouter()
  const route = useRoute()
  const mode = ref('create')
  const showDeleteMenuModal = ref(false)

  const menuState = reactive({
    title: '',
    description: '',
    allow_multiple_choices: false,
    allow_custom_request: false,
    main_menu: false
  })

  const schema = toTypedSchema(
    z.object({
      title: z.string().min(3, 'Title is required'),
      description: z.string().optional(),
      allow_multiple_choices: z.boolean().default(false),
      allow_custom_request: z.boolean().default(false),
      main_menu: z.boolean().default(false)
    })
  )

  const { handleSubmit, values, errors } = useForm({
    validationSchema: schema,
    initialValues: {
      title: '',
      description: '',
      allow_multiple_choices: false,
      allow_custom_request: false,
      main_menu: false
    }
  })

  const loadRouteMenu = async menuId => {
    try {
      const result = await menuStore.loadRouteMenu(menuId)

      if (result) {
        menuState.title = menuStore.menu?.title ?? ''
        menuState.description = menuStore.menu?.description ?? ''
        menuState.allow_multiple_choices = !!menuStore.menu?.allow_multiple_choices ?? false
        menuState.allow_custom_request = !!menuStore.menu?.allow_custom_request ?? false
      } else {
        notification.addNotification({
          type: 'error',
          message: 'Oops, something went wrong!'
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      sending.value = false
    }
  }

  onMounted(async () => {
    let id = route.params.id
    if (id) {
      mode.value = 'edit'
      await loadRouteMenu(id)
    }
  })

  const handleRequest = async formValues => {
    const id = route.params.id

    if (mode.value === 'create') {
      return await menuStore.createMenu(formValues)
    }

    return await menuStore.updateMenu({
      ...formValues,
      id: id
    })
  }

  const onSubmit = handleSubmit(async formValues => {
    try {
      sending.value = true
      const response = await handleRequest(formValues)

      if (response.status >= 200 && response.status < 300) {
        notification.addNotification({
          type: 'success',
          message: 'Menu processed successfully!'
        })

        await menuStore.loadMenus()

        await router.push('/dashboard/menus')
      } else {
        notification.addNotification({
          type: 'error',
          message: 'Oops, something went wrong!'
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      sending.value = false
    }
  })

  const handleDeleteMenu = async () => {
    try {
      await menuStore.deleteMenu(menuStore.menu?.id)
      notification.addNotification({
        type: 'success',
        message: 'Menu deleted successfully!'
      })
      await router.push('/dashboard/menus')
    } catch (e) {
      console.error(e)
    } finally {
      showDeleteMenuModal.value = false
    }
  }

  return {
    sending,
    mode,
    showDeleteMenuModal,
    menuState,
    onSubmit,
    handleDeleteMenu,
    errors
  }
}
