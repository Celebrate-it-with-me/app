
<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <!-- Header -->
      <div class="modal-header">
        <div>
          <h3 class="text-xl font-bold text-gray-900">RSVP Confirmation</h3>
          <p class="text-sm text-gray-600 mt-1">{{ guest.name }}</p>
        </div>
        <button @click="$emit('close')" class="close-btn">
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="modal-body">
        <!-- Main Guest Section -->
        <div class="main-guest-section">
          <div class="section-header">
            <User class="w-5 h-5 text-purple-600" />
            <h4 class="font-semibold text-gray-800">Main Guest</h4>
            <RsvpStatusBadge :status="formData.guest.rsvp_status" class="ml-auto" />
          </div>

          <div class="guest-form-content">
            <!-- RSVP Status Options -->
            <div class="status-options">
              <label class="radio-option" :class="{ active: formData.guest.rsvp_status === 'attending' }">
                <input
                  v-model="formData.guest.rsvp_status"
                  type="radio"
                  value="attending"
                  class="sr-only"
                />
                <Check class="w-4 h-4 text-green-600" />
                <span>Confirm</span>
              </label>

              <label class="radio-option" :class="{ active: formData.guest.rsvp_status === 'not-attending' }">
                <input
                  v-model="formData.guest.rsvp_status"
                  type="radio"
                  value="not-attending"
                  class="sr-only"
                />
                <X class="w-4 h-4 text-red-600" />
                <span>Decline</span>
              </label>
            </div>

            <!-- Notes -->
            <div class="notes-section">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                v-model="formData.guest.notes"
                class="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows="2"
                placeholder="Add any notes about this guest's RSVP..."
              />
            </div>
          </div>
        </div>

        <!-- Companions Section -->
        <div v-if="companionsData.length > 0" class="companions-section">
          <div class="section-header">
            <Users class="w-5 h-5 text-purple-600" />
            <h4 class="font-semibold text-gray-800">
              Companions ({{ companionsData.length }})
            </h4>

            <!-- Bulk Actions -->
            <div class="bulk-actions">
              <button
                @click="bulkApplyToCompanions('attending')"
                class="bulk-btn bulk-confirm"
                title="Confirm all companions"
              >
                <CheckCircle class="w-3 h-3" />
                Confirm All
              </button>
              <button
                @click="bulkApplyToCompanions('not_attending')"
                class="bulk-btn bulk-decline"
                title="Decline all companions"
              >
                <XCircle class="w-3 h-3" />
                Decline All
              </button>
            </div>
          </div>

          <!-- Companions List -->
          <div class="companions-list">
            <div
              v-for="companion in companionsData"
              :key="companion.id"
              class="companion-item"
            >
              <div class="companion-header">
                <div class="companion-info">
                  <span class="companion-name">{{ companion.name }}</span>
                  <RsvpStatusBadge :status="companion.rsvp_status" size="sm" />
                </div>
              </div>

              <div class="companion-form-content">
                <!-- Companion RSVP Status Options -->
                <div class="status-options compact">
                  <label class="radio-option small" :class="{ active: companion.rsvp_status === 'attending' }">
                    <input
                      v-model="companion.rsvp_status"
                      type="radio"
                      value="attending"
                      class="sr-only"
                    />
                    <Check class="w-3 h-3 text-green-600" />
                    <span>Confirm</span>
                  </label>

                  <label class="radio-option small" :class="{ active: companion.rsvp_status === 'not-attending' }">
                    <input
                      v-model="companion.rsvp_status"
                      type="radio"
                      value="not-attending"
                      class="sr-only"
                    />
                    <X class="w-3 h-3 text-red-600" />
                    <span>Decline</span>
                  </label>
                </div>

                <!-- Companion Notes -->
                <div class="companion-notes">
                  <textarea
                    v-model="companion.notes"
                    class="w-full p-2 border border-gray-300 rounded text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows="1"
                    :placeholder="`Notes for ${companion.name}...`"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button @click="$emit('close')" class="btn-secondary" :disabled="saving">
          Cancel
        </button>
        <button
          @click="saveConfirmation"
          class="btn-primary"
          :disabled="saving"
        >
          <span v-if="saving">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
            Saving...
          </span>
          <span v-else>
            Save Changes
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { Check, CheckCircle, User, Users, X, XCircle } from 'lucide-vue-next'
import RsvpStatusBadge from './RsvpStatusBadge.vue'
import { useOrganizerRsvpStore } from '@/stores/useOrganizerRsvpStore'
import { useNotificationStore } from '@/stores/useNotificationStore'

