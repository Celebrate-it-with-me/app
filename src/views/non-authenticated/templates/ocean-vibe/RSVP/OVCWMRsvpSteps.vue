<script setup>
import { ref } from 'vue'
import OVMainGuestStep from '@/views/non-authenticated/templates/ocean-vibe/RSVP/Companions/OVMainGuestStep.vue'
import OVCompanionsStep from '@/views/non-authenticated/templates/ocean-vibe/RSVP/Companions/OVCompanionsStep.vue'
import OVGuestInformationCheck from '@/views/non-authenticated/templates/ocean-vibe/RSVP/Companions/OVGuestInformationCheck.vue'

const activeStep = ref(1)

const handleStep = newStep => {
  activeStep.value = newStep
}
</script>

<template>
  <div class="w-full flex items-center justify-center">
    <div
      v-if="activeStep"
      class="w-full bg-white/70 backdrop-blur-md rounded-3xl border border-sky-200/50 shadow-xl shadow-sky-900/10 p-6 md:p-12 transition-all duration-500"
    >
      <template v-if="activeStep === 1">
        <div class="mb-10 text-center">
          <h2
            class="text-4xl font-gvibes bg-gradient-to-r from-[#123B5A] to-[#2F6F8F] bg-clip-text text-transparent"
          >
            Invitado Principal
          </h2>
          <div
            class="mt-3 w-20 h-0.5 bg-gradient-to-r from-[#123B5A]/20 via-[#2F6F8F] to-[#123B5A]/20 mx-auto rounded-full"
          ></div>
        </div>
        <OVMainGuestStep @go-to-next="handleStep(activeStep + 1)" />
      </template>
      <template v-if="activeStep === 2">
        <div class="mb-10 text-center">
          <h2
            class="text-4xl font-gvibes bg-gradient-to-r from-[#123B5A] to-[#2F6F8F] bg-clip-text text-transparent"
          >
            Acompañantes
          </h2>
          <div
            class="mt-3 w-20 h-0.5 bg-gradient-to-r from-[#123B5A]/20 via-[#2F6F8F] to-[#123B5A]/20 mx-auto rounded-full"
          ></div>
        </div>
        <OVCompanionsStep
          @go-to-previous="handleStep(activeStep - 1)"
          @go-to-next="handleStep(activeStep + 1)"
        />
      </template>

      <template v-if="activeStep === 3">
        <div class="mb-10 text-center">
          <h2
            class="text-4xl font-gvibes bg-gradient-to-r from-[#123B5A] to-[#2F6F8F] bg-clip-text text-transparent"
          >
            Revisión
          </h2>
          <div
            class="mt-3 w-20 h-0.5 bg-gradient-to-r from-[#123B5A]/20 via-[#2F6F8F] to-[#123B5A]/20 mx-auto rounded-full"
          ></div>
        </div>
        <OVGuestInformationCheck @go-back="handleStep(activeStep - 1)" />
      </template>
    </div>
    <div v-else>
      <p class="text-gray-600">No active step selected.</p>
    </div>
  </div>
</template>

<style scoped></style>
