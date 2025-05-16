<script setup>
import CCard from '@/components/UI/cards/CCard.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const props = defineProps({
  activeEvent: {
    type: Object,
    required: true
  }
})

const goToEvent = async () => {
  await router.push({ name: 'edit-event', params: { id: props.activeEvent.id } })
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

</script>

<template>
  <CCard variant="feature">
    <template #title>{{ activeEvent.eventName }}</template>
    <template #content>
      <p class="text-sm text-text-light">{{ activeEvent.eventDescription }}</p>
      <p class="text-xs text-gray-400 mt-1">
        {{ formatDate(activeEvent.startDate) }} – {{ formatDate(activeEvent.endDate) }}
      </p>
    </template>
    <template #cta>
      <CButton @click="goToEvent">Go to Event</CButton>
    </template>
  </CCard>
</template>

<style scoped>
.card-menu {
  position: absolute;
  top: -9.5rem;
  right: -10px;
  z-index: 10;
}
</style>
