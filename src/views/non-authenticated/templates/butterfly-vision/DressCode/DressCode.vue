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
  class="dress-code w-full h-screen flex flex-col justify-evenly items-center p-20"
>
  <div class="dc-titles h-[20%]">
    <h2 class="text-6xl font-gvibes font-bold gap-10 gradient-text" v-if="dressCodeConfig.title">
      {{ dressCodeConfig.title }}
    </h2>

    <h4
      v-if="dressCodeConfig.subTitle"
      class="relative text-2xl font-normal text-gray-600/70 text-center moments-title"
    >
      {{ dressCodeConfig.subTitle }}
    </h4>
  </div>

  <div
    class="w-full h-[75%] flex flex-row justify-between items-center"
  >
    <img
      src="/images/dress_code/black_tie/black_tie_male.png"
      alt="Male Black Tie"
      class="blackTie__dress-code"
    >

    <div class="reserved-colors flex flex-col items-center text-center">
      <h3 class="text-3xl font-bold mb-6">Reserved Colors for the Quinceañera</h3>
      <div class="color-names flex flex-row gap-10">
        <!-- Gold Word -->
        <span class="color-name color-name--gold">Gold</span>

        <!-- Purple Word -->
        <span class="color-name color-name--purple">Purple</span>
      </div>
    </div>


    <img
      src="/images/dress_code/black_tie/black_tie_female.png"
      alt="Male Black Tie"
      class="blackTie__dress-code"
    >
  </div>
</section>
</template>

<style scoped>
.dress-code {
  background-color: #ae720f;
}

.blackTie__dress-code {
  height: 500px;
  width: auto;
}

.reserved-colors {
  margin: 20px 0;
  text-align: center;
  padding: 20px 0;
}

/* Color Names Container */
.color-names {
  display: flex;
  flex-direction: row;
  gap: 20px; /* Adds space between the words */
}

/* Base Color Name Styling */
.color-name {
  font-size: 4rem; /* Large and bold fonts */
  font-weight: 900;
  text-transform: uppercase; /* Make the words all uppercase */
  letter-spacing: 2px; /* Add spacing between letters */
  text-shadow: 2px 2px 3px rgba(0, 0, 0, 0.2); /* Subtle depth using shadow */
  -webkit-background-clip: text; /* Clips gradient to text */
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
  transform: scale(1.1); /* Slightly grow on hover */
  text-shadow: 5px 5px 10px rgba(0, 0, 0, 0.3); /* Add a glow effect */
  transition: transform 0.3s ease, text-shadow 0.3s ease;
}

</style>
