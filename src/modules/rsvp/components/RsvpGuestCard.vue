<template>
  <!-- CHANGED: Improved card layout with better spacing and hover effects -->
  <div class="guest-card">
    <div class="guest-card-main" @click="isExpanded = !isExpanded">
      <div class="flex items-center gap-3">
        <div @click.stop>
          <CCheckbox
            :model-value="selected"
            @update:model-value="$emit('toggle-select', guest.id)"
          />
        </div>

        <div class="flex items-center gap-2">
          <ChevronDown v-if="isExpanded" class="w-5 h-5 text-purple-600" />
          <ChevronRight v-else class="w-5 h-5 text-purple-600" />
        </div>

        <div class="flex-1">
          <!-- Row 1: Main info -->
          <div class="flex items-center gap-3">
            <h3 class="font-semibold text-gray-900">{{ guest.name }}</h3>
            <RsvpStatusBadge :status="guest.rsvpStatus" />
            <span v-if="guest.companions?.length > 0" class="companions-badge">
              <Users class="w-3 h-3" />
              +{{ guest.companions?.length }}
            </span>
          </div>

          <!-- Row 2: Contact info -->
          <div class="flex items-center gap-4 mt-1 text-sm text-gray-600">
            <span v-if="guest.email" class="flex items-center gap-1">
              <Mail class="w-4 h-4" />
              {{ guest.email }}
            </span>
            <span v-if="guest.phone" class="flex items-center gap-1">
              <Phone class="w-4 h-4" />
              {{ guest.phone }}
            </span>
          </div>
        </div>

        <!-- Date and Actions -->
        <div class="flex items-center gap-3">
          <button class="btn-secondary" @click.stop="$emit('show-details', guest)">
            <Eye class="w-4 h-4" />
            Details
          </button>

          <!-- NEW: RSVP Confirmation Button (Only for organizers) -->
          <button
            v-if="guest.rsvpStatus === 'pending'"
            class="btn-rsvp-confirm"
            :disabled="loading"
            @click.stop="openRsvpConfirmationModal"
          >
            <CheckSquare class="w-4 h-4" />
            Confirm
          </button>

          <!-- Original invitation actions (fallback) -->
          <div class="invitation-actions">
            <!-- For pending status -->
            <button
              v-if="guest.rsvpStatus === 'pending'"
              class="btn-primary"
              @click.stop="$emit('send-invitation', guest.id)"
            >
              <Mail class="w-4 h-4" />
              Send Invitation
            </button>

            <!-- For attending or not-attending -->
            <button v-else class="btn-secondary" @click.stop="$emit('resend-invitation', guest.id)">
              <RefreshCw class="w-4 h-4" />
              Resend
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 3: Companions (when expanded) -->
    <transition name="expand">
      <div v-if="isExpanded && guest.companions?.length">
        <RsvpCompanionsList :companions="guest.companions" />
      </div>
    </transition>

    <!-- NEW: RSVP Confirmation Modal -->
    <OrganizerRsvpConfirmationModal
      v-if="showRsvpModal"
      :guest="guest"
      @close="closeRsvpConfirmationModal"
      @confirmed="handleRsvpConfirmed"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  ChevronRight,
  ChevronDown,
  Users,
  Mail,
  Phone,
  Eye,
  RefreshCw,
  CheckSquare
} from 'lucide-vue-next'
import CCheckbox from '@/components/UI/form2/CCheckbox.vue'
import RsvpStatusBadge from '@/modules/rsvp/components/RsvpStatusBadge.vue'
import RsvpCompanionsList from '@/modules/rsvp/components/RsvpCompanionsList.vue'
import OrganizerRsvpConfirmationModal from '@/modules/rsvp/components/OrganizerRsvpConfirmationModal.vue'

const props = defineProps({
  guest: {
    type: Object,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'toggle-select',
  'show-details',
  'send-invitation',
  'resend-invitation',
  'rsvp-updated'
])

const isExpanded = ref(false)
const showRsvpModal = ref(false)
const loading = ref(false)

// NEW: Modal handlers
const openRsvpConfirmationModal = () => {
  showRsvpModal.value = true
}

const closeRsvpConfirmationModal = () => {
  showRsvpModal.value = false
}

const handleRsvpConfirmed = updatedGuestData => {
  // Emit event to parent component to update the guest data
  emit('rsvp-updated', updatedGuestData)
  closeRsvpConfirmationModal()
}
</script>

<style scoped>
/* CHANGED: Added improved card styles and button styles */
.guest-card {
  @apply bg-white rounded-lg border border-gray-200 p-4 mb-3 transition-all duration-200;
}

.guest-card:hover {
  @apply shadow-lg border-purple-200;
}

.guest-card-main {
  @apply cursor-pointer;
}

.companions-badge {
  @apply bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1;
}

.btn-primary {
  @apply bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors inline-flex items-center gap-2 text-sm font-medium;
}

.btn-secondary {
  @apply bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center gap-2 text-sm;
}

/* NEW: RSVP Confirmation button style */
.btn-rsvp-confirm {
  @apply bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all inline-flex items-center gap-2 text-sm font-medium shadow-md hover:shadow-lg;
}

.btn-rsvp-confirm:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.invitation-actions {
  @apply flex gap-2;
}
</style>
