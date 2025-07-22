<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import MargaritaGif from '@/assets/images/Itinerario/margarita.gif'
import CeremonyGif from '@/assets/images/Itinerario/ceremony.gif'
import FoodGif from '@/assets/images/Itinerario/food-delivery.gif'
import DanceGif from '@/assets/images/Itinerario/dance.gif'
import DanceFloor from '@/assets/images/Itinerario/dance-floor.gif'

// Imagen de fondo
import itinerarioBg from '@/assets/images/img/itinerario_bg_2.jpg'

// Referencias para el parallax
const backgroundRef = ref(null)
let ticking = false

// Parallax cross-device - solo para el fondo
const handleParallax = () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      if (backgroundRef.value) {
        const scrolled = window.scrollY
        const speed = 0.2 // Fondo muy lento
        const yPos = scrolled * speed
        backgroundRef.value.style.transform = `translate3d(0, ${yPos}px, 0)`
      }
      ticking = false
    })
    ticking = true
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleParallax, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleParallax)
})
</script>

<template>
  <section id="sectionItinerario" class="itinerario-section">
    <div
      ref="backgroundRef"
      class="background-image"
      :style="{ backgroundImage: `url(${itinerarioBg})` }"
    ></div>

    <div class="timeline-wrapper">
      <div class="timeline-container">
        <h2 class="timeline-title text-5xl text-purple-middle">Itinerario</h2>

        <div class="timeline-line"></div>

        <div class="timeline-content">

          <div class="timeline-item timeline-item-right">
            <div class="timeline-icon-wrapper">
              <img :src="MargaritaGif" alt="Cocktail" class="timeline-icon" />
            </div>
            <div class="timeline-number">1</div>
            <div class="timeline-card">
              <h3>Cocktail</h3>
              <p>7:00pm-8:00pm</p>
            </div>
          </div>

          <div class="timeline-item timeline-item-left">
            <div class="timeline-icon-wrapper">
              <img :src="CeremonyGif" alt="Ceremonia" class="timeline-icon" />
            </div>
            <div class="timeline-number">2</div>
            <div class="timeline-card">
              <h3>Ceremonia</h3>
              <p>8:00pm-9:00pm</p>
            </div>
          </div>

          <div class="timeline-item timeline-item-right">
            <div class="timeline-icon-wrapper">
              <img :src="FoodGif" alt="Cena" class="timeline-icon" />
            </div>
            <div class="timeline-number">3</div>
            <div class="timeline-card">
              <h3>Cena</h3>
              <p>9:00pm-9:40pm</p>
            </div>
          </div>

          <div class="timeline-item timeline-item-left">
            <div class="timeline-icon-wrapper">
              <img :src="DanceGif" alt="Baile Sorpresa" class="timeline-icon" />
            </div>
            <div class="timeline-number">4</div>
            <div class="timeline-card">
              <h3>A Bailar!</h3>
              <p>9:40pm-10:00pm</p>
            </div>
          </div>

          <div class="timeline-item timeline-item-right">
            <div class="timeline-icon-wrapper">
              <img :src="DanceFloor" alt="Hora Loca" class="timeline-icon" />
            </div>
            <div class="timeline-number">5</div>
            <div class="timeline-card">
              <h3>Hora Loca</h3>
              <p>10:30pm</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.itinerario-section {
  position: relative;
  width: 100%;
  min-height: calc(100vh + 20px);
  overflow: hidden;
  padding: 10px 0;
}

.background-image {
  position: absolute;
  top: -50%;
  left: 0;
  width: 100%;
  height: 200%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  will-change: transform;
  z-index: 1;
}

.timeline-wrapper {
  position: absolute;
  top: 10px;
  left: 0;
  right: 0;
  bottom: 10px;
  width: 100%;
  height: calc(100% - 20px);
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(0.5px);
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.timeline-container {
  position: relative;
  width: 100%;
  max-width: 600px;
  height: 100%;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(2px);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.timeline-title {
  text-align: center;
  font-weight: bold;
  margin-bottom: 2rem;
  font-family: 'Great Vibes', cursive;
}

.timeline-line {
  position: absolute;
  left: 50%;
  top: 4rem;
  bottom: 1rem;
  width: 2px;
  background: rgba(107, 114, 128, 0.7);
  transform: translateX(-50%);
  z-index: 1;
}

.timeline-content {
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
}

.timeline-item {
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
  justify-content: center;
  flex: 1;
}

.timeline-item-right .timeline-icon-wrapper {
  position: absolute;
  left: 25%;
  transform: translateX(-50%);
}

.timeline-item-right .timeline-number {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
}

.timeline-item-right .timeline-card {
  position: absolute;
  left: calc(50% + 2rem);
}

.timeline-item-left .timeline-card {
  position: absolute;
  right: calc(50% + 2rem);
}

.timeline-item-left .timeline-number {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
}

.timeline-item-left .timeline-icon-wrapper {
  position: absolute;
  right: 25%;
  transform: translateX(50%);
}

.timeline-icon-wrapper {
  width: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.timeline-icon {
  width: 5rem;
  height: 5rem;
  border-radius: 0.5rem;
  object-fit: cover;
}

.timeline-number {
  width: 2rem;
  height: 2rem;
  background: #1f2937;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.125rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.timeline-card {
  background: rgba(186, 167, 251, 0.9);
  border-radius: 0.5rem;
  padding: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  min-width: 140px;
  max-width: 200px;
  flex-shrink: 0;
}

.timeline-card h3 {
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.25rem;
  font-size: 1.125rem;
}

.timeline-card p {
  color: #1f2937;
  font-size: 0.875rem;
  margin: 0;
}

@media (max-width: 768px) {
  .timeline-wrapper {
    padding: 1rem;
  }

  .timeline-container {
    padding: 1rem;
  }

  .timeline-icon {
    width: 5rem;
    height: 5rem;
  }

  .timeline-icon-wrapper {
    width: 64px;
  }

  .timeline-card {
    min-width: 150px;
  }
}
</style>
