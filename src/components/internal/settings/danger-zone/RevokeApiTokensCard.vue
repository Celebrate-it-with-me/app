<template>
  <CHeading :level="4" weight="normal">Revoke API Tokens</CHeading>
  <section class="bg-white dark:bg-gray-900 shadow-card rounded-2xl p-6 space-y-6">

    <div class="grid md:grid-cols-4 gap-6">
      <!-- Main (3/4) -->
      <div class="md:col-span-3 space-y-6">
        <p class="text-sm text-gray-600 dark:text-gray-300">
          If you suspect your API tokens have been compromised or simply want to reset access, you can revoke all active tokens.
        </p>

        <div class="flex justify-end pt-4">
          <CButton type="button" color="red" :loading="revoking" @click="onRevokeTokens">
            Revoke All API Tokens
          </CButton>
        </div>
      </div>

      <!-- Help (1/4) -->
      <div class="md:col-span-1">
        <div class="bg-pink-50 dark:bg-gray-800 p-4 rounded-xl border border-pink-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300">
          <p class="mb-2 font-medium">What happens next?</p>
          <ul class="list-disc list-inside space-y-1">
            <li>All API keys currently in use will become invalid.</li>
            <li>Any integration depending on these tokens will stop working.</li>
            <li>You can regenerate new tokens from your developer settings.</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CHeading from '@/components/UI/headings/CHeading.vue'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { useUserStore } from '@/stores/useUserStore'

const revoking = ref(false)
const notifications = useNotificationStore()
const userStore = useUserStore()

const onRevokeTokens = async () => {
  try {
    revoking.value = true

    const response = await userStore.revokeApiTokens()

    if (response?.status === 200) {
      notifications.addNotification({
        type: 'success',
        message: 'All API tokens have been revoked.',
      })
    } else {
      notifications.addNotification({
        type: 'error',
        message: 'Failed to revoke tokens. Please try again.',
      })
    }
  } catch (error) {
    notifications.addNotification({
      type: 'error',
      message: 'An error occurred. Please try again.',
    })
  } finally {
    revoking.value = false
  }
}
</script>
