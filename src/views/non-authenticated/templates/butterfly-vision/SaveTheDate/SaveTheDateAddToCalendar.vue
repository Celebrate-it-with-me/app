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

// Esta configuración detecta automáticamente la plataforma
const config = {
  name: "[Reminder] Melissa XV's Birthday Party",
  description: "Melissa XV's Birthday Party",
  startDate: "2025-07-27",
  startTime: "18:45",
  endDate: "2025-07-27",
  endTime: "23:59",
  options: ["Google", "iCal", "Apple", "Outlook.com", "Yahoo"],
  timeZone: "America/New_York",
  iCalFileName: "Melissa-Birthday",
  listStyle: "overlay",
  trigger: "click",

  bypassWebViewCheck: true,

  clientsupport: {
    ios: true,
    android: true,
    desktop: true
  },

  buttonStyle: "date",

  symbols: {
    google: true,
    apple: true,
    ical: true,
    outlook: true,
    yahoo: true
  },

  customLabels: {
    close: "Cerrar",
    calendarLabel: "Calendario"
  }
}

const handleClick = (e) => {
  e.preventDefault()

  try {
    atcb_action(config)
  } catch (error) {
    console.error('Error al abrir el calendario:', error);
    fallbackCalendarAction();
  }
}

const fallbackCalendarAction = () => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  const formatDate = (date, time) => {
    const dt = new Date(`${date}T${time}`);
    return dt.toISOString().replace(/-|:|\.\d+/g, '');
  };

  const start = formatDate(config.startDate, config.startTime);
  const end = formatDate(config.endDate, config.endTime);

  let calendarUrl;

  if (isIOS) {
    calendarUrl = `webcal://p44-caldav.icloud.com/published/2/MTAwMjYyNTMxODUxMDI2MsU4U5OuUG_PZoIwFQzMyyYx4mNkz2r-9QQN5FAAjmYIz4tYAB4-v7wRXvHYQ-qcKYhSADOtl_BsLORVNb8`;
  } else if (isAndroid) {
    calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(config.name)}&details=${encodeURIComponent(config.description)}&dates=${start}/${end}&ctz=${config.timeZone}`;
  } else {
    calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(config.name)}&details=${encodeURIComponent(config.description)}&dates=${start}/${end}&ctz=${config.timeZone}`;
  }

  window.open(calendarUrl, '_blank');
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
:global(.atcb-initialized) {
  position: relative;
  z-index: 100;
}

:global(.atcb-dropdown-anchor) {
  position: relative;
}
</style>
