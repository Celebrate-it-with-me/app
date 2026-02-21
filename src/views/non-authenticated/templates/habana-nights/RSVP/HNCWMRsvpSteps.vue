<script setup>
import { ref } from 'vue'
import CFMainGuestStep from '@/views/non-authenticated/templates/habana-nights/RSVP/Companions/CFMainGuestStep.vue'
import CFCompanionsStep from '@/views/non-authenticated/templates/habana-nights/RSVP/Companions/CFCompanionsStep.vue'
import CFGuestInformationCheck from '@/views/non-authenticated/templates/habana-nights/RSVP/Companions/CFGuestInformationCheck.vue'

const activeStep = ref(1)

const handleStep = newStep => {
  activeStep.value = newStep
}
</script>

<template>
  <div class="w-full flex items-center justify-center">
    <div
      v-if="activeStep"
      class="w-full bg-white rounded-2xl border border-gray-200 shadow-md p-6 md:p-10"
    >
      <template v-if="activeStep === 1">
        <div class="mb-8 text-center">
          <h2 class="text-3xl font-gvibes text-blue-800">Invitado Principal</h2>
          <div
            class="mt-2 w-16 h-1 bg-gradient-to-l from-blue-800 to-red-800 mx-auto rounded-full"
          ></div>
        </div>
        <CFMainGuestStep @go-to-next="handleStep(activeStep + 1)" />
      </template>
      <template v-if="activeStep === 2">
        <div class="mb-8 text-center">
          <h2 class="text-3xl font-gvibes text-blue-800">Acompañantes</h2>
          <div
            class="mt-2 w-16 h-1 bg-gradient-to-l from-blue-800 to-red-800 mx-auto rounded-full"
          ></div>
        </div>
        <CFCompanionsStep
          @go-to-previous="handleStep(activeStep - 1)"
          @go-to-next="handleStep(activeStep + 1)"
        />
      </template>

      <template v-if="activeStep === 3">
        <div class="mb-8 text-center">
          <h2 class="text-3xl font-gvibes text-blue-800">Revisión</h2>
          <div
            class="mt-2 w-16 h-1 bg-gradient-to-l from-blue-800 to-red-800 mx-auto rounded-full"
          ></div>
        </div>
        <CFGuestInformationCheck @go-back="handleStep(activeStep - 1)" />
      </template>
    </div>
    <div v-else>
      <p class="text-gray-600">No active step selected.</p>
    </div>
  </div>
</template>

<style scoped></style>
