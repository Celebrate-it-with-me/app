<template>
  <transition name="modal">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
    >
      <div
        class="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700"
        >
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            <slot name="title">Modal Title</slot>
          </h3>
          <button
            v-if="showCloseIcon"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            @click="close"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Content -->
        <div class="px-6 py-4">
          <slot>Modal content goes here.</slot>
        </div>

        <!-- Footer -->
        <div
          v-if="showFooter"
          class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2"
        >
          <slot name="footer">
            <CButton variant="ghost" @click="close">Cancel</CButton>
            <CButton>Confirm</CButton>
          </slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { X } from 'lucide-vue-next'
import CButton from '@/components/UI/buttons/CButton.vue'

const props = defineProps({
  modelValue: Boolean,
  showCloseIcon: Boolean,
  showFooter: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])

function close() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.18s ease-out;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
