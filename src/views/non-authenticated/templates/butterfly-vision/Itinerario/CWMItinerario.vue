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
  <section class="itinerario-section">
    <!-- Imagen de fondo con parallax -->
    <div
      ref="backgroundRef"
      class="background-image"
      :style="{ backgroundImage: `url(${itinerarioBg})` }"
    ></div>

    <!-- Timeline wrapper con transparencia -->
    <div class="timeline-wrapper">
      <div class="timeline-container">
        <!-- Título -->
        <h2 class="timeline-title">Itinerario</h2>

        <!-- Línea central -->
        <div class="timeline-line"></div>

        <!-- Timeline items -->
        <div class="timeline-content">

          <!-- Step 1 - Cocktail -->
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

          <!-- Step 2 - Ceremonia -->
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

          <!-- Step 3 - Cena -->
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

          <!-- Step 4 - Baile Sorpresa -->
          <div class="timeline-item timeline-item-left">
            <div class="timeline-icon-wrapper">
              <img :src="DanceGif" alt="Baile Sorpresa" class="timeline-icon" />
            </div>
            <div class="timeline-number">4</div>
            <div class="timeline-card">
              <h3>Baile Sorpresa</h3>
              <p>9:40pm-10:00pm</p>
            </div>
          </div>

          <!-- Step 5 - Hora Loca -->
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
/* Sección principal - más altura */
.itinerario-section {
  position: relative;
  width: 100%;
  min-height: calc(100vh + 20px); /* 10px arriba y 10px abajo */
  overflow: hidden;
  padding: 10px 0; /* Espaciado arriba y abajo */
}

/* Imagen de fondo con parallax - cubrir desde arriba */
.background-image {
  position: absolute;
  top: -50%;
  left: 0;
  width: 100%;
  height: 200%; /* Más altura para cubrir completamente */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  will-change: transform;
  z-index: 1;
}

/* Wrapper del timeline - 10px arriba y abajo */
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

/* Container del timeline - volver a opacidad original */
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

/* Título */
.timeline-title {
  text-align: center;
  font-size: 3rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 2rem;
  font-family: 'Great Vibes', cursive;
}

/* Línea central - cubrir todo el contenido */
.timeline-line {
  position: absolute;
  left: 50%;
  top: 4rem; /* Después del título */
  bottom: 1rem; /* Hasta casi abajo */
  width: 2px;
  background: rgba(107, 114, 128, 0.7);
  transform: translateX(-50%);
  z-index: 1;
}

/* Contenido del timeline - distribuir verticalmente */
.timeline-content {
  position: relative;
  z-index: 2;
  flex: 1; /* Tomar todo el espacio disponible */
  display: flex;
  flex-direction: column;
  justify-content: space-evenly; /* Distribuir uniformemente */
}

/* Item del timeline - sin margin bottom fijo */
.timeline-item {
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
  justify-content: center;
  flex: 1; /* Cada item toma espacio igual */
}

/* Lado derecho: Icono centrado en la mitad izquierda */
.timeline-item-right .timeline-icon-wrapper {
  position: absolute;
  left: 25%; /* Un cuarto del ancho total */
  transform: translateX(-50%); /* Centrar el icono */
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

/* Lado izquierdo: Icono centrado en la mitad derecha */
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
  right: 25%; /* Un cuarto del ancho total desde la derecha */
  transform: translateX(50%); /* Centrar el icono */
}

/* Wrapper del icono - más grande */
.timeline-icon-wrapper {
  width: 80px; /* Aumentado de 64px a 80px */
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

/* Iconos - más grandes */
.timeline-icon {
  width: 5rem; /* Aumentado de 4rem a 5rem */
  height: 5rem; /* Aumentado de 4rem a 5rem */
  border-radius: 0.5rem;
  object-fit: cover;
}

/* Números - centrados en la línea como imagen 1 */
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

/* Cards - ajustar tamaño */
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

/* Responsive */
@media (max-width: 768px) {
  .timeline-wrapper {
    padding: 1rem;
  }

  .timeline-container {
    padding: 1rem;
  }

  .timeline-title {
    font-size: 2rem;
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
