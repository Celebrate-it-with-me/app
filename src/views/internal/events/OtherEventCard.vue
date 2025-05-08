<script setup>
import CCard from '@/components/UI/cards/CCard.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import { ref } from 'vue'

const emit = defineEmits(['switchEvent'])
const props = defineProps({
  event: {
    type: Object,
    required: true
  }
})

const switchToEvent = (event) => {
  emit('switchEvent', event)
}

const openMenu = ref(null)

const toggleMenu = () => {
  openMenu.value = !openMenu.value
}

const isActiveEvent = (id) => {
  return id === eventStore.activeEvent?.id
}

const editEvent = (event) => {
  if (isActiveEvent(event.id)) {
    router.push({ name: 'edit-event', params: { id: event.id } })
  }
}

const archiveEvent = (event) => {
  if (!isActiveEvent(event.id)) {
    console.log('Archiving', event.id)
  }
}

const cancelEvent = (event) => {
  if (!isActiveEvent(event.id)) {
    console.log('Cancelling', event.id)
  }
}


</script>

<template>
  <CCard
    variant="feature"
  >
    <div class="relative">
      <div class="absolute z-10 card-menu">
        <button @click="toggleMenu()" class="text-lg text-gray-500 hover:text-primary focus:outline-none">
          ⋮
        </button>
        <div
          v-if="openMenu"
          class="absolute right-0 mt-2 w-36 bg-white rounded-md shadow-lg border border-gray-200"
        >
          <ul class="text-sm text-gray-700">
            <li>
              <button
                @click="archiveEvent"
                class="w-full text-left px-4 py-2 hover:bg-gray-100"
                :disabled="isActiveEvent"
              >
                Archive
              </button>
            </li>
            <li>
              <button
                @click="cancelEvent"
                class="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                :disabled="isActiveEvent"
              >
                Cancel
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <template #title>{{ event.eventName }}</template>
    <template #content>
      <p class="text-sm text-text-light line-clamp-3">{{ event.eventDescription }}</p>
      <p class="text-xs text-gray-400 mt-1 mb-2">
        {{ event.startDate }} – {{ event.endDate }}
      </p>
    </template>
    <template #cta>
      <CButton
        variant="outline"
        @click="switchToEvent(event)"
      >Switch to Active</CButton>
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
