<script setup>
import CreateSTD from '@/components/authenticated/save-the-date/CreateSTD.vue'
import STDPreview from '@/components/authenticated/save-the-date/STDPreview.vue'
import { onMounted, ref } from 'vue'
import CWMLoading from '@/components/UI/loading/CWMLoading.vue'

const stdConfig = ref(null)

const handleUpdateStd = (newConfig) => {
  stdConfig.value = newConfig
}

onMounted(() => {
  // todo load STD associated to the event
})

</script>

<template>
  <section class="event-std mt-10">
    <div class="flex flex-row justify-end">
      <h2 class="text-white text-2xl font-semibold">Save The Date</h2>
    </div>
    <section
      class="my-events-container mt-2 border-2 border-gray-200/10 p-10 rounded-md min-h-[300px] h-full"
    >
      <CWMLoading
        v-if="true"
        :loaderClasses="'w-full flex flex-row justify-center items-center'"
        :loader-fill="'fill-gray-800'"
      />
      <div
        v-else
        class="flex flex-row gap-x-4 "
      >
        <CreateSTD
          @updated-std="handleUpdateStd"
        />

        <STDPreview
          :std-config="stdConfig"
        />
      </div>
    </section>
  </section>
</template>

<style scoped></style>
