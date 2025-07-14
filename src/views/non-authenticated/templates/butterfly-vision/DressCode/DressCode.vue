<script setup>
import { computed } from 'vue'

const dressCodeConfig = computed(() => {
  return {
    backgroundColor: '#ffe2b1',
    isEnabled: true,
    title: 'Codigo de Vestimenta',
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

    <h4
      v-if="dressCodeConfig.subTitle"
      class="relative text-lg md:text-2xl font-normal text-dark-blue text-center moments-title mt-2"
    >
      {{ dressCodeConfig.subTitle }}
    </h4>
  </div>

  <div
    class="w-full flex flex-col md:flex-row justify-center md:justify-between items-center gap-8 md:gap-4"
  >
    <div class="dress-image-container w-full md:w-1/3 flex justify-center">
      <img
        src="@/assets/images/external/gallery-1.jpg"
        alt="Formal Male Attire"
        class="dress-code-image rounded-lg shadow-lg"
      >
    </div>

    <div class="reserved-colors w-full md:w-1/3 flex flex-col items-center text-center px-4">
      <h3 class="text-2xl md:text-3xl text-dark-blue font-quicksand font-bold mb-4 md:mb-6">Colores reservados para la Quinceañera</h3>
      <div class="color-names flex flex-row flex-wrap justify-center gap-6 md:gap-10">
        <!-- Gold Word -->
        <span class="color-name color-name--gold">Gold</span>

        <!-- Purple Word -->
        <span class="color-name color-name--purple">Purple</span>
      </div>
    </div>

    <div class="dress-image-container w-full md:w-1/3 flex justify-center">
      <img
        src="@/assets/images/external/gallery-2.jpg"
        alt="Formal Female Attire"
        class="dress-code-image rounded-lg shadow-lg"
      >
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
  max-height: 400px;
  width: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.dress-code-image:hover {
  transform: scale(1.03);
}

.reserved-colors {
  margin: 1rem 0;
  text-align: center;
  padding: 1rem 0;
}

/* Color Names Container */
.color-names {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

/* Base Color Name Styling */
.color-name {
  font-size: 2.5rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 2px 2px 3px rgba(0, 0, 0, 0.2);
  -webkit-background-clip: text;
  transition: transform 0.3s ease, text-shadow 0.3s ease;
}

@media (max-width: 768px) {
  .color-name {
    font-size: 2rem;
  }
}

/* Gold Gradient for 'Gold' Word */
.color-name--gold {
  color: #ffd700;
  opacity: 0.5;
}

/* Purple Gradient for 'Purple' Word */
.color-name--purple {
  color: #800080;
  opacity: 0.5;
}

.color-name:hover {
  transform: scale(1.1);
  text-shadow: 5px 5px 10px rgba(0, 0, 0, 0.3);
}

@media (max-width: 640px) {
  .dress-code {
    padding: 1rem;
  }

  .dress-image-container {
    margin-bottom: 1.5rem;
  }

  .dress-code-image {
    max-height: 300px;
  }
}
</style>
