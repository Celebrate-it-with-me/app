<script setup>
import CreateUpdateStd from '@/components/internal/save-the-date/CreateUpdateSTD.vue'
import STDPreview from '@/components/internal/save-the-date/STDPreview.vue'
import { onMounted, ref } from 'vue'
import CHeading from '@/components/UI/headings/CHeading.vue'
import CLoading from '@/components/UI/loading/CLoading.vue'
import { useSaveTheDateStore } from '@/stores/useSaveTheDateStore'

const loading = ref(false)
const stdStore = useSaveTheDateStore()

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

    <div>
      <CLoading v-if="loading" :size="12" />

      <div class="std-container flex flex-col gap-6 md:gap-10">
        <CreateUpdateStd />

        <STDPreview />
      </div>
    </div>
  </section>
</template>

<style scoped></style>
