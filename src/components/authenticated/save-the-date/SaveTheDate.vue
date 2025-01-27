<script setup>
import CreateSTD from '@/components/authenticated/save-the-date/CreateSTD.vue'
import STDPreview from '@/components/authenticated/save-the-date/STDPreview.vue'


</script>

<template>
  <section class="event-std mt-10">
    <div class="flex flex-row justify-end">
      <h2 class="text-white text-2xl font-semibold">Save The Date</h2>
    </div>
    <section
      class="my-events-container flex flex-row gap-x-4 mt-2 border-2 border-gray-200/10 p-10 rounded-md min-h-[300px] h-full"
    >
      <CreateSTD />

      <STDPreview />

    </section>
  </section>
</template>

<style scoped></style>
