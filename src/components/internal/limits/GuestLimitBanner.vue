<script setup>
import { computed, onMounted } from 'vue'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { guestOverflow } from '@/utils/planLimit'
import GuestLimitNotice from './GuestLimitNotice.vue'

/** On the guests page: shown only while the list is over the plan's limit. */
const eventsStore = useEventsStore()
const overflow = computed(() => guestOverflow(eventsStore.activeEvent))

// The count the event was loaded with can be old (guests are added and removed on this very page): refresh it.
onMounted(() => {
  const id = eventsStore.activeEvent?.id
  if (id) eventsStore.fetchEvent(id).catch(() => {})
})
</script>

<template>
  <GuestLimitNotice v-if="overflow" :info="overflow" variant="banner" />
</template>
