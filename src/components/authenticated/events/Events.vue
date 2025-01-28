<script setup>
import MyEvents from '@/components/authenticated/events/MyEvents.vue'
import SaveTheDate from '@/components/authenticated/save-the-date/SaveTheDate.vue'
import { useEventsStore } from '@/stores/useEventsStore'
import { computed } from 'vue'
import { useSTDStore } from '@/stores/useSTDStore'

const eventStore = useEventsStore()
const stdStore = useSTDStore()

const showSaveTheDate = computed(() =>  {
  return !!(eventStore.currentEvent && stdStore.isEnabled);
})

</script>

<template>
  <div class="container pb-10">
    <MyEvents />

    <SaveTheDate
      v-if="showSaveTheDate"
    />
  </div>
</template>
