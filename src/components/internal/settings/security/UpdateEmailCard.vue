<template>
  <CHeading :level="4" weight="normal">Update Email Address</CHeading>
  <section class="bg-white dark:bg-gray-900 shadow-card rounded-2xl p-6 space-y-6">

    <div class="grid md:grid-cols-4 gap-6">
      <!-- Form (3/4) -->
      <div class="md:col-span-3 space-y-6">
        <Form
          :validation-schema="schema"
          @submit="onSubmit"
          @invalid-submit="onInvalidSubmit"
        >
          <div class="space-y-6">
            <CInput
              type="email"
              label="New Email Address"
              name="newEmail"
              show-error
              v-model="form.newEmail"
              id="newEmail"
            />

            <CInput
              type="password"
              label="Confirm with Password"
              name="currentPassword"
              show-error
              v-model="form.currentPassword"
              id="currentPassword"
            />

            <div class="flex justify-end pt-4">
              <CButton type="submit" :loading="saving">Update Email</CButton>
            </div>
          </div>
        </Form>
      </div>

      <!-- Help Box (1/4) -->
      <div class="md:col-span-1">
        <div class="bg-pink-50 dark:bg-gray-800 p-4 rounded-xl border border-pink-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300">
          <p class="mb-2 font-medium">How to update your email</p>
          <ul class="list-disc list-inside space-y-1">
            <li>Enter your new email address carefully.</li>
            <li>You must confirm the change with your current password.</li>
            <li>You may need to verify the new email via confirmation link.</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import * as zod from 'zod'
import { Form } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import CInput from '@/components/UI/form2/CInput.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CHeading from '@/components/UI/headings/CHeading.vue'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { useUserStore } from '@/stores/useUserStore'

const saving = ref(false)
const notifications = useNotificationStore()
const userStore = useUserStore()

const form = reactive({
  newEmail: '',
  currentPassword: '',
})

const schema = toTypedSchema(
  zod.object({
    newEmail: zod.string().email('Please enter a valid email.'),
    currentPassword: zod.string().min(6, 'Password is required.'),
  })
)

const onSubmit = async () => {
  try {
    saving.value = true

    const response = await userStore.updateEmail({
      email: form.newEmail,
      current_password: form.currentPassword,
    })

    if (response?.status === 200) {
      notifications.addNotification({
        type: 'success',
        message: 'Email address updated successfully.',
      })

      form.newEmail = ''
      form.currentPassword = ''
    } else {
      notifications.addNotification({
        type: 'error',
        message: 'Failed to update email. Please try again.',
      })
    }
  } catch (err) {
    notifications.addNotification({
      type: 'error',
      message: 'An error occurred while updating email.',
    })
  } finally {
    saving.value = false
  }
}

const onInvalidSubmit = (errors) => {
  console.warn('Form validation failed:', errors)
}
</script>
