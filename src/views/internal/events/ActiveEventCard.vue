<script setup>
import CCard from '@/components/UI/cards/CCard.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { useEventsStore } from '@/stores/useEventsStore'

const router = useRouter()
const props = defineProps({
  activeEvent: {
    type: Object,
    required: true
  }
})

const eventStore = useEventsStore()
const goToDashboard = async () => {
  await router.push('/dashboard')
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const openMenu = ref(null)

const toggleMenu = () => {
  openMenu.value = !openMenu.value
}

const isActiveEvent = (id) => {
  return id === eventStore.activeEvent?.id
}

const editEvent = async () => {
  console.log('Editing event:', props.activeEvent.id)
  if (isActiveEvent(props.activeEvent.id)) {
    await router.push({ name: 'edit-event', params: { id: props.activeEvent.id } })
  }
}

</script>

<template>
  <CCard variant="feature">

    <div class="relative">
      <div class="absolute z-10 card-menu">
        <button @click="toggleMenu()" class="text-xl text-gray-500 hover:text-primary focus:outline-none">
          ⋮
        </button>
        <div
          v-if="openMenu"
          class="absolute right-0 mt-2 w-36 bg-white rounded-md shadow-lg border border-gray-200"
        >
          <ul class="text-sm text-gray-700">
            <li>
              <button
                @click="editEvent()"
                class="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
                :disabled="!isActiveEvent"
                type="button"
              >
                Edit
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <template #title>{{ activeEvent.eventName }}</template>
    <template #content>
      <p class="text-sm text-text-light">{{ activeEvent.eventDescription }}</p>
      <p class="text-xs text-gray-400 mt-1">
        {{ formatDate(activeEvent.startDate) }} – {{ formatDate(activeEvent.endDate) }}
      </p>
    </template>
    <template #cta>
      <CButton @click="goToDashboard">Go to Dashboard</CButton>
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
