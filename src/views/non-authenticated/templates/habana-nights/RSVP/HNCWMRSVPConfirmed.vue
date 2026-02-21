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
    <div class="w-full bg-white rounded-2xl border border-gray-200 shadow-md p-6 md:p-10">
      <!-- Header -->
      <div class="mb-8 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
          <CheckCircle class="w-10 h-10 text-blue-800" />
        </div>
        <h2 class="text-3xl font-gvibes text-blue-800">
          ¡Gracias, {{ templateStore.guestFullName }}!
        </h2>
        <div
          class="mt-2 w-16 h-1 bg-gradient-to-l from-blue-800 to-red-800 mx-auto rounded-full"
        ></div>
        <p class="text-gray-600 mt-4">
          Estamos emocionados de recibirte en
          <span class="font-bold text-blue-800">{{ templateStore.eventName }}</span
          >.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-700">
        <!-- Guest Info -->
        <div class="w-full">
          <h3
            class="text-lg font-bold mb-4 text-blue-800 border-b border-gray-100 pb-2 flex items-center gap-2"
          >
            <UserCheck class="w-5 h-5" />
            Tu Información
          </h3>
          <div class="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p class="flex items-center gap-3 text-sm">
              <Mail class="w-4 h-4 text-blue-800" />
              <span class="font-medium">{{ templateStore.guest?.email ?? 'N/A' }}</span>
            </p>
            <p class="flex items-center gap-3 text-sm">
              <Phone class="w-4 h-4 text-blue-800" />
              <span class="font-medium">{{ templateStore.guest?.phone ?? 'N/A' }}</span>
            </p>
            <div class="pt-2">
              <span
                class="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                :class="[
                  templateStore.guest?.rsvpStatus === 'attending'
                    ? 'text-green-700 bg-green-100'
                    : templateStore.guest?.rsvpStatus === 'not-attending'
                      ? 'text-red-700 bg-red-100'
                      : 'text-yellow-700 bg-yellow-100'
                ]"
              >
                {{ formatStatus(templateStore.guest?.rsvpStatus) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Companions -->
        <div class="w-full">
          <h3
            class="text-lg font-bold mb-4 text-blue-800 border-b border-gray-100 pb-2 flex items-center gap-2"
          >
            <User class="w-5 h-5" />
            Acompañantes
          </h3>
          <div
            v-if="guestCompanions.length > 0"
            class="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100"
          >
            <div
              v-for="(companion, index) in guestCompanions"
              :key="index"
              class="flex items-center justify-between gap-2 border-b border-gray-200 last:border-0 pb-2 last:pb-0"
            >
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">{{ companion.name ?? 'Sin nombre' }}</span>
              </div>
              <span
                class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                :class="[
                  companion.rsvpStatus === 'attending'
                    ? 'text-green-700 bg-green-100'
                    : companion.rsvpStatus === 'not-attending'
                      ? 'text-red-700 bg-red-100'
                      : 'text-yellow-700 bg-yellow-100'
                ]"
              >
                {{ formatStatus(companion.rsvpStatus) }}
              </span>
            </div>
          </div>
          <p
            v-else
            class="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-xl border border-gray-100"
          >
            Sin acompañantes.
          </p>
        </div>
      </div>

      <!-- Next Steps -->
      <div class="mt-10 pt-6 border-t border-gray-100 text-center">
        <p class="text-sm text-gray-500">
          <strong>¿Necesitas ayuda?</strong>
          Contáctanos en
          <a
            :href="`mailto:${templateStore.eventOrganizerEmail}`"
            class="text-blue-800 font-bold hover:underline"
          >
            {{ templateStore.eventOrganizerEmail }}
          </a>
        </p>
      </div>
    </div>
  </div>
</template>
