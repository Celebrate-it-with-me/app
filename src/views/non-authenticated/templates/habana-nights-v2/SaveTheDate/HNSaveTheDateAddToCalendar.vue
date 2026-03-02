<script setup>
import 'add-to-calendar-button'
import { atcb_action } from 'add-to-calendar-button'
import { computed, ref } from 'vue'

const props = defineProps({
  buttonStyle: { type: Object, required: true }
})

const isHovered = ref(false)

const config = {
  label: "Isabella Quince's",
  name: '[Reminder] Isabella Quince`s Birthday',
  description: 'Isabella Quince`s Birthday Party',
  startDate: '2026-04-18',
  startTime: '19:00',
  endDate: '2026-04-19',
  endTime: '01:00',
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
  fontFamily: props.buttonStyle.fontFamily || 'inherit',
  color: isHovered.value ? '#0B1220' : props.buttonStyle.fontColor || 'inherit',
  backgroundColor: isHovered.value
    ? props.buttonStyle.hoverColor || 'inherit'
    : props.buttonStyle.bgColor || 'transparent',
  borderColor: isHovered.value
    ? props.buttonStyle.hoverColor || 'inherit'
    : props.buttonStyle.borderColor || 'inherit',
  borderRadius: props.buttonStyle.borderRadius || '12px'
}))
</script>

<template>
  <div class="hn-std-atc">
    <button
      class="hn-std-atc__btn"
      :style="buttonStyle"
      type="button"
      @click="handleClick"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
    >
      <span class="hn-std-atc__shine" />
      <span class="hn-std-atc__label">Adicionar al Calendario</span>
    </button>
  </div>
</template>

<style scoped>
.hn-std-atc {
  display: flex;
  justify-content: center;
}

.hn-std-atc__btn {
  position: relative;
  overflow: hidden;
  padding: 14px 22px;
  border-width: 1px;
  border-style: solid;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 0.78rem;
  min-width: 240px;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    background-color 180ms ease,
    color 180ms ease,
    border-color 180ms ease;
  box-shadow:
    0 18px 45px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(248, 241, 231, 0.08);
}

.hn-std-atc__btn:hover {
  transform: translateY(-1px);
  box-shadow:
    0 22px 60px rgba(0, 0, 0, 0.36),
    inset 0 1px 0 rgba(248, 241, 231, 0.08);
}

.hn-std-atc__shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    120deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.2) 18%,
    rgba(255, 255, 255, 0) 36%
  );
  transform: translateX(-120%);
  transition: transform 550ms ease;
  pointer-events: none;
}

.hn-std-atc__btn:hover .hn-std-atc__shine {
  transform: translateX(120%);
}

.hn-std-atc__label {
  position: relative;
  z-index: 1;
}
</style>