const props = defineProps({
  guest: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'confirmed']);

// Stores
const organizerRsvpStore = useOrganizerRsvpStore();
const notificationStore = useNotificationStore();

// State
const saving = ref(false);

// Form Data - Initialize with guest data
const formData = reactive({
  guest: {
    rsvp_status: props.guest.rsvpStatus || 'pending',
    notes: props.guest.notes || ''
  }
});

// Companions Data - Initialize with guest companions
const companionsData = ref([]);

// Initialize data on mount
onMounted(() => {
  // Populate companions data from guest prop
  companionsData.value = (props.guest.companions || []).map(companion => ({
    id: companion.id,
    name: companion.name,
    rsvp_status: companion.rsvpStatus || 'pending',
    notes: companion.notes || ''
  }));
});

// Bulk apply to companions
const bulkApplyToCompanions = (status) => {
  companionsData.value.forEach(companion => {
    companion.rsvp_status = status;
  });
};

// Save confirmation
const saveConfirmation = async () => {
  saving.value = true;

  try {
    const payload = {
      guest: formData.guest,
      companions: companionsData.value.map(companion => ({
        id: companion.id,
        rsvp_status: companion.rsvp_status,
        notes: companion.notes
      }))
    };

    const response = await organizerRsvpStore.confirmRsvp(props.guest.id, payload);

    if (response.success) {
      notificationStore.addNotification({
        type: 'success',
        message: 'RSVP confirmation updated successfully!'
      });
      emit('confirmed', response.guest);
    }
  } catch (error) {
    console.error('Error saving RSVP confirmation:', error);
    notificationStore.addNotification({
      type: 'error',
      message: 'Failed to save RSVP confirmation'
    });
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4;
}

.modal-content {
  @apply bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl;
}

.modal-header {
  @apply flex justify-between items-start p-6 border-b border-gray-200;
}

.modal-body {
  @apply p-6 overflow-y-auto max-h-[60vh];
}

.modal-footer {
  @apply flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50;
}

.close-btn {
  @apply p-2 hover:bg-gray-100 rounded-lg transition-colors;
}

/* Sections */
.main-guest-section, .companions-section {
  @apply mb-6;
}

.section-header {
  @apply flex items-center gap-3 mb-4 pb-2 border-b border-gray-100;
}

.guest-form-content, .companion-form-content {
  @apply space-y-4;
}

/* Status Options */
.status-options {
  @apply flex gap-3;
}

.status-options.compact {
  @apply gap-2;
}

.radio-option {
  @apply flex items-center gap-2 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-300 transition-all;
}

.radio-option.small {
  @apply p-2 text-sm;
}

.radio-option.active {
  @apply border-purple-500 bg-purple-50;
}

/* Companions */
.companions-list {
  @apply space-y-4;
}

.companion-item {
  @apply bg-gray-50 rounded-lg p-4 border border-gray-200;
}

.companion-header {
  @apply flex justify-between items-center mb-3;
}

.companion-info {
  @apply flex items-center gap-3;
}

.companion-name {
  @apply font-medium text-gray-800;
}

.companion-notes {
  @apply mt-2;
}

/* Bulk Actions */
.bulk-actions {
  @apply flex gap-1 ml-auto;
}

.bulk-btn {
  @apply p-1.5 rounded text-xs font-medium transition-all inline-flex items-center gap-1;
}

.bulk-confirm {
  @apply bg-green-100 text-green-700 hover:bg-green-200;
}

.bulk-decline {
  @apply bg-red-100 text-red-700 hover:bg-red-200;
}

.bulk-pending {
  @apply bg-orange-100 text-orange-700 hover:bg-orange-200;
}

/* Buttons */
.btn-primary {
  @apply bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-medium shadow-md hover:shadow-lg disabled:opacity-50;
}

.btn-secondary {
  @apply bg-white text-gray-700 border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50;
}

/* Notes Section */
.notes-section {
  @apply mt-4;
}
</style>
