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
      <div class="bg-blue-50 border border-blue-100 px-6 py-8 rounded-xl text-center mb-8">
        <p class="text-blue-800 font-medium">
          No tiene ningún acompañante asignado, por favor haga clic en continuar para terminar su
          RSVP.
        </p>
      </div>
    </div>

    <div class="w-full flex flex-col sm:flex-row justify-between items-center gap-4">
      <button
        class="w-full sm:w-auto px-10 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
        @click="goToPrevious()"
      >
        Atrás
      </button>

      <button
        class="w-full sm:w-auto px-10 py-3 bg-gradient-to-l from-blue-800 to-red-800 text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition-all"
        @click="goToNext()"
      >
        Siguiente Paso
      </button>
    </div>
  </div>
</template>

<style scoped></style>
