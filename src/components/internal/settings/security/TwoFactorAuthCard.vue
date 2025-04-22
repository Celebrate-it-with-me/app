<template>
  <CHeading :level="4" weight="normal">Two-Factor Authentication</CHeading>
  <section class="bg-white dark:bg-gray-900 shadow-card rounded-2xl p-6 space-y-6">
    <div class="grid md:grid-cols-4 gap-6">
      <!-- Main 3/4 -->
      <div class="md:col-span-3 space-y-6">
        <!-- Toggle -->
        <div class="flex items-center justify-between">
          <div>
            <p class="text-base font-medium text-gray-800 dark:text-gray-100">
              Two-Factor Authentication (2FA)
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Add an extra layer of security to your account.
            </p>
          </div>
          <CToggle v-model="enabled" @change="handleToggle" />
        </div>

        <!-- Setup 2FA -->
        <div v-if="enabled && !confirmed" class="space-y-4">
          <p class="text-sm text-gray-700 dark:text-gray-300">
            Scan this QR code using an authenticator app like Google Authenticator or Authy.
          </p>

          <div class="flex justify-center">
            <div class="w-40 h-40 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
              QR CODE
            </div>
          </div>

          <CInput
            label="Enter 6-digit code from your app"
            name="authCode"
            v-model="authCode"
            maxlength="6"
            placeholder="123456"
          />

          <div class="flex justify-end">
            <CButton :loading="saving" @click="verify2FA">Verify & Enable</CButton>
          </div>
        </div>

        <!-- Already enabled -->
        <div v-else-if="enabled && confirmed" class="space-y-4">
          <p class="text-sm text-gray-700 dark:text-gray-300">
            Two-Factor Authentication is <strong class="text-green-600 dark:text-green-400">enabled</strong>.
          </p>

          <div class="flex gap-3">
            <CButton variant="ghost" @click="showBackupCodes">View Backup Codes</CButton>
            <CButton variant="danger" :loading="saving" @click="disable2FA">Disable 2FA</CButton>
          </div>
        </div>
      </div>

      <!-- Help 1/4 -->
      <div class="md:col-span-1">
        <div class="bg-pink-50 dark:bg-gray-800 p-4 rounded-xl border border-pink-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300">
          <p class="mb-2 font-medium">Why enable 2FA?</p>
          <ul class="list-disc list-inside space-y-1">
            <li>Secures your account with an extra step.</li>
            <li>Prevents login even with a stolen password.</li>
            <li>Uses time-based codes from your phone.</li>
            <li>Store backup codes safely in case you lose access.</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import CInput from '@/components/UI/form2/CInput.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CToggle from '@/components/UI/form2/CToggle.vue'
import CHeading from '@/components/UI/headings/CHeading.vue'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { useUserStore } from '@/stores/useUserStore'

const enabled = ref(false)
const confirmed = ref(false)
const authCode = ref('')
const saving = ref(false)

const userStore = useUserStore()
const notifications = useNotificationStore()

const handleToggle = async () => {
  if (!enabled.value) {
    confirmed.value = false
    notifications.addNotification({
      type: 'info',
      message: '2FA will be disabled after confirmation.',
    })
  }
}

const verify2FA = async () => {
  try {
    saving.value = true
    // Call your backend to verify code and enable 2FA
    // await api.post('/user/2fa/enable', { code: authCode.value })
    confirmed.value = true
    authCode.value = ''
    notifications.addNotification({
      type: 'success',
      message: 'Two-Factor Authentication enabled.',
    })
  } catch (e) {
    notifications.addNotification({
      type: 'error',
      message: 'Invalid 2FA code. Please try again.',
    })
  } finally {
    saving.value = false
  }
}

const disable2FA = async () => {
  try {
    saving.value = true
    // await api.post('/user/2fa/disable')
    confirmed.value = false
    enabled.value = false
    notifications.addNotification({
      type: 'success',
      message: 'Two-Factor Authentication disabled.',
    })
  } catch (e) {
    notifications.addNotification({
      type: 'error',
      message: 'Could not disable 2FA. Try again later.',
    })
  } finally {
    saving.value = false
  }
}

const showBackupCodes = () => {
  // Maybe open a modal or show inline?
  notifications.addNotification({
    type: 'info',
    message: 'Feature coming soon: Backup codes modal.',
  })
}
</script>
