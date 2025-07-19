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
  <div
    class="w-full text-[#dba3ff]"
    v-if="true"
  >
    <div
      class="alert-container px-10 py-5 rounded-lg"
    >
      <p class="">
        No tiene ningun acompañante asignado, por favor haga click en continuar para terminar su RSVP
      </p>
    </div>
  </div>

  <div class="w-full flex flex-row justify-end my-2 gap-x-2">
    <button
      class="px-6 py-2 border-2 font-bold mr-2"
      style="font-family: inherit; color: #9a929e; background-color: transparent; border-color: #9a929e; border-radius: 8px;"
      @click="goToPrevious()"
    >
      Anterior
    </button>

    <button
      class="px-6 py-2 border-2 font-bold mr-2"
      style="font-family: inherit; color: #dba3ff; background-color: transparent; border-color: #dba3ff; border-radius: 8px;"
      @click="goToNext()"
    >
      Siguiente
    </button>
  </div>
</div>
</template>

<style scoped>

</style>
