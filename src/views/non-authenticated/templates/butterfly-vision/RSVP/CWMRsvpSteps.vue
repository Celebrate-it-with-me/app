<script setup>
import { ref } from 'vue'
import MainGuestStep from '@/views/non-authenticated/templates/butterfly-vision/RSVP/Companions/MainGuestStep.vue'
import CompanionsStep from '@/views/non-authenticated/templates/butterfly-vision/RSVP/Companions/CompanionsStep.vue'
import GuestInformationCheck
  from '@/views/non-authenticated/templates/butterfly-vision/RSVP/Companions/GuestInformationCheck.vue'

const activeStep = ref(1)

const handleStep = (newStep) => {
  console.log(newStep)
  activeStep.value = newStep
  /*if (templateStore.guest.confirmed === 'no') {
    activeStep.value = (activeStep.value === 3) ? 1 : 3
  } else {
    activeStep.value = newStep
  }*/
}

</script>

<template>
  <div
    class="mt-6 w-full md:w-3/4 ld:w-1/2 flex items-center justify-center"
  >
      <div
        class="container mx-auto bg-white"
        v-if="activeStep"
      >
        <template v-if="activeStep === 1">
          <MainGuestStep
            @go-to-next="handleStep(activeStep + 1)"
          />
        </template>
        <template v-if="activeStep === 2">
          <CompanionsStep
            @go-to-previous="handleStep(activeStep - 1)"
            @go-to-next="handleStep(activeStep + 1)"
          />
        </template>

        <template v-if="activeStep === 3">
          <GuestInformationCheck
            @go-back="handleStep(activeStep - 1)"
          />
        </template>
      </div>
    <div v-else>
      <p
        class="text-gray-600"
      >
        No pasos activos seleccionados.
      </p>
    </div>
  </div>
</template>

<style scoped>

</style>
