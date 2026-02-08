<template>
  <CModal v-model="showModal" @close="close">
    <template #title>
      {{ isBulk ? `Send invitations to ${guests.length} guests` : 'Send Invitation' }}
    </template>

    <div class="flex flex-col max-h-[80vh]">
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <!-- Single Guest Mode -->
        <div v-if="!isBulk && singleGuest" class="space-y-4">
          <div class="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl p-4">
            <h4 class="text-lg font-bold text-gray-900 dark:text-white">
              {{ singleGuest.name }}
            </h4>
            <div class="mt-2 space-y-1">
              <div v-if="singleGuest.email" class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Mail class="w-4 h-4 text-purple-500" />
                <span>{{ singleGuest.email }}</span>
              </div>
              <div v-if="singleGuest.phone" class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Phone class="w-4 h-4 text-purple-500" />
                <span>{{ singleGuest.phone }}</span>
              </div>
            </div>
            <div class="flex items-center gap-2 mt-3">
              <RsvpStatusBadge :status="singleGuest.rsvpStatus" />
              <span v-if="singleGuest.invitations?.length" class="text-xs text-gray-500 italic">
                Invitation already sent {{ lastSentText }}
              </span>
            </div>
          </div>
        </div>

        <!-- Bulk Mode -->
        <div v-else-if="isBulk" class="space-y-3">
          <div class="max-h-48 overflow-y-auto border border-gray-100 dark:border-gray-700 rounded-xl divide-y divide-gray-100 dark:divide-gray-700">
            <div v-for="guest in guests" :key="guest.id" class="p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div class="flex flex-col">
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{ guest.name }}</span>
                <span class="text-xs text-gray-500">{{ guest.email || guest.phone }}</span>
              </div>
              <RsvpStatusBadge :status="guest.rsvpStatus" compact />
            </div>
          </div>
        </div>

        <!-- Delivery Method Selection -->
        <div class="space-y-3">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-200">Delivery Method</label>
          <div class="flex flex-wrap gap-4">
            <label v-for="method in ['email', 'sms', 'both']" :key="method" class="inline-flex items-center cursor-pointer group">
              <input
                type="radio"
                v-model="sendMethod"
                :value="method"
                class="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300"
              />
              <span class="ml-2 text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 capitalize">
                {{ method }}
              </span>
            </label>
          </div>
        </div>

        <!-- Confirmation Context/Warning -->
        <div v-if="contextMessage" class="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
          <p class="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-2">
            <Info class="w-4 h-4" />
            {{ contextMessage }}
          </p>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end w-full gap-3">
        <button
          @click="close"
          class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          @click="handleSend"
          :disabled="sending"
          class="px-4 py-2 text-sm font-medium bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors inline-flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CWMLoading v-if="sending" size="w-4 h-4" />
          <Mail v-if="!sending" class="w-4 h-4" />
          <span>{{ buttonText }}</span>
        </button>
      </div>
    </template>
  </CModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import CModal from '@/components/UI/modals/CModal.vue'
import RsvpStatusBadge from '@/views/internal/rsvp/components/RsvpStatusBadge.vue'
import CWMLoading from '@/components/UI/loading/CWMLoading.vue'
import { Mail, Phone, Info } from 'lucide-vue-next'

const props = defineProps({
  modelValue: Boolean,
  guests: {
    type: Array,
    default: () => []
  },
  sending: Boolean
})

const emit = defineEmits(['update:modelValue', 'send', 'close'])

const showModal = ref(false)
const sendMethod = ref('email')

watch(() => props.modelValue, (val) => {
  showModal.value = val
}, { immediate: true })

watch(showModal, (val) => {
  emit('update:modelValue', val)
  if (!val) emit('close')
})

const isBulk = computed(() => props.guests.length > 1)
const singleGuest = computed(() => isBulk.value ? null : props.guests[0])

const lastSentText = computed(() => {
  if (!singleGuest.value?.invitations?.length) return ''
  // In a real scenario, we might use dayjs or similar to format "2 days ago"
  // For now, we'll just use the date or a placeholder as seen in CRsvpDetailsModal
  return singleGuest.value.invitations[0].created_at
})

const contextMessage = computed(() => {
  if (isBulk.value) return null
  if (!singleGuest.value) return null

  if (singleGuest.value.rsvpStatus === 'pending') {
    return 'Guest has not responded yet.'
  }
  return null
})

const buttonText = computed(() => {
  if (isBulk.value) return 'Send Invitations'
  if (singleGuest.value?.invitations?.length > 0) return 'Resend Invitation'
  return 'Send Invitation'
})

const close = () => {
  showModal.value = false
}

const handleSend = () => {
  const channelValue = {
    email: sendMethod.value === 'email' || sendMethod.value === 'both',
    sms: sendMethod.value === 'sms' || sendMethod.value === 'both'
  }

  emit('send', {
    guests: props.guests,
    channel: channelValue,
    isResend: !isBulk.value && singleGuest.value?.invitations?.length > 0
  })
}
</script>
