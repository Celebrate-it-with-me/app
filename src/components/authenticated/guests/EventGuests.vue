<script setup >
import CreateUpdateGuest from '@/components/authenticated/guests/CreateUpdateGuest.vue'
import EventGuestList from '@/components/authenticated/guests/EventGuestList.vue'
import { ref } from 'vue'

const activeView = ref('list')

const handleShowAddGuest = () => {
  activeView.value = 'create-update'
}

const handleShowGuestList = () => {
  activeView.value = 'list'
}

</script>

<template>
  <section class="event-std">
    <div
      class="my-events-container mt-2 border-2 border-gray-200/10 p-10 rounded-md min-h-[300px] h-full"
    >
      <EventGuestList
        v-if="activeView === 'list'"
        @show-add-guest="handleShowAddGuest"
      />

      <CreateUpdateGuest
        v-else-if="activeView === 'create-update'"
        @show-guest-list="handleShowGuestList"
      />
    </div>
  </section>
</template>

<style scoped>

</style>
