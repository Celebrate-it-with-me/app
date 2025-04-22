<template>
  <CHeading :level="4" weight="normal">Change Password</CHeading>
  <section class="bg-white dark:bg-gray-900 shadow-card rounded-2xl p-6 space-y-6">

    <div class="grid md:grid-cols-4 gap-6">
      <div class="md:col-span-3 space-y-6">
        <Form :validation-schema="schema" v-slot="{ handleSubmit, resetForm }">
          <form @submit.prevent="handleSubmit((values) => onSubmit(values, resetForm))">
            <div class="space-y-6">
              <CInput
                type="password"
                label="Current Password"
                name="currentPassword"
                show-error
                id="currentPasswordInPassword"
              />

              <CInput
                type="password"
                label="New Password"
                name="newPassword"
                show-error
                id="newPassword"
              />

              <CInput
                type="password"
                label="Confirm New Password"
                name="confirmPassword"
                show-error
                id="confirmPassword"
              />

              <div class="flex justify-end pt-4">
                <CButton
                  type="submit"
                  :loading="saving"
                >Update Password</CButton>
              </div>
            </div>
          </form>
        </Form>
      </div>

      <!-- Help (1/4) -->
      <div class="md:col-span-1">
        <div class="bg-pink-50 dark:bg-gray-800 p-4 rounded-xl border border-pink-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300">
          <p class="mb-2 font-medium">How to change your password</p>
          <ul class="list-disc list-inside space-y-1">
            <li>Your new password must be at least 8 characters long.</li>
            <li>Make sure it is different from your current one.</li>
            <li>Use a mix of letters, numbers, and symbols for security.</li>
            <li>Confirm the new password exactly.</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>


<script setup>
import { reactive, ref } from 'vue'
import * as zod from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import CInput from '@/components/UI/form2/CInput.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CHeading from '@/components/UI/headings/CHeading.vue'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { useUserStore } from '@/stores/useUserStore'
import { useForm } from 'vee-validate'
import { Form } from 'vee-validate'

const saving = ref(false)
const userStore = useUserStore()
const notifications = useNotificationStore()

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const schema = toTypedSchema(
  zod.object({
    currentPassword: zod.string().min(6, 'Current password is required'),
    newPassword: zod.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: zod.string().min(8, 'Please confirm your new password'),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
)

const onSubmit = async (values, resetForm) => {
  console.log('click on submit')
  try {
    saving.value = true

    const response = await userStore.changeUserPassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
      newPasswordConfirmation: values.confirmPassword,
    })

    if (response?.status === 200) {
      notifications.addNotification({
        type: 'success',
        message: 'Password updated successfully',
      })
    } else {
      notifications.addNotification({
        type: 'error',
        message: 'Failed to update password. Please try again.',
      })
    }

    resetForm()
  } catch (err) {
    console.log(err)
    notifications.addNotification({
      type: 'error',
      message: 'An error occurred while updating password.',
    })
  } finally {
    saving.value = false
  }
}
</script>
