<script setup>
import {FwbButton, FwbModal} from "flowbite-vue";

const emit = defineEmits(['closeModal']);

const props = defineProps({
  open: {
    type: Boolean,
    required: false,
    default: false
  },
  mainGuest: {
    type: Object,
    required: true
  }
})
const closeModal = () => {
  emit('closeModal');
}

</script>

<template>
  <fwb-modal
      persistent
      v-if="open"
      @close="closeModal"
  >
    <template #body>
      <h1 class="text-gray-700 font-bold text-2xl text-center">RSVP</h1>
      <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400 lora-font">
        for the Quince of
      </p>
      <h1 class="text-gray-700 font-bold text-2xl text-center">Vanessa Rodriguez</h1>

      <hr class="mt-5 mb-5">

      <p class="text-gray-700 text-4xl text-center beauty-font">
        The Details
      </p>

      <p class="text-gray-700 text-4xl text-center lora-font">
        Friday, August 2, 2024 <br>
        5:00 pm
      </p>

      <p class="text-gray-700 mt-6 text-4xl text-center beauty-font">
        Ceremony and Reception
      </p>
      <p class="text-gray-700 text-4xl text-center lora-font">
        Chapel of Our Saviour <br>
        8 4th St, Colorado Springs, CO 80906
      </p>

      <hr class="mt-5 mb-5">

    </template>
    <template #footer>
      <div class="flex justify-between">
        <fwb-button @click="closeModal" color="alternative">
          Decline
        </fwb-button>
        <fwb-button @click="closeModal" color="green">
          I accept
        </fwb-button>
      </div>
    </template>
  </fwb-modal>
</template>

<style scoped>
.lora-font {
  font-family: "Lora sans",sans-serif;
  font-size: 1.3em;
  font-weight: lighter;
  text-align: center;
}

.beauty-font {
  font-family: "Beauty sans",sans-serif;
  font-size: 1.3em;
  font-weight: lighter;
  text-align: center;
}
</style>
