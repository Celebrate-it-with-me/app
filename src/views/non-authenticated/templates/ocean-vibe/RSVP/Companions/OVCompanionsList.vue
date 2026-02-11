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
  <div class="overflow-hidden rounded-2xl border border-sky-100 shadow-sm">
    <table class="w-full text-sm text-left text-slate-700">
      <thead class="text-xs text-slate-500 uppercase bg-sky-50/50 border-b border-sky-100">
        <tr>
          <th scope="col" class="px-6 py-4 font-bold tracking-wider">Nombre</th>
          <th scope="col" class="px-6 py-4 font-bold text-center tracking-wider">Estado</th>
          <th scope="col" class="px-6 py-4 font-bold text-right tracking-wider">Acción</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-sky-50">
        <tr
          v-for="companion in companions"
          :key="companion.id"
          class="bg-white hover:bg-sky-50/30 transition-colors"
        >
          <th scope="row" class="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
            {{ companion.name }}
          </th>
          <td class="px-6 py-4 text-center">
            <span
              :class="[
                'inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm',
                companion.rsvpStatus === 'attending'
                  ? 'bg-sky-100/80 text-sky-700'
                  : companion.rsvpStatus === 'not-attending'
                    ? 'bg-slate-100 text-slate-600'
                    : 'bg-amber-100/80 text-amber-700'
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
              class="text-sky-600 font-bold hover:text-sky-800 transition-colors uppercase text-xs tracking-widest"
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
