<script setup>
import 'add-to-calendar-button';
import { atcb_action } from 'add-to-calendar-button'

const config = {
  label: 'My Event',
  name: "[Reminder] Melissa Quince`s Birthday",
  description: "Melissa Quince`s Birthday Party",
  startDate: "2025-01-07",
  startTime: "10:15",
  endTime: "23:30",
  options: ["Google", "iCal", "Apple", "Outlook.com"],
  timeZone: "America/New_York",
}

const handleClick = (e) => {
  e.preventDefault()

  try {
    atcb_action(config)
  } catch (error) {
    console.error(error);
  }
}

</script>

<template>
  <div>
    <button
      class="px-10 py-4 border-2 border-primary rounded-lg text-primary font-bold"
      @click="handleClick"
    >
      Add to Calendar
    </button>
  </div>
</template>

<style scoped>

</style>
