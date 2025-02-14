<script setup>
import RSVPForm from '@/views/non-authenticated/templates/butterfly-vision/RSVP/RSVPForm.vue'
import { ref } from 'vue'

const props = defineProps({
  formTitle: {
    type: String,
    default: ''
  },
  rsvpExtraBox: {
    type: Object,
    required: false
  }
})
const rsvpImage = ref('http://dev.api.cwm.com/storage/images/sweet-memories/images/1234123.jpg')

</script>

<template>
<section
  class="rsvp-section rounded-xl mt-5 mb-5 border border-yellow-400 overflow-hidden w-full min-h-[680px]"
>
  <div
    class="rsvp-container w-full h-full flex flex-row"
  >
    <div
      class="w-[35%] h-full min-h-[900px]"
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
      <div
        class="rsvp__companions-container mt-8 flex flex-col items-center gap-y-5"
      >
        <h2 class="text-5xl font-gvibes text-gray-800">
          Companions
        </h2>
        <div
          class="form-section w-full mt-5"
        >
          Companions Section
        </div>
      </div>
    </div>
  </div>
</section>
</template>

<style scoped>

</style>
