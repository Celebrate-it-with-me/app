<script setup>
import CWMEventCommentsCreator from '@/components/authenticated/event-comments/EventComments/CWMEventCommentsCreator.vue'
</script>

<template>
  <section class="event-comments">
    <div
      class="mt-2 border-2 border-gray-200/10 p-10 rounded-md min-h-[300px] h-full"
    >
      <div
        class="flex flex-row gap-x-4 "
      >
        <CWMEventCommentsCreator />

      </div>
    </div>
  </section>
</template>

<style scoped>

</style>
