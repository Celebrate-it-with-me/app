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
  <div class="w-full">
    <!-- Desktop Table View -->
    <div class="hidden md:block overflow-hidden rounded-2xl border border-sky-100 shadow-sm">
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

    <!-- Mobile Card View -->
    <div class="md:hidden flex flex-col gap-4">
      <div
        v-for="companion in companions"
        :key="companion.id"
        class="bg-white p-5 rounded-2xl border border-sky-100 shadow-sm flex flex-col gap-4"
      >
        <div class="flex justify-between items-start">
          <div class="flex flex-col">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1"
              >Nombre</span
            >
            <span class="font-bold text-slate-900">{{ companion.name }}</span>
          </div>
          <div class="flex flex-col items-end">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1"
              >Estado</span
            >
            <span
              :class="[
                'inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm',
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
          </div>
        </div>

        <div class="pt-3 border-t border-sky-50 flex justify-end">
          <button
            class="flex items-center gap-2 text-sky-600 font-bold hover:text-sky-800 transition-colors uppercase text-xs tracking-widest py-2 px-4 rounded-lg bg-sky-50"
            @click="handleConfirmation(companion)"
          >
            <svg
              v-if="companion.rsvpStatus === 'pending'"
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            {{ companion.rsvpStatus === 'pending' ? 'Confirmar' : 'Editar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
