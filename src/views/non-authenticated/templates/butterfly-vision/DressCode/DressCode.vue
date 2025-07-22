<script setup>
import { computed, ref } from 'vue'
import { ZoomIn } from 'lucide-vue-next';

const showDressCodePopup = ref(false)
const showColorsPopup = ref(false)

const dressCodeConfig = computed(() => {
  return {
    backgroundColor: '#ffe2b1',
    isEnabled: true,
    title: 'Codigo de Vestir',
    subTitle: 'Estilo sugerido, "Formal" para esta ocación especial'
  }
})
</script>

<template>
<section
  v-if="dressCodeConfig.isEnabled"
  class="dress-code w-full min-h-screen flex flex-col justify-evenly items-center p-4 md:p-8 lg:p-20"
>
  <div class="dc-titles mb-6 md:mb-0 md:h-[20%] text-center">
    <h2 class="text-5xl md:text-5xl lg:text-6xl font-gvibes font-bold text-purple-middle" v-if="dressCodeConfig.title">
      {{ dressCodeConfig.title }}
    </h2>
  </div>

  <div
    class="w-full flex flex-col md:flex-row justify-center md:justify-between items-center gap-8 md:gap-4"
  >
    <div class="dress-image-container w-full md:w-1/3 flex flex-col items-center">
      <h3 class="text-2xl md:text-3xl text-dark-blue font-quicksand font-semibold mb-4 text-center">
        {{ dressCodeConfig.subTitle }}
      </h3>
      <div class="relative max-w-[500px] w-full mx-auto h-[350px] flex items-center justify-center overflow-hidden">
        <img
          src="@/assets/images/external/dress-code.jpg"
          alt="Formal Male Attire"
          class="dress-code-image rounded-lg shadow-lg cursor-pointer max-w-full h-auto mx-auto object-contain max-h-[350px]"
          @click="showDressCodePopup = true"
        >
        <div class="click-overlay" @click="showDressCodePopup = true">
          <span class="click-text">Haz click para mas detalles</span>
        </div>
        <div class="mobile-indicator">
          <ZoomIn class="zoom-icon" size="14" />
        </div>
        <div v-if="showDressCodePopup" class="popup-overlay" @click="showDressCodePopup = false">
          <div class="popup-content" @click.stop>
            <h3 class="popup-title">Código de Vestir</h3>
            <p class="popup-text text-dark-blue">
              Para esta ocasión especial, se sugiere un estilo formal. Los caballeros pueden optar por trajes o guayaberas elegantes,
              mientras que las damas pueden usar vestidos formales. Recuerden evitar los colores reservados para la quinceañera.
            </p>
            <button class="popup-close" @click="showDressCodePopup = false">Cerrar</button>
          </div>
        </div>
      </div>
    </div>

    <div class="dress-image-container w-full md:w-1/3 flex flex-col items-center">
      <h3 class="text-2xl md:text-3xl text-dark-blue font-quicksand font-semibold mb-4 text-center">
        Colores reservados para la Quinceañera
      </h3>
      <div class="relative max-w-[500px] w-full mx-auto h-[350px] flex items-center justify-center overflow-hidden">
        <img
          src="@/assets/images/external/dress-colors.png"
          alt="Formal Female Attire"
          class="dress-code-image rounded-lg shadow-lg cursor-pointer max-w-full h-auto mx-auto object-contain max-h-[350px]"
          @click="showColorsPopup = true"
        >
        <div class="click-overlay" @click="showColorsPopup = true">
          <span class="click-text">Haz click para mas detalles</span>
        </div>
        <div class="mobile-indicator">
          <ZoomIn class="zoom-icon" size="14" />
        </div>
        <div v-if="showColorsPopup" class="popup-overlay" @click="showColorsPopup = false">
          <div class="popup-content" @click.stop>
            <h3 class="popup-title">Colores Reservados</h3>
            <p class="popup-text text-dark-blue">
              <span class="reserved-color gold">Dorado</span> y <span class="reserved-color lavender">Lavanda</span>
              son los tonos que distinguirán a la quinceañera en su día especial. Agradecemos tu
              comprensión al elegir colores distintos.
            </p>
            <button class="popup-close" @click="showColorsPopup = false">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
</template>

<style scoped>
.dress-code {
  background-color: rgba(208, 181, 244, 0.67);
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.dress-code-image {
  transition: transform 0.3s ease;
}

.dress-code-image:hover {
  transform: scale(1.01);
}

/* Click overlay styles */
.click-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 12px;
}

.click-text {
  color: white;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 4px;
}

.relative:hover .click-overlay {
  opacity: 1;
}

/* Mobile indicator styling */
.mobile-indicator {
  position: absolute;
  bottom: 15px;
  right: 100px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 500;
  z-index: 5;
  align-items: center;
  gap: 4px;
  display: none;
}

/* Show mobile indicator on small screens */
@media screen and (max-width: 640px) {
  .mobile-indicator {
    display: flex;
  }
}

.zoom-icon {
  stroke-width: 2.5;
}

/* Popup Styles */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup-content {
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  position: relative;
  animation: popup-appear 0.3s ease-out;
}

@keyframes popup-appear {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.popup-title {
  font-size: 1.8rem;
  color: #800080;
  margin-bottom: 1rem;
  font-weight: bold;
  text-align: center;
}

.popup-text {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  text-align: center;
}

.popup-close {
  display: block;
  margin: 0 auto;
  padding: 0.5rem 1.5rem;
  background-color: #800080;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.popup-close:hover {
  background-color: #6a006a;
}

/* Reserved Color Styles */
.reserved-color {
  font-weight: bold;
  display: inline-block;
  padding: 0 5px;
}

.gold {
  color: #ffd700;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

.lavender {
  color: #9370db;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

@media (max-width: 640px) {
  .dress-code {
    padding: 1rem;
  }

  .dress-image-container {
    margin-bottom: 1.5rem;
  }

  /* Mobile styles for dress-code-image are now handled by Tailwind classes */
  .relative.max-w-\[500px\] {
    height: 250px !important; /* Smaller height for mobile */
  }

  .dress-code-image {
    max-height: 250px !important; /* Smaller max-height for mobile */
  }

  .popup-content {
    padding: 1.5rem;
    width: 95%;
  }

  .popup-title {
    font-size: 1.5rem;
  }

  .popup-text {
    font-size: 1rem;
  }
}
</style>
