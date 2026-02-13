<script setup>
import { useRoute } from 'vue-router'
import { onMounted, ref } from 'vue'
import CWMLoadingPage from '@/components/UI/loading/CWMLoadingPage.vue'
import { useTemplateStore } from '@/stores/publicEvents/useTemplateStore'
import CFMainLayout from '@/views/non-authenticated/templates/cuban-flow/CFMainLayout.vue'

const route = useRoute()
const loading = ref(true)
const templateStore = useTemplateStore()

onMounted(async () => {
  let eventId = 6
  const { guestCode } = route.params

  await getEventData(eventId, guestCode)
})

const getEventData = async (eventId, guestCode) => {
  try {
    loading.value = true
    const response = await templateStore.getEventData({ eventId, guestCode })

    if (response.status === 200) {
      const { event, mainGuest } = response.data.data ?? {}

      templateStore.event = event
      templateStore.guest = mainGuest
    }
  } catch (e) {
    console.log(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Suspense>
    <template #default>
      <CFMainLayout v-if="!loading" :key="templateStore.event?.id" />
    </template>
    <template #fallback>
      <CWMLoadingPage v-if="loading" />
    </template>
  </Suspense>
</template>

<style scoped></style>
