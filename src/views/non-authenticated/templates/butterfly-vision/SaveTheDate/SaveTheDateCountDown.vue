<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  numbers: {
    type: Object,
    required: true
  },
  text: {
    type: Object,
    required: true
  }
})



// Function to calculate the time left
const calculateTimeLeft = () => {
  const eventDate = new Date('2025-09-27T12:00:00-04:00').getTime();
  const now = new Date().getTime();
  const distance = eventDate - now;

  if (distance < 0) {
    return { days: '00', hours: '00', minutes: '00', seconds: '00' };
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  return {
    days: days.toString().padStart(2, '0'),
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0')
  };
};

// Reactive state for time left
const timeLeft = ref(calculateTimeLeft());

// Timer variable
let timer = null;

// Lifecycle hooks
onMounted(() => {
  // Update time left every second
  timer = setInterval(() => {
    timeLeft.value = calculateTimeLeft();
  }, 1000);
});

// Cleanup timer on component unmount
onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});

const generateStyle = (styles) => ({
  fontFamily: styles.font || 'inherit',
  color: styles.color || 'inherit',
  fontSize: styles.size || 'inherit',
  fontStyle: styles.style || 'normal',
  fontWeight: styles.weight || 'normal',  // Add more styles if needed
  letterSpacing: styles.letterSpacing || 'normal',
});


</script>

<template>
  <div class="counter-time flex items-center justify-center gap-10">
    <div class="flex flex-col items-center gap-2">
      <p :style="generateStyle(numbers)">{{ timeLeft.days }}</p>
      <p :style="generateStyle(text)">Days</p>
    </div>

    <div class="flex flex-col items-center gap-2">
      <p :style="generateStyle(numbers)">{{ timeLeft.hours }}</p>
      <p :style="generateStyle(text)">Hours</p>
    </div>

    <div class="flex flex-col items-center gap-2">
      <p :style="generateStyle(numbers)">{{ timeLeft.minutes }}</p>
      <p :style="generateStyle(text)">Mins</p>
    </div>

    <div class="flex flex-col items-center gap-2">
      <p :style="generateStyle(numbers)">{{ timeLeft.seconds }}</p>
      <p :style="generateStyle(text)">Secs</p>
    </div>
  </div>
</template>

<style scoped>
/* Add your styles here if needed */
</style>
