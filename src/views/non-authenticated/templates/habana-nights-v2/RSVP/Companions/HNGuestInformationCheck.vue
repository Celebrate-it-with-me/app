<script setup>
import { computed, ref } from 'vue'
import { useTemplateStore } from '@/stores/publicEvents/useTemplateStore'

const emit = defineEmits(['goBack', 'submit'])
const templateStore = useTemplateStore()
const loading = ref(false)

const guestInfo = computed(() => templateStore.guest)
const companions = computed(() => templateStore.guest?.companions ?? [])

const hasCompanions = computed(() => companions.value.length > 0)

const goBack = () => {
  emit('goBack')
}

const submit = async e => {
  if (e) e.preventDefault()
  try {
    loading.value = true
    const response = await templateStore.rsvpSaveUpdate()

    if (response.status === 200) {
      const guestData = await templateStore.refreshGuestData()

      const { mainGuest } = guestData.data?.data ?? {}

      templateStore.guest = mainGuest
    } else {
      console.log(response)
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="w-full">
    <div class="flex flex-col gap-8">
      <!-- Main Guest Info -->
      <div class="w-full">
        <h3 class="hn-section-title">Información del Invitado Principal</h3>
        <div class="hn-info-card">
          <div class="hn-info-row">
            <span class="hn-info-label">Nombre</span>
            <span class="hn-info-value">{{ guestInfo?.name }}</span>
          </div>
          <div class="hn-info-row">
            <span class="hn-info-label">Email</span>
            <span class="hn-info-value">{{ guestInfo?.email ?? 'N/A' }}</span>
          </div>
          <div class="hn-info-row">
            <span class="hn-info-label">Teléfono</span>
            <span class="hn-info-value">{{ guestInfo?.phone ?? 'N/A' }}</span>
          </div>
          <div class="hn-info-row">
            <span class="hn-info-label">Asistirá</span>
            <span
              :class="[
                'hn-status-chip',
                guestInfo?.rsvpStatus === 'attending'
                  ? 'hn-status-attending'
                  : guestInfo?.rsvpStatus === 'not-attending'
                    ? 'hn-status-not-attending'
                    : 'hn-status-pending'
              ]"
            >
              {{
                guestInfo?.rsvpStatus === 'attending'
                  ? 'Asistirá'
                  : guestInfo?.rsvpStatus === 'not-attending'
                    ? 'No asistirá'
                    : 'Pendiente'
              }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="hasCompanions" class="w-full">
        <h3 class="hn-section-title">Lista de Acompañantes</h3>
        <div class="hn-info-card">
          <div v-for="companion in companions" :key="companion.id" class="hn-companion-review-row">
            <span class="text-[#F8F1E7] font-['Montserrat',sans-serif] font-medium text-sm">
              {{ companion.name ?? 'Sin nombre' }}
            </span>
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
          </div>
        </div>
      </div>
    </div>

    <!-- Buttons -->
    <div class="mt-10 flex flex-col sm:flex-row justify-between items-center gap-4">
      <button class="hn-btn-secondary order-2 sm:order-1" @click="goBack">Atrás</button>

      <button class="hn-btn-primary order-1 sm:order-2" :disabled="loading" @click.prevent="submit">
        {{ loading ? 'Guardando...' : 'Confirmar RSVP' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.hn-section-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #d4af37;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
}

.hn-info-card {
  background: rgba(17, 24, 39, 0.4);
  border: 1px solid rgba(212, 175, 55, 0.15);
  border-radius: 8px;
  overflow: hidden;
}

.hn-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
}

.hn-info-row:last-child {
  border-bottom: none;
}

.hn-info-label {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #94a3b8;
}

.hn-info-value {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.9rem;
  color: #f8f1e7;
}

.hn-companion-review-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
}

.hn-companion-review-row:last-child {
  border-bottom: none;
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

.hn-btn-primary {
  width: 100%;
  padding: 0.875rem 2.5rem;
  background: linear-gradient(135deg, #d4af37 0%, #b8962e 100%);
  color: #0b1220;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 48px;
}

.hn-btn-primary:hover {
  box-shadow: 0 4px 20px rgba(212, 175, 55, 0.35);
  transform: translateY(-1px);
}

.hn-btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.hn-btn-secondary {
  width: 100%;
  padding: 0.875rem 2.5rem;
  background: transparent;
  color: #f8f1e7;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border: 1px solid rgba(212, 175, 55, 0.4);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 48px;
}

.hn-btn-secondary:hover {
  border-color: #d4af37;
  background: rgba(212, 175, 55, 0.1);
}

@media (min-width: 640px) {
  .hn-btn-primary,
  .hn-btn-secondary {
    width: auto;
  }
}
</style>
