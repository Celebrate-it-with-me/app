<script setup>
import { useRoute } from 'vue-router'
import { onMounted, ref } from 'vue'
import CWMLoadingPage from '@/components/UI/loading/CWMLoadingPage.vue'

const route = useRoute()
const eventData = ref()
const loading = ref(false)
const templateStore = useTemplateStore()


onMounted(async () => {
  const { eventSlug, eventId, guestCode  } = route.params

  await getEventData(eventId, guestCode)
})

const getEventData = async (eventId, guestCode) => {
  try {
    loading.value = true

    const response = await templateStore.getEventData(eventId, guestCode)
    // todo Continue here...
    if (response.status === 200) {
      console.log(response)
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
  <div class="new-page">
    Testing views
  </div>
</template>

<style scoped>

</style>
