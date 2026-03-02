<script setup>
import 'add-to-calendar-button'
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
  label: "Isabella Pareja Quince's",
  name: '[Reminder] Isabella Quince`s Birthday',
  description: 'Isabella Quince`s Birthday Party',
  startDate: '2026-03-14',
  startTime: '10:15',
  endTime: '23:30',
  options: ['Google', 'iCal', 'Apple', 'Outlook.com'],
  timeZone: 'America/New_York'
}

const handleClick = e => {
  e.preventDefault()

  try {
    atcb_action(config)
  } catch (error) {
    console.error(error)
  }
}

const buttonStyle = computed(() => ({
  fontFamily: props.buttonStyle.font || 'inherit',
  color: props.buttonStyle.fontColor || 'inherit',
  background: isHovered.value
    ? 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 50%, #e0f2fe 100%)'
    : props.buttonStyle.bgColor || 'inherit',
  borderRadius: props.buttonStyle.borderRadius || 'inherit',
  border: 'none',
  boxShadow: isHovered.value
    ? '0 8px 25px rgba(255, 255, 255, 0.4), inset 0 0 15px rgba(255, 255, 255, 0.6)'
    : props.buttonStyle.boxShadow || 'none',
  transform: isHovered.value ? 'translateY(-2px)' : 'none',
  transition: props.buttonStyle.transition || 'all 0.3s ease',
  cursor: 'pointer'
}))
</script>

<template>
  <div>
    <button
      class="px-10 py-4 font-bold"
      :style="buttonStyle"
      @click="handleClick"
      @mouseover="isHovered = true"
      @mouseout="isHovered = false"
    >
      Adicionar al Calendario
    </button>
  </div>
</template>

<style scoped></style>
