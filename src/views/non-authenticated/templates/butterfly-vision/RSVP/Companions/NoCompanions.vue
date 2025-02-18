<script setup>

</script>

<template>
<div>
  <div
    class="w-full text-[#dba3ff]"
    v-if="true"
  >
    <div
      class="alert-container border border-[#f3a40a] px-10 py-5 rounded-lg"
    >
      <p class="">
        No tiene ningun acompañante asignado, por favor haga click en continuar para terminar su RSVP
      </p>
    </div>
  </div>

  <div
    class="action-button w-full flex flew-row gap-x-5 justify-end mt-10"
  >
    <button
      class="px-6 py-2 border-2 font-bold"
      style="font-family: inherit; color: #9a929e; background-color: transparent; border-color: #9a929e; border-radius: 8px;"
    >
      Back
    </button>

    <button
      class="px-6 py-2 border-2 font-bold"
      style="font-family: inherit; color: #dba3ff; background-color: transparent; border-color: #dba3ff; border-radius: 8px;"
    >
      Next
    </button>
  </div>
</div>
</template>

<style scoped>

</style>
