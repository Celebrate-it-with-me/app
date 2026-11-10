<template>
  <CHeading :level="4" weight="normal">Log Out Other Sessions</CHeading>
  <section class="bg-white dark:bg-gray-900 shadow-card rounded-2xl p-6 space-y-6">
    <div class="grid md:grid-cols-4 gap-6">
      <!-- Main (3/4) -->
      <div class="md:col-span-3 space-y-6">
        <p class="text-sm text-gray-600 dark:text-gray-300">
          You may log out from all other browser sessions across your devices. Some recent sessions
          may take a few minutes to appear.
        </p>

        <CInput
          id="currentPasswordLogout"
          v-model="form.currentPassword"
          type="password"
          label="Current Password"
          name="currentPassword"
          show-error
        />

        <div class="flex justify-end pt-4">
          <CButton type="button" :loading="saving" @click="onLogoutOthers">
            Log Out Other Sessions
          </CButton>
        </div>
      </div>

      <!-- Help (1/4) -->
      <div class="md:col-span-1">
        <div
          class="bg-pink-50 dark:bg-gray-800 p-4 rounded-xl border border-pink-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300"
        >
          <p class="mb-2 font-medium">About this feature</p>
          <ul class="list-disc list-inside space-y-1">
            <li>Use this if you suspect your account is open on unknown devices.</li>
            <li>You will remain logged in on this device.</li>
            <li>This does not affect trusted devices with 2FA.</li>
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

const onLogoutOthers = async () => {
  try {
    saving.value = true

    const response = await userStore.logoutOtherSessions(form.currentPassword)

    if (response?.status === 200) {
      notifications.addNotification({
        type: 'success',
        message: 'All other sessions have been logged out.'
      })
      form.currentPassword = ''
    } else {
      notifications.addNotification({
        type: 'error',
        message: 'Failed to log out other sessions. Please check your password.'
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
