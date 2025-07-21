<script setup>
import { computed, ref } from 'vue'

const showDressCodePopup = ref(false)
const showColorsPopup = ref(false)

const dressCodeConfig = computed(() => {
  return {
    backgroundColor: '#ffe2b1',
    isEnabled: true,
    title: 'Codigo de Vestir',
    subTitle: 'Estilo Sugerido, Formal para Esta Ocación Especial'
  }
})
</script>

<template>
<section
  v-if="dressCodeConfig.isEnabled"
  class="dress-code w-full min-h-screen flex flex-col justify-evenly items-center p-4 md:p-8 lg:p-20"
>
  <div class="dc-titles mb-6 md:mb-0 md:h-[20%] text-center">
    <h2 class="text-6xl md:text-5xl lg:text-6xl font-gvibes font-bold text-purple-middle" v-if="dressCodeConfig.title">
      {{ dressCodeConfig.title }}
    </h2>
  </div>

  <div
    class="w-full flex flex-col md:flex-row justify-center md:justify-between items-center gap-8 md:gap-4"
  >
    <div class="dress-image-container w-full md:w-1/3 flex flex-col items-center">
      <h3 class="text-2xl md:text-3xl text-dark-blue font-quicksand font-bold mb-4 text-center">
        {{ dressCodeConfig.subTitle }}
      </h3>
      <div class="relative max-w-[500px] w-full mx-auto h-[350px] flex items-center justify-center">
        <img
          src="@/assets/images/external/dress-code.jpg"
          alt="Formal Male Attire"
          class="dress-code-image rounded-lg shadow-lg cursor-pointer max-w-full h-auto mx-auto object-contain max-h-[350px]"
          @click="showDressCodePopup = true"
        >
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
      <h3 class="text-2xl md:text-3xl text-dark-blue font-quicksand font-bold mb-4 text-center">
        Colores reservados para la Quinceañera
      </h3>
      <div class="relative max-w-[500px] w-full mx-auto h-[350px] flex items-center justify-center">
        <img
          src="@/assets/images/external/dress-colors.png"
          alt="Formal Female Attire"
          class="dress-code-image rounded-lg shadow-lg cursor-pointer max-w-full h-auto mx-auto object-contain max-h-[350px]"
          @click="showColorsPopup = true"
        >
        <div v-if="showColorsPopup" class="popup-overlay" @click="showColorsPopup = false">
          <div class="popup-content" @click.stop>
            <h3 class="popup-title">Colores Reservados</h3>
            <p class="popup-text text-dark-blue">
              Los colores reservados para la quinceañera son <span class="reserved-color gold">Gold</span> y
              <span class="reserved-color lavender">Lavanda</span>. Por favor, evite usar estos colores en su vestimenta.
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
