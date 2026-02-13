<template>
  <CModal v-model="showModal">
    <template #title> Guest Details </template>

    <div v-if="loadingGuestData" class="p-6 text-center">
      <CLoading :size="10" />
    </div>

    <div v-else class="flex flex-col max-h-[calc(85vh-120px)]">
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <!-- Main Information -->
        <section>
          <div class="flex items-center justify-between mb-4">
            <div>
              <h4 class="text-xl font-bold text-gray-900 dark:text-white">
                {{ guestData.name }}
              </h4>
              <div class="flex items-center gap-2 mt-1">
                <RsvpStatusBadge :status="guestData.rsvpStatus" />
                <span
                  v-if="guestData.companions_count > 0"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                >
                  <Users class="w-3 h-3" />
                  +{{ guestData.companions_count }}
                </span>
              </div>
            </div>
          </div>

          <div
            class="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl p-4"
          >
            <!-- Email row -->
            <div v-if="guestData.email" class="flex items-center justify-between group">
              <div class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                <div class="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                  <Mail class="w-4 h-4 text-purple-500" />
                </div>
                <span class="truncate max-w-[150px]" :title="guestData.email">{{
                  guestData.email
                }}</span>
              </div>
              <button
                class="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                title="Send email"
                @click="emailGuest"
              >
                <SendIcon class="w-4 h-4" />
              </button>
            </div>

            <!-- Phone row -->
            <div v-if="guestData.phone" class="flex items-center justify-between group">
              <div class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                <div class="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                  <Phone class="w-4 h-4 text-purple-500" />
                </div>
                <span>{{ guestData.phone }}</span>
              </div>
              <button
                class="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                title="Call guest"
                @click="callGuest"
              >
                <PhoneCall class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Status & Date info -->
          <div class="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 px-1">
            <div class="flex items-center gap-2 text-xs text-gray-500">
              <Clock class="w-3.5 h-3.5 text-gray-400" />
              <span v-if="guestData.rsvpStatus === 'pending'"> Awaiting confirmation </span>
              <span v-else-if="guestData.rsvpStatus === 'attending'"> Confirmed attendance </span>
              <span v-else-if="guestData.rsvpStatus === 'not-attending'">
                Declined attendance
              </span>
              <span v-else> Unknown status </span>
            </div>

            <div class="flex items-center gap-2 text-xs text-gray-500">
              <Calendar class="w-3.5 h-3.5 text-gray-400" />
              <span v-if="guestData.rsvpStatusDate">
                {{ guestData.rsvpStatusDate }}
              </span>
              <span v-else> Not yet responded </span>
            </div>
          </div>

          <!-- Revert Confirmation -->
          <div v-if="isCompleted" class="mt-4">
            <button
              :disabled="reverting"
              class="text-xs text-red-500 hover:text-red-600 font-medium inline-flex items-center gap-1.5 px-1 transition-colors"
              @click="revertConfirmation"
            >
              <CWMLoading v-if="reverting" size="w-3 h-3" />
              <span>{{ reverting ? 'Reverting...' : 'Revert Confirmation' }}</span>
            </button>
          </div>
        </section>

        <!-- Companions section (Collapsible) -->
        <section
          v-if="guestData.companions && guestData.companions.length > 0"
          class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
        >
          <button
            class="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            @click="isCompanionsExpanded = !isCompanionsExpanded"
          >
            <div class="flex items-center gap-2">
              <Users class="w-4 h-4 text-gray-500" />
              <h5 class="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Companions ({{ guestData.companions.length }})
              </h5>
            </div>
            <ChevronDown
              class="w-4 h-4 text-gray-400 transition-transform duration-200"
              :class="{ 'rotate-180': isCompanionsExpanded }"
            />
          </button>

          <div
            v-show="isCompanionsExpanded"
            class="p-2 space-y-1 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 max-h-48 overflow-y-auto"
          >
            <div
              v-for="companion in guestData.companions"
              :key="companion.id"
              class="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div class="flex items-center gap-3">
                <div class="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                <span class="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  {{ companion.name }}
                </span>
              </div>
              <RsvpStatusBadge :status="companion.rsvpStatus" compact />
            </div>
          </div>
        </section>

        <!-- Share Invitation Section -->
        <section v-if="!isCompleted" class="space-y-4">
          <div class="flex items-center gap-2 px-1">
            <SendIcon class="w-4 h-4 text-purple-500" />
            <h5 class="text-sm font-semibold text-gray-700 dark:text-gray-200">Share Invitation</h5>
          </div>

          <div
            class="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl p-4 space-y-4"
          >
            <!-- Invitation Link -->
            <div v-if="guestData.invitationUrl">
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Invitation Link
              </label>
              <div class="flex items-center gap-2">
                <div
                  class="flex-1 flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
                >
                  <LinkIcon class="w-3.5 h-3.5 text-gray-400" />
                  <input
                    :value="truncatedUrl"
                    readonly
                    class="flex-1 text-xs bg-transparent border-none outline-none text-gray-600 dark:text-gray-400"
                  />
                </div>
                <button
                  class="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                  title="Copy Link"
                  @click="copyLink"
                >
                  <Copy class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- QR Code -->
            <div
              v-if="guestData.invitationQR"
              class="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg shadow-sm"
            >
              <img
                :src="qrCodeDataUrl"
                alt="QR Code"
                class="w-14 h-14 border border-gray-100 dark:border-gray-700 rounded p-0.5"
              />
              <div class="flex flex-col">
                <span class="text-[10px] text-gray-500 mb-1">Scan to RSVP</span>
                <button
                  class="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                  @click="downloadQR"
                >
                  <Download class="w-3 h-3" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Interaction History -->
        <section v-if="guestData.rsvpLogs?.length" class="px-1">
          <p class="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
            Interaction History
          </p>
          <div
            class="relative pl-4 space-y-4 before:content-[''] before:absolute before:left-[3px] before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-200 dark:before:bg-gray-800"
          >
            <div v-for="log in guestData.rsvpLogs" :key="log.id" class="relative">
              <span
                class="absolute -left-[16.5px] top-1.5 w-2 h-2 rounded-full border-2 border-white dark:border-gray-900 bg-gray-300"
              ></span>
              <div class="text-xs">
                <p class="text-gray-700 dark:text-gray-300">{{ log.message }}</p>
                <p class="text-gray-400 mt-0.5">{{ log.created_at }}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end w-full">
        <!-- Send + Close on the right -->
        <div class="flex items-center gap-2 sm:gap-3">
          <button
            class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            @click="close"
          >
            Close
          </button>
        </div>
      </div>
    </template>
  </CModal>
