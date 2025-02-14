<script setup>
import { FwbModal } from 'flowbite-vue'

const emit = defineEmits(['close'])
defineProps({
  showModal: {
    type: Boolean,
    default: false
  }
})

const closeModal = () => {
  emit('close')
}
</script>

<template>
  <fwb-modal v-if="showModal" @close="closeModal" class="light">
    <template #header>
      <slot name="header">
        <div class="flex items-center text-lg text-gray-500 dark:text-gray-400">
          Terms of Service
        </div>
      </slot>
    </template>

    <template #body>
      <slot name="body">
        <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
          With less than a month to go before the European Union enacts new consumer privacy laws for its citizens,
          companies around the world are updating their terms of service agreements to comply.
        </p>
      </slot>

    </template>
    <template #footer>
      <slot name="footer">
        <div class="flex justify-between">

        </div>
      </slot>
    </template>
  </fwb-modal>
</template>
