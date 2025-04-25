<script setup>
import CreateUpdateStd from '@/components/internal/save-the-date/CreateUpdateSTD.vue'
import STDPreview from '@/components/internal/save-the-date/STDPreview.vue'
import { onMounted, ref } from 'vue'
import CHeading from '@/components/UI/headings/CHeading.vue'
import CLoading from '@/components/UI/loading/CLoading.vue'
import { useSaveTheDateStore } from '@/stores/useSaveTheDateStore'

const stdConfig = ref(null)
const loading = ref(false)
const stdStore = useSaveTheDateStore()

const handleUpdateStd = (newConfig) => {
  stdConfig.value = newConfig
}

onMounted(() => {
  console.log('std mounted')
  loadSaveTheDate()
})

const loadSaveTheDate = async () => {
  stdStore.cleanStd()
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
  <section>
    <div class="flex items-center justify-between mb-6">
      <CHeading :level="2" weight="semibold">Save the Date</CHeading>
    </div>

    <div class="overflow-x-auto">
      <CLoading v-if="loading" :size="12" />

      <div v-else class="flex flex-col gap-10">
        <CreateUpdateStd @updated-std="handleUpdateStd" />

        <STDPreview :std-config="stdConfig" />
      </div>
    </div>
  </section>
</template>


<style scoped></style>
