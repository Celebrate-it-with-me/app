<template>
  <transition name="fade">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
    >
      <div
        class="w-full max-w-md rounded-xl shadow-xl overflow-hidden bg-white dark:bg-gray-900 text-text"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Disable Two-Factor Authentication
          </h3>
          <button @click="close" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Content -->
        <div class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
          <p class="mb-2">
            Are you sure you want to disable Two-Factor Authentication?
          </p>
          <p class="text-red-500 font-medium">
            This will make your account less secure.
          </p>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
          <CButton variant="outline" @click="close">Cancel</CButton>
          <CButton variant="primary" :loading="loading" @click="disable2FA">Disable</CButton>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { X } from 'lucide-vue-next'
import CButton from '@/components/UI/buttons/CButton.vue'
import { ref } from 'vue'
import { useUserStore } from '@/stores/useUserStore'
import { useNotificationStore } from '@/stores/useNotificationStore'

defineProps({
  modelValue: Boolean,
})

const loading = ref(false)
const emit = defineEmits(['update:modelValue', 'disabled'])
const userStore = useUserStore()
const notifications = useNotificationStore()

const close = () => emit('update:modelValue', false)

const disable2FA = async () => {
  try {
    loading.value = true

    const response = await userStore.disable2FA()

    if (response?.status !== 200) {
      notifications.addNotification({
        type: 'error',
        message: 'Failed to disable 2FA. Please try again.',
      })
      return
    }

    notifications.addNotification({
      type: 'success',
      message: 'Two-Factor Authentication disabled.',
    })

    emit('disabled')

  } catch (e) {
    notifications.addNotification({
      type: 'error',
      message: 'Could not disable 2FA. Try again later.',
    })
  } finally {
    loading.value = false
  }
}

</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
