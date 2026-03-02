<template>
  <CHeading :level="4" weight="normal" color="text-red-600">Delete Account</CHeading>
  <section class="bg-white dark:bg-gray-900 shadow-card rounded-2xl p-6 space-y-6">
    <div class="grid md:grid-cols-4 gap-6">
      <!-- Main (3/4) -->
      <div class="md:col-span-3 space-y-6">
        <p class="text-sm text-gray-600 dark:text-gray-300">
          Once you delete your account, there is no going back. Please be certain.
        </p>

        <CInput
          id="currentPasswordDelete"
          v-model="form.currentPassword"
          type="password"
          label="Current Password"
          name="currentPasswordDelete"
          show-error
        />

        <div class="flex justify-end pt-4">
          <CButton type="button" color="red" :loading="saving" @click="onDeleteAccount">
            Permanently Delete Account
          </CButton>
        </div>
      </div>

      <!-- Help (1/4) -->
      <div class="md:col-span-1">
        <div
          class="bg-pink-50 dark:bg-gray-800 p-4 rounded-xl border border-pink-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300"
        >
          <p class="mb-2 font-medium">Before deleting your account</p>
          <ul class="list-disc list-inside space-y-1">
            <li>This action is irreversible.</li>
            <li>All data will be permanently removed.</li>
            <li>Make sure to back up any important information.</li>
            <li>Contact support if you need help recovering your account.</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive } from 'vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CInput from '@/components/UI/form2/CInput.vue'
import CHeading from '@/components/UI/headings/CHeading.vue'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { useUserStore } from '@/stores/useUserStore'

const saving = ref(false)
const form = reactive({ currentPassword: '' })

const notifications = useNotificationStore()
const userStore = useUserStore()

const onDeleteAccount = async () => {
  try {
    saving.value = true

    const response = await userStore.deleteAccount(form.currentPassword)

    if (response?.status === 200) {
      notifications.addNotification({
        type: 'success',
        message: 'Your account has been deleted.'
      })
    } else {
      notifications.addNotification({
        type: 'error',
        message: 'Failed to delete account. Please check your password.'
      })
    }
  } catch (error) {
    notifications.addNotification({
      type: 'error',
      message: 'An error occurred. Please try again.'
    })
  } finally {
    saving.value = false
  }
}
</script>
