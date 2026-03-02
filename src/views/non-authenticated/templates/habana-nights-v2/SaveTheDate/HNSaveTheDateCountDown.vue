<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

defineProps({
  numbers: { type: Object, required: true },
  text: { type: Object, required: true }
})

const calculateTimeLeft = () => {
  const eventDate = new Date('2026-04-18T12:00:00-04:00').getTime()
  const now = new Date().getTime()
  const distance = eventDate - now

  if (distance < 0) return { days: '00', hours: '00', minutes: '00', seconds: '00' }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24))
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((distance % (1000 * 60)) / 1000)

  return {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0')
  }
}

const timeLeft = ref(calculateTimeLeft())
let timer = null

onMounted(() => {
  timer = setInterval(() => {
    timeLeft.value = calculateTimeLeft()
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const generateStyle = styles => ({
  fontFamily: styles.font || 'inherit',
  color: styles.color || 'inherit',
  fontSize: styles.size || 'inherit',
  fontStyle: styles.style || 'normal',
  fontWeight: styles.weight || 'normal',
  letterSpacing: styles.letterSpacing || 'normal'
})
</script>

<template>
  <div class="hn-std-countdown">
    <div class="hn-std-tile">
      <p class="hn-std-num" :style="generateStyle(numbers)">{{ timeLeft.days }}</p>
      <p class="hn-std-label" :style="generateStyle(text)">DAYS</p>
    </div>

    <div class="hn-std-sep">:</div>

    <div class="hn-std-tile">
      <p class="hn-std-num" :style="generateStyle(numbers)">{{ timeLeft.hours }}</p>
      <p class="hn-std-label" :style="generateStyle(text)">HOURS</p>
    </div>

    <div class="hn-std-sep">:</div>

    <div class="hn-std-tile">
      <p class="hn-std-num" :style="generateStyle(numbers)">{{ timeLeft.minutes }}</p>
      <p class="hn-std-label" :style="generateStyle(text)">MINS</p>
    </div>

    <div class="hn-std-sep">:</div>

    <div class="hn-std-tile">
      <p class="hn-std-num" :style="generateStyle(numbers)">{{ timeLeft.seconds }}</p>
      <p class="hn-std-label" :style="generateStyle(text)">SECS</p>
    </div>
  </div>
</template>

<style scoped>
.hn-std-countdown {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
}

.hn-std-tile {
  min-width: 88px;
  padding: 12px 12px;
  border-radius: 18px;
  border: 1px solid rgba(212, 175, 55, 0.22);
  background: rgba(11, 18, 32, 0.35);
  box-shadow: inset 0 1px 0 rgba(248, 241, 231, 0.06);
  backdrop-filter: blur(10px);
  text-align: center;
}

.hn-std-num {
  line-height: 1;
  text-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
}

.hn-std-label {
  margin-top: 8px;
  text-transform: uppercase;
}

.hn-std-sep {
  color: rgba(212, 175, 55, 0.65);
  font-weight: 700;
  transform: translateY(-8px);
  opacity: 0.85;
}

@media (max-width: 520px) {
  .hn-std-sep {
    display: none;
  }
  .hn-std-countdown {
    gap: 10px;
  }
  .hn-std-tile {
    min-width: 74px;
    padding: 10px 10px;
    border-radius: 16px;
  }
}
</style>
