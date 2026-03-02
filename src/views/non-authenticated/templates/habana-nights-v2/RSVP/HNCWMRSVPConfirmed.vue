<script setup>
import { Mail, Phone, User, CheckCircle, UserCheck } from 'lucide-vue-next'
import { useTemplateStore } from '@/stores/publicEvents/useTemplateStore'
import { computed } from 'vue'

const templateStore = useTemplateStore()

const guestCompanions = computed(() => {
  return templateStore.guest?.companions ?? []
})

const formatStatus = status => {
  if (status === 'attending') {
    return 'Asistirá'
  } else if (status === 'not-attending') {
    return 'No asistirá'
  } else if (status === 'pending') {
    return 'Pendiente'
  }
  return ''
}
</script>

<template>
  <div class="w-full flex items-center justify-center">
    <div class="w-full">
      <!-- Header -->
      <div class="mb-8 text-center">
        <div
          class="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 hn-check-icon"
        >
          <CheckCircle class="w-10 h-10 text-[#D4AF37]" />
        </div>
        <h2 class="text-2xl md:text-3xl font-['Cinzel',serif] text-[#F8F1E7]">
          ¡Gracias, {{ templateStore.guestFullName }}!
        </h2>
        <div
          class="mt-3 w-16 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent mx-auto"
        ></div>
        <p class="text-[#94A3B8] mt-4 font-['Montserrat',sans-serif] text-sm">
          Estamos emocionados de recibirte en
          <span class="font-semibold text-[#D4AF37]">{{ templateStore.eventName }}</span
          >.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Guest Info -->
        <div class="w-full">
          <h3 class="hn-section-title flex items-center gap-2">
            <UserCheck class="w-4 h-4" />
            Tu Información
          </h3>
          <div class="hn-info-card">
            <div class="hn-info-row">
              <Mail class="w-4 h-4 text-[#D4AF37]" />
              <span class="text-[#F8F1E7] font-['Montserrat',sans-serif] text-sm">
                {{ templateStore.guest?.email ?? 'N/A' }}
              </span>
            </div>
            <div class="hn-info-row">
              <Phone class="w-4 h-4 text-[#D4AF37]" />
              <span class="text-[#F8F1E7] font-['Montserrat',sans-serif] text-sm">
                {{ templateStore.guest?.phone ?? 'N/A' }}
              </span>
            </div>
            <div class="hn-info-row">
              <span
                :class="[
                  'hn-status-chip',
                  templateStore.guest?.rsvpStatus === 'attending'
                    ? 'hn-status-attending'
                    : templateStore.guest?.rsvpStatus === 'not-attending'
                      ? 'hn-status-not-attending'
                      : 'hn-status-pending'
                ]"
              >
                {{ formatStatus(templateStore.guest?.rsvpStatus) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Companions -->
        <div class="w-full">
          <h3 class="hn-section-title flex items-center gap-2">
            <User class="w-4 h-4" />
            Acompañantes
          </h3>
          <div v-if="guestCompanions.length > 0" class="hn-info-card">
            <div
              v-for="(companion, index) in guestCompanions"
              :key="index"
              class="hn-companion-row"
            >
              <span class="text-[#F8F1E7] font-['Montserrat',sans-serif] text-sm font-medium">
                {{ companion.name ?? 'Sin nombre' }}
              </span>
              <span
                :class="[
                  'hn-status-chip-sm',
                  companion.rsvpStatus === 'attending'
                    ? 'hn-status-attending'
                    : companion.rsvpStatus === 'not-attending'
                      ? 'hn-status-not-attending'
                      : 'hn-status-pending'
                ]"
              >
                {{ formatStatus(companion.rsvpStatus) }}
              </span>
            </div>
          </div>
          <div v-else class="hn-info-card">
            <p class="text-[#94A3B8] text-sm italic font-['Montserrat',sans-serif] p-4 text-center">
              Sin acompañantes.
            </p>
          </div>
        </div>
      </div>

      <!-- Next Steps -->
      <div class="mt-8 pt-6 border-t border-[#D4AF37]/20 text-center">
        <p class="text-sm text-[#94A3B8] font-['Montserrat',sans-serif]">
          <strong class="text-[#F8F1E7]">¿Necesitas ayuda?</strong>
          Contáctanos en
          <a
            :href="`mailto:${templateStore.eventOrganizerEmail}`"
            class="text-[#D4AF37] font-semibold hover:underline transition-colors"
          >
            {{ templateStore.eventOrganizerEmail }}
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hn-check-icon {
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.hn-section-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #d4af37;
  margin-bottom: 0.75rem;
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
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
}

.hn-info-row:last-child {
  border-bottom: none;
}

.hn-companion-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
}

.hn-companion-row:last-child {
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

.hn-status-chip-sm {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
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
</style>
