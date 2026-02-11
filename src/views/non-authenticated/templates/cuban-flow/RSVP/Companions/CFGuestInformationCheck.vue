<script setup>
import { computed, ref } from 'vue'
import { useTemplateStore } from '@/stores/useTemplateStore'

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
        <h3 class="text-xl font-bold mb-4 text-blue-800 border-b border-gray-100 pb-2">
          Información del Invitado Principal:
        </h3>
        <div class="overflow-hidden rounded-xl border border-gray-200">
          <table class="w-full table-auto text-sm">
            <tbody class="divide-y divide-gray-100">
              <tr>
                <td class="px-6 py-4 font-bold text-gray-500 bg-gray-50 w-1/3">Nombre:</td>
                <td class="px-6 py-4 font-medium text-gray-900">{{ guestInfo?.name }}</td>
              </tr>
              <tr>
                <td class="px-6 py-4 font-bold text-gray-500 bg-gray-50">Email:</td>
                <td class="px-6 py-4 font-medium text-gray-900">{{ guestInfo?.email ?? 'N/A' }}</td>
              </tr>
              <tr>
                <td class="px-6 py-4 font-bold text-gray-500 bg-gray-50">Teléfono:</td>
                <td class="px-6 py-4 font-medium text-gray-900">{{ guestInfo?.phone ?? 'N/A' }}</td>
              </tr>
              <tr>
                <td class="px-6 py-4 font-bold text-gray-500 bg-gray-50">Asistirá:</td>
                <td class="px-6 py-4">
                  <span
                    class="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                    :class="{
                      'text-green-700 bg-green-100': guestInfo?.rsvpStatus === 'attending',
                      'text-red-700 bg-red-100': guestInfo?.rsvpStatus === 'not-attending',
                      'text-yellow-700 bg-yellow-100': guestInfo?.rsvpStatus === 'pending'
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
        <h3 class="text-xl font-bold mb-4 text-blue-800 border-b border-gray-100 pb-2">
          Lista de Acompañantes:
        </h3>
        <div class="overflow-hidden rounded-xl border border-gray-200">
          <table class="w-full table-auto text-sm">
            <thead class="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th class="px-6 py-3 text-left font-bold">Nombre</th>
                <th class="px-6 py-3 text-left font-bold">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="companion in companions"
                :key="companion.id"
                class="bg-white hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4 font-semibold text-gray-900">
                  {{ companion.name ?? 'Sin nombre' }}
                </td>
                <td class="px-6 py-4">
                  <span
                    :class="[
                      'inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
                      companion.rsvpStatus === 'attending'
                        ? 'text-green-700 bg-green-100'
                        : companion.rsvpStatus === 'not-attending'
                          ? 'text-red-700 bg-red-100'
                          : 'text-yellow-700 bg-yellow-100'
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
    <div class="mt-12 flex flex-col sm:flex-row justify-between items-center gap-4">
      <button
        class="w-full sm:w-auto px-10 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all order-2 sm:order-1"
        @click="goBack"
      >
        Atrás
      </button>

      <button
        class="w-full sm:w-auto px-10 py-3 bg-gradient-to-l from-blue-800 to-red-800 text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition-all transform hover:-translate-y-0.5 order-1 sm:order-2"
        :disabled="loading"
        @click.prevent="submit"
      >
        {{ loading ? 'Guardando...' : 'Confirmar RSVP' }}
      </button>
    </div>
  </div>
</template>

<style scoped></style>
