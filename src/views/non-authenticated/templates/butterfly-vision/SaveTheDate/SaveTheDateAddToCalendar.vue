<script setup>
import 'add-to-calendar-button';
import { atcb_action } from 'add-to-calendar-button'
import { computed, ref } from 'vue'

const props = defineProps({
  buttonStyle: {
    type: Object,
    required: true
  }
})

const isHovered = ref(false)

const config = {
  label: "Melissa Quince's",
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

const buttonStyle = computed(() => ({
  fontFamily: props.buttonStyle.font || 'inherit',
  color: isHovered.value
    ? 'white'
    : props.buttonStyle.fontColor || 'inherit',
  backgroundColor: isHovered.value
    ? props.buttonStyle.hoverColor || 'inherit'
    : props.buttonStyle.bgColor || 'inherit',
  hoverColor: props.buttonStyle.hoverColor || 'inherit',
  rounded: props.buttonStyle.rounded || 'inherit',
  borderColor: isHovered.value
    ? props.buttonStyle.hoverColor || 'inherit'
    : props.buttonStyle.borderColor || 'inherit',
  borderRadius: props.buttonStyle.borderRadius || 'inherit'
}));

</script>

<template>
  <div>
    <button
      class="px-10 py-4 border-2 font-bold"
      :style="buttonStyle"
      @click="handleClick"
      @mouseover="isHovered = true"
      @mouseout="isHovered = false"
    >
      Add to Calendar
    </button>
  </div>
</template>

<style scoped>

</style>
