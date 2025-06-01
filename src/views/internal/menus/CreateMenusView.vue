<script setup>
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import CInput from '@/components/UI/form2/CInput.vue'
import CTextarea from '@/components/UI/form2/CTextarea.vue'
import CToggle from '@/components/UI/form2/CToggle.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CCard from '@/components/UI/cards/CCard.vue'
import { onMounted, reactive, ref } from 'vue'
import { useMenusStore } from '@/stores/useMenusStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { useRoute, useRouter } from 'vue-router'
import CAlert from '@/components/UI/alerts/CAlert.vue'
import CConfirmModal from '@/components/UI/modals/CConfirmModal.vue'

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

onMounted(async () => {
  let id = route.params.id
  if (id) {
    mode.value = 'edit'
    await loadRouteMenu(id)
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
    menuStore.showDeleteMenuModal = false
  }
}
</script>

<template>
  <CCard>
    <form class="space-y-6" @submit.prevent="onSubmit">
      <div class="grid grid-cols-1 md:grid-cols-1 gap-6">
        <CInput
          id="menu_title"
          v-model="menuState.title"
          name="title"
          label="Menu Title"
          placeholder="e.g. Reception Dinner"
        />
      </div>

      <CTextarea
        id="menu_description"
        v-model="menuState.description"
        name="description"
        label="Menu Description"
        placeholder="Optional description for this menu..."
      />

      <CToggle
        v-model="menuState.allow_custom_request"
        name="allow_custom_request"
        label="Allow Custom Requests"
      />

      <CToggle
        v-model="menuState.allow_multiple_choices"
        name="allow_multiple_choices"
        label="Allow Multiple Choices"
      />

      <CToggle v-model="menuState.main_menu" name="main_menu" label="Is Main Menu" />

      <div class="pt-4 flex justify-end">
        <CButton type="submit" label="Create Menu">
          <span v-if="mode === 'create'"> Create Menu </span>
          <span v-if="mode === 'edit'"> Update Menu </span>
        </CButton>
      </div>
    </form>
  </CCard>

  <CCard v-if="mode === 'edit'" class="mt-4">
    <CAlert variant="warning">
      <div class="flex justify-between items-center">
        <span> Delete action is irreversible!, please be careful. </span>
        <CButton variant="danger" @click="showDeleteMenuModal = true"> Delete Menu </CButton>
      </div>
    </CAlert>
  </CCard>
  <CConfirmModal
    v-model="showDeleteMenuModal"
    :message="'Are you sure you want to delete this menu?'"
    show-close-icon
    show-footer
    @confirm="handleDeleteMenu"
  />
</template>
