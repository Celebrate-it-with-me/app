<script setup>
import { computed } from 'vue'
import { useTemplateStore } from '@/stores/useTemplateStore'

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
  <div class="overflow-hidden rounded-xl border border-gray-200">
    <table class="w-full text-sm text-left text-gray-700">
      <thead class="text-xs text-gray-600 uppercase bg-gray-50 border-b border-gray-200">
        <tr>
          <th scope="col" class="px-6 py-4 font-bold">Nombre</th>
          <th scope="col" class="px-6 py-4 font-bold text-center">Estado</th>
          <th scope="col" class="px-6 py-4 font-bold text-right">Acción</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        <tr
          v-for="companion in companions"
          :key="companion.id"
          class="bg-white hover:bg-gray-50 transition-colors"
        >
          <th scope="row" class="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">
            {{ companion.name }}
          </th>
          <td class="px-6 py-4 text-center">
            <span
              :class="[
                'inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
                companion.rsvpStatus === 'attending'
                  ? 'bg-green-100 text-green-700'
                  : companion.rsvpStatus === 'not-attending'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
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
          <td class="px-6 py-4 text-right">
            <button
              class="text-blue-800 font-bold hover:text-blue-600 transition-colors"
              @click="handleConfirmation(companion)"
            >
              {{ companion.rsvpStatus === 'pending' ? 'Confirmar' : 'Editar' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped></style>
