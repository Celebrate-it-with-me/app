<script setup>
import RSVPForm from '@/views/non-authenticated/templates/butterfly-vision/RSVP/RSVPForm.vue'
import { ref } from 'vue'

const props = defineProps({
  formTitle: {
    type: String,
    default: ''
  }
})
const rsvpImage = ref('http://dev.api.cwm.com/storage/images/sweet-memories/images/1234123.jpg')

</script>

<template>
<section class="rsvp-section rounded-xl mt-5 mb-5 border border-yellow-400 overflow-hidden w-full">
  <div
    class="rsvp-container w-full h-full flex flex-row"
  >
    <div
      class="w-[35%] h-full"
    >
      <div
        class="rsvp__form-container mt-8 flex flex-col items-center gap-y-5"
      >
        <h2 class="text-5xl font-gvibes text-gray-800">
          {{ formTitle }}
        </h2>
        <div
          class="form-section w-full mt-5"
        >
          <RSVPForm />
        </div>
      </div>
    </div>

    <div
      class="relative w-[65%] h-full"
    >
      <img
        :src="rsvpImage"
        :alt="'RSVP Image'"
        class="object-cover w-full h-full"
      />

      <div
        class="absolute w-[80%] h-[150px] rounded bg-rose-50/90 left-[10%] bottom-10 p-8 flex flex-col items-star justify-star"
      >
        <h3 class="text-4xl font-light font-gvibes text-gray-800">Celebrate with me!</h3>
        <p class="text-md text-gray-700 mt-2">
          My Quinceañera is on September 27, 2025, and I’d be delighted to
          celebrate with you! Come ready to dance, smile, and enjoy the
          party. Please confirm by September 20, 2025.
        </p>
      </div>
    </div>
  </div>
</section>
</template>

<style scoped>

</style>
