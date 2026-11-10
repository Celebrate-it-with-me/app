<template>
  <CHeading :level="4" weight="normal" color="text-red-600">Transfer Account Ownership</CHeading>
  <section class="bg-white dark:bg-gray-900 shadow-card rounded-2xl p-6 space-y-6">
    <div class="grid md:grid-cols-4 gap-6">
      <!-- Main (3/4) -->
      <div class="md:col-span-3 space-y-6">
        <p class="text-sm text-gray-600 dark:text-gray-300">
          Transferring account ownership will give another user full control of your account. You
          will lose access unless granted again by the new owner.
        </p>

        <CInput
          id="transferEmail"
          v-model="form.email"
          type="email"
          label="Recipient's Email Address"
          name="transferEmail"
          show-error
        />

        <CInput
          id="currentPasswordTransfer"
          v-model="form.currentPassword"
          type="password"
          label="Your Current Password"
          name="currentPasswordTransfer"
          show-error
        />

        <div class="flex justify-end pt-4">
          <CButton type="button" color="red" :loading="saving" @click="onTransferOwnership">
            Transfer Ownership
          </CButton>
        </div>
      </div>

      <!-- Help (1/4) -->
      <div class="md:col-span-1">
        <div
          class="bg-pink-50 dark:bg-gray-800 p-4 rounded-xl border border-pink-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300"
        >
          <p class="mb-2 font-medium">Important Notes</p>
          <ul class="list-disc list-inside space-y-1">
            <li>This action is irreversible.</li>
            <li>Only transfer to someone you trust.</li>
            <li>You will lose admin rights immediately.</li>
            <li>New owner must accept the transfer via email.</li>
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
const form = reactive({ email: '', currentPassword: '' })

const notifications = useNotificationStore()
const userStore = useUserStore()

const onTransferOwnership = async () => {
  try {
    saving.value = true

    const response = await userStore.transferOwnership({
      email: form.email,
      current_password: form.currentPassword
    })

    if (response?.status === 200) {
      notifications.addNotification({
        type: 'success',
        message: 'Ownership transfer initiated. The recipient must confirm via email.'
      })
      form.email = ''
      form.currentPassword = ''
    } else {
      notifications.addNotification({
        type: 'error',
        message: 'Failed to transfer ownership. Please verify the email and your password.'
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
