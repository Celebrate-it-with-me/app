<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

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
</script>

<template>
  <div class="counter-time flex items-center justify-center gap-10">
    <div class="flex flex-col items-center gap-2">
      <p class="text-5xl font-light italic">{{ timeLeft.days }}</p>
      <p class="text-xl">Days</p>
    </div>

    <div class="flex flex-col items-center gap-2">
      <p class="text-5xl font-light italic">{{ timeLeft.hours }}</p>
      <p class="text-xl">Hours</p>
    </div>

    <div class="flex flex-col items-center gap-2">
      <p class="text-5xl font-light italic">{{ timeLeft.minutes }}</p>
      <p class="text-xl">Mins</p>
    </div>

    <div class="flex flex-col items-center gap-2">
      <p class="text-5xl font-light italic">{{ timeLeft.seconds }}</p>
      <p class="text-xl">Secs</p>
    </div>
  </div>
</template>

<style scoped>
/* Add your styles here if needed */
</style>
