<template>
  <CHeading :level="4" weight="normal">Two-Factor Authentication (2FA)</CHeading>
  <section class="bg-white dark:bg-gray-900 shadow-card rounded-2xl p-6">
    <div class="grid md:grid-cols-4 gap-6">
      <div class="md:col-span-3 space-y-6">
        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Add an extra layer of security to your account.
          </p>
          <div class="flex items-center justify-end">
            <CToggle
              v-model="enabled"
              name="enabled"
            />
          </div>
        </div>

        <div v-if="enabled && setupDone && !verified" class="space-y-4">
          <p class="text-sm text-gray-700 dark:text-gray-300">
            Scan this QR code using an authenticator app like Google Authenticator or Authy.
          </p>

          <div class="flex justify-center">
            <div class="w-40 h-40 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
              <img v-if="qrImage" :src="qrImage" alt="Auth QR Code" class="w-full h-full object-cover rounded-lg" />
              <span v-else>Loading QR Code...</span>
            </div>
          </div>

          <CInput
            label="Enter 6-digit code from your app"
            name="authCode"
            v-model="authCode"
            maxlength="6"
            placeholder="123456"
            id="auth_code"
          />

          <div class="flex justify-end">
            <CButton
              :loading="saving"
              @click="verify2FA"
            >Verify & Enable</CButton>
          </div>
        </div>

        <!-- Already enabled -->
        <div v-else-if="enabled && setupDone && verified" class="space-y-4">
          <p class="text-sm text-gray-700 dark:text-gray-300">
            Two-Factor Authentication is <strong class="text-green-600 dark:text-green-400">enabled</strong>.
          </p>

          <div class="flex gap-3">
            <CButton
              variant="primary"
              @click="handleBackupCodes"
            >
              View Backup Codes
            </CButton>
            <CButton variant="outline" :loading="saving" @click="disable2FA">Disable 2FA</CButton>
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

      <TwoFABackupCodesModal
        :codes="backupCodes"
        v-model="showBackupCodes"
      />
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import CInput from '@/components/UI/form2/CInput.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CToggle from '@/components/UI/form2/CToggle.vue'
import CHeading from '@/components/UI/headings/CHeading.vue'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { useUserStore } from '@/stores/useUserStore'
import TwoFABackupCodesModal from '@/components/UI/modals/TwoFABackupCodesModal.vue'

const enabled = ref(false)
const authCode = ref('')
const saving = ref(false)
const sending = ref(false)
const setupDone = ref(false)
const verified = ref(false)
const loadingStatus = ref(true)
const qrImage = ref('')
const showBackupCodes = ref(false)
const loadingBackupCodes = ref(false)
const backupCodes = ref([])


const userStore = useUserStore()
const notifications = useNotificationStore()

onMounted(async() => {
  await getTwoFactorStatus()
})

const getTwoFactorStatus = async () => {
  try {
    const response = await userStore.get2FAStatus()

    if (response.status === 200) {
      const result = response.data ?? {}
      enabled.value = result?.enabled
      setupDone.value = result?.setupDone
      verified.value = result?.verified
    } else {
      notifications.addNotification({
        type: 'error',
        message: 'Failed to fetch 2FA status. Please try again.',
      })
    }

  } catch(error) {
    console.log(error)
  } finally {
    loadingStatus.value = false
  }
}

const verify2FA = async () => {
  try {
    saving.value = true

    if (!authCode.value) {
      notifications.addNotification({
        type: 'error',
        message: 'Please enter the 2FA code.',
      })
      return
    }

    const response = await userStore.verifyAndEnable2FA(authCode.value)

    if (response?.status !== 200) {
      notifications.addNotification({
        type: 'error',
        message: 'Failed to enable 2FA. Please try again.',
      })
      return
    }

    verified.value = true
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

const handleBackupCodes = async () => {
  try {
    loadingBackupCodes.value = true

    const response = await userStore.getBackupCodes()

    if (response?.status === 200) {
      const result = response.data ?? {}
      backupCodes.value = result?.codes
      showBackupCodes.value = true
    } else {
      notifications.addNotification({
        type: 'error',
        message: 'Failed to fetch backup codes. Please try again.',
      })
    }

  } catch (err) {
    console.log(err)
    notifications.addNotification({
      type: 'error',
      message: 'Failed to fetch backup codes. Please try again.',
    })
  } finally {
    loadingBackupCodes.value = false
  }
}

const toggleEnabled = async () => {
  if (enabled.value) {
    await setup2FA()
  }
}

const setup2FA = async () => {
  try {
    sending.value = true
    const response = await userStore.setup2FA()

    if (response?.status === 200) {
      setupDone.value = true

      const result = response.data ?? {}
      qrImage.value = `data:image/png;base64,${result?.qr_code}`

      notifications.addNotification({
        type: 'success',
        message: 'Two-Factor Authentication enabled.',
      })
    } else {
      notifications.addNotification({
        type: 'error',
        message: 'Failed to enable 2FA. Please try again.',
      })
    }
  } catch (e) {
    console.log(e)
  } finally {
    sending.value = false
  }
}


watch(enabled, () => {
  toggleEnabled()
})

</script>
