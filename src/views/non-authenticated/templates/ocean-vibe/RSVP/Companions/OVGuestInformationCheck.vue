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
    <div class="flex flex-col gap-10 text-gray-700">
      <!-- Main Guest Info -->
      <div class="w-full">
        <h3
          class="text-xl font-bold mb-5 bg-gradient-to-r from-[#123B5A] to-[#2F6F8F] bg-clip-text text-transparent border-b border-sky-100 pb-3"
        >
          Información del Invitado Principal:
        </h3>
        <div class="overflow-hidden rounded-2xl border border-sky-100 shadow-sm">
          <table class="w-full table-auto text-sm">
            <tbody class="divide-y divide-sky-50">
              <tr>
                <td class="px-6 py-4 font-bold text-slate-500 bg-sky-50/50 w-1/3">Nombre:</td>
                <td class="px-6 py-4 font-semibold text-slate-800">{{ guestInfo?.name }}</td>
              </tr>
              <tr>
                <td class="px-6 py-4 font-bold text-slate-500 bg-sky-50/50">Email:</td>
                <td class="px-6 py-4 font-medium text-slate-800">
                  {{ guestInfo?.email ?? 'N/A' }}
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 font-bold text-slate-500 bg-sky-50/50">Teléfono:</td>
                <td class="px-6 py-4 font-medium text-slate-800">
                  {{ guestInfo?.phone ?? 'N/A' }}
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 font-bold text-slate-500 bg-sky-50/50">Asistirá:</td>
                <td class="px-6 py-4">
                  <span
                    class="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm"
                    :class="{
                      'text-sky-700 bg-sky-100/80': guestInfo?.rsvpStatus === 'attending',
                      'text-slate-600 bg-slate-100': guestInfo?.rsvpStatus === 'not-attending',
                      'text-amber-700 bg-amber-100/80': guestInfo?.rsvpStatus === 'pending'
                    }"
                  >
                    {{
                      guestInfo?.rsvpStatus === 'attending'
                        ? 'Asistirá'
                        : guestInfo?.rsvpStatus === 'not-attending'
                          ? 'No asistirá'
                          : 'Pendiente'
                    }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="hasCompanions" class="w-full">
        <h3
          class="text-xl font-bold mb-5 bg-gradient-to-r from-[#123B5A] to-[#2F6F8F] bg-clip-text text-transparent border-b border-sky-100 pb-3"
        >
          Lista de Acompañantes:
        </h3>
        <div class="overflow-hidden rounded-2xl border border-sky-100 shadow-sm">
          <table class="w-full table-auto text-sm">
            <thead class="bg-sky-50/50 text-slate-500 uppercase text-xs">
              <tr>
                <th class="px-6 py-4 text-left font-bold tracking-wider">Nombre</th>
                <th class="px-6 py-4 text-left font-bold tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-sky-50">
              <tr
                v-for="companion in companions"
                :key="companion.id"
                class="bg-white hover:bg-sky-50/30 transition-colors"
              >
                <td class="px-6 py-4 font-semibold text-slate-800">
                  {{ companion.name ?? 'Sin nombre' }}
                </td>
                <td class="px-6 py-4">
                  <span
                    :class="[
                      'inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm',
                      companion.rsvpStatus === 'attending'
                        ? 'text-sky-700 bg-sky-100/80'
                        : companion.rsvpStatus === 'not-attending'
                          ? 'text-slate-600 bg-slate-100'
                          : 'text-amber-700 bg-amber-100/80'
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
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Buttons -->
    <div class="mt-14 flex flex-col sm:flex-row justify-between items-center gap-4">
      <button
        class="w-full sm:w-auto px-10 py-3.5 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all uppercase tracking-wide text-xs order-2 sm:order-1"
        @click="goBack"
      >
        Atrás
      </button>

      <button
        class="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-[#123B5A] via-[#2F6F8F] to-[#7FB9C9] text-white rounded-2xl font-bold shadow-xl shadow-sky-900/20 hover:shadow-sky-900/30 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 uppercase tracking-wider text-sm order-1 sm:order-2"
        :disabled="loading"
        @click.prevent="submit"
      >
        <span v-if="loading" class="flex items-center gap-2">
          <svg
            class="animate-spin h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Guardando...
        </span>
        <span v-else>Confirmar RSVP</span>
      </button>
    </div>
  </div>
</template>

<style scoped></style>
