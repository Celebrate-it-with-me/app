<template>
  <transition name="fade">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 px-4"
    >
      <div
        class="w-full max-w-md rounded-xl shadow-xl overflow-hidden bg-white dark:bg-gray-900 text-text"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700"
        >
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Backup Codes</h3>
          <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" @click="close">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Content -->
        <div class="px-6 py-4 space-y-4">
          <p class="text-sm text-gray-700 dark:text-gray-300">
            Save these recovery codes in a safe place. Each code can be used once to access your
            account if you lose access to your authenticator app.
          </p>

          <div class="relative group">
            <!-- Tooltip floating box -->
            <div
              class="absolute top-0 right-0 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 px-3 py-1 rounded-md shadow transition-opacity duration-200 opacity-0 group-hover:opacity-100 flex items-center gap-1 cursor-pointer"
              @click="copyAllCodes"
            >
              <Copy class="w-4 h-4" />
              <span>Copy</span>
            </div>

            <!-- Codes Grid -->
            <ul class="grid grid-cols-2 gap-2 font-mono text-sm text-gray-800 dark:text-gray-100">
              <li
                v-for="(code, index) in codes"
                :key="index"
                class="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded text-center"
              >
                {{ code }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <CButton variant="primary" @click="close">Close</CButton>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { X, Copy } from 'lucide-vue-next'
import CButton from '@/components/UI/buttons/CButton.vue'
import { useNotificationStore } from '@/stores/useNotificationStore'

const notifications = useNotificationStore()

const props = defineProps({
  modelValue: Boolean,
  codes: {
    type: Array,
    required: true,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const close = () => {
  emit('update:modelValue', false)
}

const copyAllCodes = async () => {
  try {
    const joined = props.codes.join('\n')

    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(joined)
    } else {
      // Fallback para navegadores sin clipboard API
      const textarea = document.createElement('textarea')
      textarea.value = joined
      textarea.style.position = 'fixed'
      textarea.style.opacity = 0
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }

    notifications.addNotification({
      type: 'success',
      message: 'Backup codes copied to clipboard!'
    })
  } catch (e) {
    notifications.addNotification({
      type: 'error',
      message: 'Could not copy codes. Try manually.'
    })
    console.error('Clipboard copy error:', e)
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
