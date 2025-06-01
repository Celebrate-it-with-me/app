<template>
  <CModal v-model="showModal">
    <template #title> Guest Details </template>

    <div class="text-sm text-gray-700 dark:text-gray-200 space-y-6">
      <!-- General Info -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p class="font-medium text-gray-500 dark:text-gray-400">Name</p>
          <p>{{ guest.name }}</p>
        </div>
        <div>
          <p class="font-medium text-gray-500 dark:text-gray-400">RSVP Status</p>
          <p :class="rsvpClass">{{ guest.rsvpStatus }}</p>
        </div>
        <div>
          <p class="font-medium text-gray-500 dark:text-gray-400">Email</p>
          <p>{{ guest.email || 'N/A' }}</p>
        </div>
        <div>
          <p class="font-medium text-gray-500 dark:text-gray-400">Phone</p>
          <p>{{ guest.phone || 'N/A' }}</p>
        </div>
      </div>

      <!-- Preferences -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p class="font-medium text-gray-500 dark:text-gray-400">Meal Preference</p>
          <p>{{ guest.mealPreference || 'N/A' }}</p>
        </div>
        <div>
          <p class="font-medium text-gray-500 dark:text-gray-400">Allergies</p>
          <p>{{ guest.allergies || 'None' }}</p>
        </div>
      </div>

      <!-- Notes -->
      <div>
        <p class="font-medium text-gray-500 dark:text-gray-400">Notes</p>
        <p>{{ guest.notes || 'None' }}</p>
      </div>

      <!-- Companions -->
      <div v-if="guest.companions?.length">
        <p class="font-medium text-gray-500 dark:text-gray-400 text-lg">Companions</p>
        <ul class="list-disc list-inside space-y-1">
          <li v-for="companion in guest.companions" :key="companion.id">
            {{ companion.name }} ({{ companion.email || 'no email' }})
          </li>
        </ul>
      </div>
    </div>

    <template #footer>
      <CButton variant="outline" @click="close">Close</CButton>
    </template>
  </CModal>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import CModal from '@/components/UI/modals/CModal.vue'
import CButton from '@/components/UI/buttons/CButton.vue'

const emit = defineEmits(['close'])
const props = defineProps({
  show: Boolean,
  guest: {
    type: Object,
    required: true
  }
})

const showModal = ref(false)
const close = () => {
  emit('close')
}

onMounted(() => {
  showModal.value = props.show
})

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(props.guest.invitationUrl)
  } catch (e) {
    alert('Failed to copy link.')
  }
}

const rsvpClass = computed(() => {
  const status = props.guest.rsvpStatus
  return (
    {
      'text-yellow-600': status === 'pending',
      'text-green-600': status === 'confirmed',
      'text-red-600': status === 'declined'
    }[status] || 'text-gray-500'
  )
})

watch(showModal, value => {
  if (!value) {
    emit('close')
  }
})

watch(
  () => props.show,
  newVal => {
    showModal.value = newVal
  },
  {
    immediate: true
  }
)
</script>
