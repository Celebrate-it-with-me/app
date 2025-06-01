<template>
  <transition name="fade">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    >
      <div
        class="w-full max-w-md rounded-2xl shadow-xl bg-white dark:bg-gray-900 backdrop-blur-md border border-gray-200 dark:border-gray-700 text-text"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700"
        >
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ title }}
          </h3>
          <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" @click="close">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Content -->
        <div class="px-6 py-4 text-sm text-gray-700 dark:text-gray-200">
          <p>{{ message }}</p>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
          <CButton variant="outline" @click="close">Cancel</CButton>
          <CButton variant="primary" @click="confirm">Confirm</CButton>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { X } from 'lucide-vue-next'
import CButton from '@/components/UI/buttons/CButton.vue'

defineProps({
  modelValue: Boolean,
  title: {
    type: String,
    default: 'Are you sure?'
  },
  message: {
    type: String,
    default: 'This action cannot be undone.'
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const close = () => {
  emit('update:modelValue', false)
}

const confirm = () => {
  emit('confirm')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