</template>

<script setup>
import CModal from '@/components/UI/modals/CModal.vue'
import CLoading from '@/components/UI/loading/CLoading.vue'
import CWMLoading from '@/components/UI/loading/CWMLoading.vue'
import RsvpStatusBadge from '@/views/internal/rsvp/components/RsvpStatusBadge.vue'
import {
  Mail,
  Send as SendIcon,
  Phone,
  PhoneCall,
  Clock,
  Calendar,
  Users,
  Link as LinkIcon,
  Copy,
  Download,
  ChevronDown
} from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { useGuestsStore } from '@/stores/useGuestStore'
import { useRsvpStore } from '@/stores/useRsvpStore'

const emit = defineEmits(['close', 'resend', 'confirmationReverted', 'send'])
const props = defineProps({
  modelValue: Boolean,
  guest: { type: Object, required: true }
})

const showModal = ref(false)
const guestData = ref({})
const loadingGuestData = ref(true)
const guestStore = useGuestsStore()
const rsvpStore = useRsvpStore()
const reverting = ref(false)
const isCompanionsExpanded = ref(false)

onMounted(() => {
  showModal.value = props.modelValue
})

const close = () => emit('close', false)

const isCompleted = computed(() => {
  return props.guest?.rsvpStatus === 'attending' || props.guest?.rsvpStatus === 'not-attending'
})

// NEW: Truncate URL
const truncatedUrl = computed(() => {
  const url = guestData.value?.invitationUrl || ''
  return url.length > 45 ? url.substring(0, 42) + '...' : url
})

// NEW: QR Code Data URL
const qrCodeDataUrl = computed(() => {
  if (!guestData.value?.invitationQR) return ''
  return 'data:image/png;base64,' + guestData.value.invitationQR
})

// NEW: Email guest
const emailGuest = () => {
  if (guestData.value.email) {
    window.location.href = `mailto:${guestData.value.email}`
  }
}

// NEW: Call guest
const callGuest = () => {
  if (guestData.value.phone) {
    window.location.href = `tel:${guestData.value.phone}`
  }
}

// NEW: Copy link (enhance existing)
const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(guestData.value.invitationUrl)
    // In a real app, we'd show a toast here
  } catch {
    alert('Failed to copy the link.')
  }
}

// NEW: Download QR
const downloadQR = () => {
  if (!qrCodeDataUrl.value) return
  const link = document.createElement('a')
  link.href = qrCodeDataUrl.value
  link.download = `qr-${guestData.value.name.replace(/\s+/g, '-')}.png`
  link.click()
}


const loadGuestData = async () => {
  loadingGuestData.value = true
  const response = await guestStore.loadGuestData(props.guest.id)
  if (response.status === 200) {
    guestData.value = response.data?.data ?? {}
  } else {
    console.error('Failed to load guest data:', response)
  }
  loadingGuestData.value = false
}

const revertConfirmation = async () => {
  try {
    reverting.value = true
    const response = await rsvpStore.revertConfirmation({
      guestId: props.guest.id
    })

    if (response.status === 200) {
      emit('confirmationReverted', props.guest.id)
      await loadGuestData() // Refresh data after revert
    } else {
      console.error('Failed to revert confirmation:', response)
    }
  } catch (error) {
    console.error('Failed to revert confirmation:', error)
  } finally {
    reverting.value = false
  }
}

watch(showModal, newValue => {
  if (!newValue) emit('close', false)
})

watch(
  () => props.modelValue,
  async newValue => {
    showModal.value = newValue
    if (showModal.value) await loadGuestData()
  },
  { immediate: true }
)
</script>
