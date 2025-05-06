<script setup>
import { UserRoundIcon } from 'lucide-vue-next'

const props = defineProps({
  companion: {
    type: Object,
    required: true,
  }
})

const statusClass = (status) => {
  return {
    pending: 'text-yellow-600',
    attending: 'text-green-600',
    'not-attending': 'text-red-500',
  }[status] || 'text-gray-500'
}
</script>

<template>
  <tr
    class="bg-gray-50 dark:bg-gray-800"
  >
    <td class="px-3 py-2"></td>
    <td class="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 pl-8 flex items-center gap-2">
      <UserRoundIcon class="w-4 h-4 text-muted" />
      {{ companion.name || 'Unnamed' }}
    </td>
    <td class="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
      <span :class="statusClass(companion.rsvpStatus)">
        {{ companion.rsvpStatus || 'N/A' }}
      </span>
    </td>
    <td class="px-3 py-2 text-sm">
      <span :class="statusClass(companion.rsvpStatus)">
        {{ companion.rsvpStatusDate || 'N/A' }}
      </span>
    </td>
    <td class="px-3 py-2 text-right">
    </td>
  </tr>
</template>

<style scoped>

</style>
