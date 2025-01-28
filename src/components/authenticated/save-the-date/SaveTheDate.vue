<script setup>
import CreateUpdateStd from '@/components/authenticated/save-the-date/CreateUpdateSTD.vue'
import STDPreview from '@/components/authenticated/save-the-date/STDPreview.vue'
import { onMounted, ref } from 'vue'
import CWMLoading from '@/components/UI/loading/CWMLoading.vue'
import { useSTDStore } from '@/stores/useSTDStore'

const stdConfig = ref(null)
const loading = ref(false)
const stdStore = useSTDStore()

const handleUpdateStd = (newConfig) => {
  stdConfig.value = newConfig
}

onMounted(() => {
  loadSaveTheDate()
})

const loadSaveTheDate = async () => {
  try {
    loading.value = true
    const response = await stdStore.getEventStd()

    if (response.status === 200) {
      stdStore.initStd(response?.data?.data ?? {})
    } else {
      console.log('Oops, something went wrong!')
    }
  } catch (err) {
    console.log(err)
  } finally {
    loading.value = false
  }
}

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
        v-if="loading"
        :loaderClasses="'w-full flex flex-row justify-center items-center'"
        :loader-fill="'fill-gray-800'"
      />
      <div
        v-else
        class="flex flex-row gap-x-4 "
      >
        <CreateUpdateStd
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
