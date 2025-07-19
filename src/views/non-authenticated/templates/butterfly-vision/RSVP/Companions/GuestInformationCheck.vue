<script setup>
import { computed, ref } from 'vue'
import { useTemplateStore } from '@/stores/useTemplateStore'
import { useRoute } from 'vue-router'

const emit = defineEmits(['goBack', 'submit'])
const templateStore = useTemplateStore()
const loading = ref(false)

const route = useRoute()
const { eventId, guestCode  } = route.params

const guestInfo = computed(() => templateStore.guest)
const companions = computed(() => templateStore.guest?.companions ?? [])

const hasCompanions = computed(() => companions.value.length > 0)

const goBack = () => {
  emit('goBack')
}

const submit = async () => {
  try {
    loading.value = true
    const response = await templateStore.rsvpSaveUpdate()

    if (response.status === 200) {
      const guestData = await templateStore.refreshGuestData({eventId, guestCode})

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
  <div class="w-full max-w-5xl bg-white rounded-lg shadow-md px-6 pt-5 pb-5">
    <h2 class="text-2xl font-semibold mb-6 text-center text-dark-blue mt-4">
      Confirme su información
    </h2>

    <div class="flex flex-col md:flex-row gap-6 gap-y-10 text-dark-blue">
      <!-- Main Guest Info -->
      <div class="flex-1">
        <h3 class="text-xl font-semibold mb-4 text-center md:text-left border-b pb-2">
          Información del Invitado Principal:
        </h3>
        <div class="overflow-x-auto">
          <table class="w-full table-auto border rounded-lg shadow-sm text-sm">
            <tbody>
            <tr class="border-b">
              <td class="px-4 py-2 font-semibold text-gray-600 w-32">Nombre:</td>
              <td class="px-4 py-2 text-gray-800">{{ guestInfo?.name }}</td>
            </tr>
            <tr class="border-b">
              <td class="px-4 py-2 font-semibold text-gray-600">Email:</td>
              <td class="px-4 py-2 text-gray-800">{{ guestInfo?.email ?? 'N/A' }}</td>
            </tr>
            <tr class="border-b">
              <td class="px-4 py-2 font-semibold text-gray-600">Telefono:</td>
              <td class="px-4 py-2 text-gray-800">{{ guestInfo?.phone ?? 'N/A' }}</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-semibold text-gray-600">
                Asistiendo?:
              </td>
              <td class="px-4 py-2">
                <span
                  class="inline-block px-2 py-1 rounded-full text-xs font-semibold"
                  :class="{
                    'text-green-700 bg-green-100': guestInfo?.rsvpStatus === 'attending',
                    'text-red-700 bg-red-100': guestInfo?.rsvpStatus === 'not-attending',
                    'text-yellow-700 bg-yellow-100': guestInfo?.rsvpStatus === 'pending'
                  }"
                >
                  {{
                    guestInfo?.rsvpStatus === 'attending'
                      ? 'Asistiendo'
                      : guestInfo?.rsvpStatus === 'not-attending'
                        ? 'No asistiendo'
                        : 'pendiente'
                  }}
                </span>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="flex-1" v-if="hasCompanions">
        <h3 class="text-xl font-semibold mb-4 text-center md:text-left border-b pb-2">
          Lista de acompañantes:
        </h3>
        <div class="overflow-x-auto">
          <table class="w-full table-auto border rounded-lg sm:rounded-lg shadow-sm text-sm">
            <thead class="bg-gray-100 text-gray-600 uppercase">
            <tr>
              <th class="px-4 py-2 text-left">Nombre</th>
              <th class="px-4 py-2 text-left">Asistiendo</th>
            </tr>
            </thead>
            <tbody>
            <tr
              v-for="companion in companions"
              :key="companion.id"
              class="bg-white border-t hover:bg-gray-50"
            >
              <td class="px-4 py-2 font-medium text-gray-800">
                {{ companion.name ?? '' }}
              </td>
              <td class="px-4 py-2">
                  <span
                    :class="[
                      'inline-block px-2 py-1 rounded-full text-xs font-semibold',
                      companion.rsvpStatus === 'attending' ? 'text-green-700 bg-green-100' :
                      companion.rsvpStatus === 'not-attending' ? 'text-red-700 bg-red-100' :
                      'text-yellow-700 bg-yellow-100 text-yellow-700'
                    ]"
                  >
                    {{ companion.rsvpStatus === 'attending' ? 'Asistiendo' :
                    companion.rsvpStatus === 'not-attending' ? 'No asistiendo' : 'Pendiente' }}
                  </span>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Buttons -->
    <div class="mt-10 flex flex-row justify-center sm:justify-end
                items-center gap-4 pb-4">
      <button
        @click="goBack"
        class="px-6 py-2 border rounded-lg text-sm font-semibold text-gray-600
               border-gray-400 hover:bg-gray-100 transition"
      >
        Anterior
      </button>

      <button
        @click="submit"
        class="px-6 py-2 border rounded-lg text-sm font-semibold text-purple-600 border-purple-300 hover:bg-purple-50 transition"
      >
        Siguiente
      </button>
    </div>
  </div>
</template>

<style scoped>

</style>
