<template>
  <span
    class="px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1"
    :class="statusClasses"
  >
    <component :is="statusIcon" :size="compact ? 12 : 14" />
    <span v-if="!compact">{{ statusText }}</span>
    <span v-else>{{ compactText }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { CheckCircle, Clock, XCircle } from 'lucide-vue-next'

const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: value => ['attending', 'pending', 'not-attending'].includes(value)
  },
  compact: {
    type: Boolean,
    default: false
  }
})

const statusClasses = computed(() => {
  switch (props.status) {
    case 'attending':
      return 'bg-green-50 text-green-700 border border-green-200'
    case 'pending':
      return 'bg-yellow-50 text-yellow-700 border border-yellow-200'
    case 'not-attending':
      return 'bg-red-50 text-red-700 border border-red-200'
    default:
      return 'bg-gray-50 text-gray-700 border border-gray-200'
  }
})

const statusIcon = computed(() => {
  switch (props.status) {
    case 'attending':
      return CheckCircle
    case 'pending':
      return Clock
    case 'not-attending':
      return XCircle
    default:
      return Clock
  }
})

const statusText = computed(() => {
  switch (props.status) {
    case 'attending':
      return 'Attending'
    case 'pending':
      return 'Pending'
    case 'not-attending':
      return 'Not Attending'
    default:
      return props.status
  }
})

const compactText = computed(() => {
  switch (props.status) {
    case 'attending':
      return 'Yes'
    case 'pending':
      return 'Wait'
    case 'not-attending':
      return 'No'
    default:
      return ''
  }
})
</script>
