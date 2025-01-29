<script setup lang="ts">

import CreateUpdateGuest from '@/components/authenticated/guests/CreateUpdateGuest.vue'
</script>

<template>
  <section class="event-std">
    <div
      class="my-events-container mt-2 border-2 border-gray-200/10 p-10 rounded-md min-h-[300px] h-full"
    >
      <CreateUpdateGuest />
    </div>
  </section>
</template>

<style scoped>

</style>
