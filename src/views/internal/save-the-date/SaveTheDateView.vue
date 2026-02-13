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
  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Page Header -->
    <div class="relative mb-12">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <CHeading
            :level="1"
            weight="black"
            class="text-4xl md:text-5xl text-gray-900 dark:text-white tracking-tight mb-3"
          >
            Save the <span class="text-purple-600 dark:text-purple-400">Date</span>
          </CHeading>
          <p class="text-gray-500 dark:text-gray-400 max-w-xl text-lg leading-relaxed">
            Announce your celebration to your guests. Customize and preview your Save the Date
            notification.
          </p>
        </div>
      </div>
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
