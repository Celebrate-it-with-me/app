<script setup>
import CButton from '@/components/UI/buttons/CButton.vue'
import CCheckbox from '@/components/UI/form2/CCheckbox.vue'
import { UserIcon } from 'lucide-vue-next'
import RsvpGuestCompanionTr from '@/views/internal/rsvp/components/RsvpGuestCompanionTr.vue'
import { ref } from 'vue'

const showCompanionsList = ref(true)

const emit = defineEmits(['toggleGuestSelection', 'viewGuest'])
const props = defineProps({
  guest: {
    type: Object,
    required: true,
  },
  selectedGuests: {
    type: Array,
    required: true,
  },
})

const statusClass = (status) => {
  return {
    pending: 'text-yellow-600',
    attending: 'text-green-600',
    'not-attending': 'text-red-500',
  }[status] || 'text-gray-500'
}

const toggleGuestSelection = () => {
  const isSelected = props.selectedGuests.includes(props.guest.id)
  if (isSelected) {
    emit('toggleGuestSelection', props.guest.id, false)
  } else {
    emit('toggleGuestSelection', props.guest.id, true)
  }
}

const viewGuest = () => {
  emit('viewGuest', props.guest)
}

</script>

<template>
  <tr class="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
    <td class="px-3 py-2">
      <CCheckbox
        :id="`guest_${guest.id}`"
        :modelValue="selectedGuests.includes(guest.id)"
        @update:modelValue="val => toggleGuestSelection(guest.id, val)"
      />
    </td>
    <td class="px-3 py-2 text-sm font-medium text-gray-800 dark:text-white flex items-center gap-2">
      <UserIcon class="w-4 h-4 text-primary" /> {{ guest.name }}
      <span
        v-if="guest.companions?.length" class="ml-2 text-xs text-gray-500 cursor-pointer"
        v-tooltip="'Show guest companions'"
        @click="showCompanionsList = !showCompanionsList"
      >
        +{{ guest.companions.length }} companion(s)
      </span>
    </td>
    <td
      class="px-3 py-2 text-sm text-gray-600 dark:text-gray-400"

    >
      <span :class="statusClass(guest.rsvpStatus)">
        {{ guest.rsvpStatus || 'N/A' }}
      </span>
    </td>
    <td class="px-3 py-2 text-sm">
      <span :class="statusClass(guest.rsvpStatus)">
        {{ guest.rsvpStatusDate || 'N/A' }}
      </span>
    </td>
    <td class="px-3 py-2 text-right">
      <CButton
        size="sm"
        variant="outline"
        @click="viewGuest(guest)"
      >
        Details
      </CButton>
    </td>
  </tr>

  <template v-if="showCompanionsList">
    <RsvpGuestCompanionTr
      :companion="companion"
      v-for="companion in guest.companions"
      :key="`companion_${companion.id}`"
    />
  </template>
</template>

<style scoped>

</style>
