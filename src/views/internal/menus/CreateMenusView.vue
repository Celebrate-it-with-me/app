<script setup>
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import CInput from '@/components/UI/form2/CInput.vue'
import CTextarea from '@/components/UI/form2/CTextarea.vue'
import CToggle from '@/components/UI/form2/CToggle.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CCard from '@/components/UI/cards/CCard.vue'
import { ref } from 'vue'
import { useMenusStore } from '@/stores/useMenusStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { useRouter } from 'vue-router'

const sending = ref(false)
const menuStore = useMenusStore()
const notification = useNotificationStore()
const router = useRouter()

const schema = toTypedSchema(z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().optional(),
  allow_multiple_choices: z.boolean().default(false),
  allow_custom_request: z.boolean().default(false),
}))

const { handleSubmit, values, errors } = useForm({
  validationSchema: schema,
  initialValues: {
    title: '',
    description: '',
    allow_multiple_choices: false,
    allow_custom_request: false,
  },
})

const onSubmit = handleSubmit(async (formValues) => {
  console.log('Creating menu:', formValues)
  try {
    sending.value = true
    const response = await menuStore.createMenu(formValues)

    if (response.status >= 200 && response.status < 300) {
      notification.addNotification({
        type: 'success',
        message: 'Menu added Successfully'
      })

      await menuStore.loadMenu()

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
</script>

<template>
  <CCard>
    <form @submit.prevent="onSubmit" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-1 gap-6">
        <CInput
            name="title"
            label="Menu Title"
            placeholder="e.g. Reception Dinner"
            id="menu_title"
        />
      </div>

      <CTextarea
        name="description"
        label="Menu Description"
        placeholder="Optional description for this menu..."
        id="menu_description"
      />

      <CToggle
        name="allow_custom_request"
        label="Allow Custom Requests"
      />

      <CToggle
        name="allow_multiple_choices"
        label="Allow Multiple Choices"
      />

      <div class="pt-4 flex justify-end">
        <CButton type="submit" label="Create Menu" >
          Create Menu
        </CButton>
      </div>
    </form>
  </CCard>
</template>
