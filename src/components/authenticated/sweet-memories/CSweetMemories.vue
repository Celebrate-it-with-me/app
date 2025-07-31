<script setup>
import CWMLoading from '@/components/UI/loading/CWMLoading.vue'
import { ref } from 'vue'
import CreateUpdateSweetMemoriesConfig from '@/components/authenticated/sweet-memories/CreateUpdateSweetMemoriesConfig.vue'
import ShowSweetMemories from '@/components/authenticated/sweet-memories/ShowSweetMemories.vue'
const loading = ref(false)
</script>

<template>
  <section class="event-std">
    <section
      class="my-events-container mt-2 border-2 border-gray-200/10 p-10 rounded-md min-h-[300px] h-full"
    >
      <CWMLoading
        v-if="loading"
        :loader-classes="'w-full flex flex-row justify-center items-center'"
        :loader-fill="'fill-gray-800'"
      />
      <div v-else class="flex flex-row gap-x-4">
        <CreateUpdateSweetMemoriesConfig />

        <ShowSweetMemories />
      </div>
    </section>
  </section>
</template>

<style scoped></style>
