<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import CWMSuggestedMusic from '@/views/non-authenticated/templates/butterfly-vision/SuggestedMusic/CWMSuggestedMusic.vue'
import { useTemplateStore } from '@/stores/useTemplateStore'

// Imagen de fondo - usando la ruta directa como fallback
import backgroundImage from '@/assets/images/meli-bote.JPG'

const templateStore = useTemplateStore()

// Para debugging - verificar que la imagen se carga
const bgImageUrl = backgroundImage || '@/assets/images/meli-bote.JPG'
console.log('Background image URL:', bgImageUrl)

// Referencias para el parallax
const backgroundRef = ref(null)
let ticking = false

// Parallax cross-device (compatible con iOS)
const handleParallax = () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      if (backgroundRef.value) {
        const scrolled = window.scrollY
        const speed = 0.3 // Velocidad notable del parallax
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

const suggestedMusic = computed(() => {
  return {
    isEnabled: true,
    backgroundColor: 'transparent', // IMPORTANTE: Transparente para no tapar nuestro fondo
    title: 'Sugerencia de Canciones',
    subTitle: 'Envienos sus canciones preferidas para usarlas en el evento',
    mainColor: '#f3a40a',
    secondaryColor: '#B3A383FF',
    usePreview: true,
    useVoteSystem: true
  }
})
</script>

<template>
  <section
    id="sectionSong"
    v-if="suggestedMusic?.isEnabled"
    class="suggested-music-section"
  >
    <!-- Imagen de fondo con parallax solo para iOS (fallback) -->
    <div
      ref="backgroundRef"
      class="background-image-ios"
      :style="{
        backgroundImage: `url(${bgImageUrl})`,
        display: 'none'
      }"
    ></div>

    <!-- Contenido principal -->
    <div class="content-wrapper">
      <div class="content-container">
        <CWMSuggestedMusic
          :mode="'normal'"
          :event="templateStore.event"
          :title="suggestedMusic.title"
          :sub-title="suggestedMusic.subTitle"
          :main-color="suggestedMusic.mainColor"
          :secondary-color="suggestedMusic.secondaryColor"
          :use-preview="suggestedMusic.usePreview"
          :use-vote-system="suggestedMusic.useVoteSystem"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Sección principal - con fondo directo */
.suggested-music-section {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background-image: url('@/assets/images/meli-bote.JPG');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed; /* Parallax nativo para desktop */
}

/* Imagen de fondo solo para iOS - oculta por defecto */
.background-image-ios {
  position: absolute;
  top: -50%;
  left: 0;
  width: 100%;
  height: 200%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  will-change: transform;
  z-index: -1;
}

/* Detectar iOS y mostrar parallax personalizado */
@supports (-webkit-touch-callout: none) {
  .suggested-music-section {
    background-attachment: scroll !important;
  }

  .background-image-ios {
    display: block !important;
  }
}

/* Wrapper del contenido - forzar ancho completo */
.content-wrapper {
  position: absolute;
  top: 0;
  left: 10px;
  right: 10px;
  bottom: 0;
  width: calc(100vw - 20px);
  min-height: 100vh;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch; /* Estirar contenido horizontalmente */
  padding: 2rem 0;
  background: transparent;
}

/* Container del contenido - forzar ancho completo */
.content-container {
  width: 100% !important;
  max-width: none !important;
  background: transparent;
  border-radius: 1rem;
  padding: 1rem;
  margin: 0;
  box-sizing: border-box;
}

/* Forzar que el componente hijo use todo el ancho */
.content-container :deep(*) {
  max-width: none !important;
  width: 100% !important;
}

/* Responsive - mantener los 10px en todos los tamaños */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 1rem 0; /* Solo padding vertical */
  }

  .content-container {
    padding: 1rem;
  }
}

@media (min-width: 768px) {
  .content-wrapper {
    padding: 2rem 0; /* Solo padding vertical */
  }

  .content-container {
    padding: 1.5rem;
  }
}

@media (min-width: 1200px) {
  .content-wrapper {
    padding: 3rem 0; /* Solo padding vertical */
  }

  .content-container {
    padding: 2rem;
  }
}
</style>
