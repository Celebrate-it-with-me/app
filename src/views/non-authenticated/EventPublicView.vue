<script setup>
import { useRoute } from 'vue-router'
import { onMounted, ref } from 'vue'
import CWMLoadingPage from '@/components/UI/loading/CWMLoadingPage.vue'
import { useTemplateStore } from '@/stores/useTemplateStore'
import MainLayout from '@/views/non-authenticated/templates/butterfly-vision/MainLayout.vue'

const route = useRoute()
const loading = ref(false)
const templateStore = useTemplateStore()


onMounted(async () => {
  const { eventId, guestCode  } = route.params
  await getEventData(eventId, guestCode)
})

const getEventData = async (eventId, guestCode) => {
  try {
    loading.value = true
    const response = await templateStore.getEventData({eventId, guestCode})

    if (response.status === 200) {
      const { event, mainGuest } = response.data.data ?? {}

      templateStore.event = event
      templateStore.event.mealsAvailable = [
        { value: 1, text: 'Chicken Soup' },
        { value: 2, text: 'Motton Kabab' },
        { value: 3, text: 'Chicken BBQ' },
        { value: 4, text: 'Mix Salad' },
        { value: 5, text: 'Beef Ribs' }
      ]
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
  <CWMLoadingPage
    v-if="loading"
  />

  <MainLayout v-if="!loading && templateStore.event" />
</template>

<style scoped>

</style>
