<script setup>
import { computed } from 'vue'
import { useTemplateStore } from '@/stores/publicEvents/useTemplateStore'

const emit = defineEmits(['setCurrentCompanion'])
const templateStore = useTemplateStore()

const companions = computed(() => {
  return templateStore.guest?.companions ?? []
})

const handleConfirmation = companion => {
  emit('setCurrentCompanion', companion)
}
</script>

<template>
  <div class="hn-companions-list space-y-3">
    <div v-for="companion in companions" :key="companion.id" class="hn-companion-row">
      <div class="flex-1 min-w-0">
        <span
          class="text-[#F8F1E7] font-['Montserrat',sans-serif] font-medium text-sm truncate block"
        >
          {{ companion.name }}
        </span>
      </div>

      <div class="flex items-center gap-4">
        <span
          :class="[
            'hn-status-chip',
            companion.rsvpStatus === 'attending'
              ? 'hn-status-attending'
              : companion.rsvpStatus === 'not-attending'
                ? 'hn-status-not-attending'
                : 'hn-status-pending'
          ]"
        >
          {{
            companion.rsvpStatus === 'attending'
              ? 'Asistirá'
              : companion.rsvpStatus === 'not-attending'
                ? 'No asistirá'
                : 'Pendiente'
          }}
        </span>

        <button class="hn-action-link" @click="handleConfirmation(companion)">
          {{ companion.rsvpStatus === 'pending' ? 'Confirmar' : 'Editar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hn-companions-list {
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 8px;
  overflow: hidden;
}

.hn-companion-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: rgba(17, 24, 39, 0.4);
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
  transition: background 0.2s ease;
  gap: 1rem;
}

.hn-companion-row:last-child {
  border-bottom: none;
}

.hn-companion-row:hover {
  background: rgba(17, 24, 39, 0.6);
}

.hn-status-chip {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

.hn-status-attending {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.hn-status-not-attending {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.hn-status-pending {
  background: rgba(212, 175, 55, 0.15);
  color: #d4af37;
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.hn-action-link {
  color: #d4af37;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0.5rem;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hn-action-link:hover {
  color: #f8f1e7;
  text-shadow: 0 0 8px rgba(212, 175, 55, 0.5);
}
</style>
