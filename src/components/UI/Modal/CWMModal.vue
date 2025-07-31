<script setup>
import { FwbModal } from 'flowbite-vue'

const emit = defineEmits(['close'])
defineProps({
  showModal: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    required: false,
    default: 'lg',
    validator: val => {
      return (
        ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl'].indexOf(val) !== -1
      )
    }
  }
})

const closeModal = () => {
  emit('close')
}
</script>

<template>
  <fwb-modal v-if="showModal" :size="size" class="light" @close="closeModal">
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
          With less than a month to go before the European Union enacts new consumer privacy laws
          for its citizens, companies around the world are updating their terms of service
          agreements to comply.
        </p>
      </slot>
    </template>
    <template #footer>
      <slot name="footer">
        <div class="flex justify-between"></div>
      </slot>
    </template>
  </fwb-modal>
</template>
