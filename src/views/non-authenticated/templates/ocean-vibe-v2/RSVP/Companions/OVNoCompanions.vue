<script setup>
const emit = defineEmits(['goToPrevious', 'goToNext'])

const goToPrevious = () => {
  emit('goToPrevious')
}

const goToNext = () => {
  emit('goToNext')
}
</script>

<template>
  <div>
    <div class="w-full">
      <div
        class="bg-sky-50/50 border border-sky-100 px-6 py-10 rounded-2xl text-center mb-10 shadow-sm"
      >
        <div
          class="w-16 h-16 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p class="text-slate-700 font-medium text-lg leading-relaxed max-w-md mx-auto">
          No tiene ningún acompañante asignado, por favor haga clic en continuar para terminar su
          RSVP.
        </p>
      </div>
    </div>

    <div class="w-full flex flex-col sm:flex-row justify-between items-center gap-4">
      <button
        class="w-full sm:w-auto px-10 py-3.5 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all uppercase tracking-wide text-xs"
        @click="goToPrevious()"
      >
        Atrás
      </button>

      <button
        class="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-[#123B5A] via-[#2F6F8F] to-[#7FB9C9] text-white rounded-2xl font-bold shadow-xl shadow-sky-900/20 hover:shadow-sky-900/30 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 uppercase tracking-wider text-sm"
        @click="goToNext()"
      >
        Siguiente Paso
      </button>
    </div>
  </div>
</template>

<style scoped></style>
