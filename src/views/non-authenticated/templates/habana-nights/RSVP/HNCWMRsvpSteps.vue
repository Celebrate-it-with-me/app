<script setup>
import { ref } from 'vue'
import HNMainGuestStep from '@/views/non-authenticated/templates/habana-nights/RSVP/Companions/HNMainGuestStep.vue'
import HNCompanionsStep from '@/views/non-authenticated/templates/habana-nights/RSVP/Companions/HNCompanionsStep.vue'
import HNGuestInformationCheck from '@/views/non-authenticated/templates/habana-nights/RSVP/Companions/HNGuestInformationCheck.vue'

const activeStep = ref(1)

const handleStep = newStep => {
  activeStep.value = newStep
}
</script>

<template>
  <div class="w-full flex items-center justify-center">
    <div v-if="activeStep" class="w-full">
      <!-- Step Indicator Rail -->
      <div class="flex items-center justify-center gap-3 mb-8">
        <template v-for="step in 3" :key="step">
          <div
            class="hn-step-dot"
            :class="{
              'hn-step-active': activeStep === step,
              'hn-step-completed': activeStep > step
            }"
          ></div>
          <div
            v-if="step < 3"
            class="w-8 h-px"
            :class="activeStep > step ? 'bg-[#D4AF37]/60' : 'bg-[#94A3B8]/30'"
          ></div>
        </template>
      </div>

      <template v-if="activeStep === 1">
        <div class="mb-6 text-center">
          <h2 class="text-2xl md:text-3xl font-['Cinzel',serif] text-[#F8F1E7]">
            Invitado Principal
          </h2>
          <div
            class="mt-3 w-16 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent mx-auto"
          ></div>
        </div>
        <HNMainGuestStep @go-to-next="handleStep(activeStep + 1)" />
      </template>

      <template v-if="activeStep === 2">
        <div class="mb-6 text-center">
          <h2 class="text-2xl md:text-3xl font-['Cinzel',serif] text-[#F8F1E7]">Acompañantes</h2>
          <div
            class="mt-3 w-16 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent mx-auto"
          ></div>
        </div>
        <HNCompanionsStep
          @go-to-previous="handleStep(activeStep - 1)"
          @go-to-next="handleStep(activeStep + 1)"
        />
      </template>

      <template v-if="activeStep === 3">
        <div class="mb-6 text-center">
          <h2 class="text-2xl md:text-3xl font-['Cinzel',serif] text-[#F8F1E7]">Revisión</h2>
          <div
            class="mt-3 w-16 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent mx-auto"
          ></div>
        </div>
        <HNGuestInformationCheck @go-back="handleStep(activeStep - 1)" />
      </template>
    </div>
    <div v-else>
      <p class="text-[#94A3B8]">No active step selected.</p>
    </div>
  </div>
</template>

<style scoped>
.hn-step-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(148, 163, 184, 0.3);
  border: 1px solid rgba(148, 163, 184, 0.4);
  transition: all 0.3s ease;
}

.hn-step-active {
  background: #d4af37;
  border-color: #d4af37;
  box-shadow: 0 0 12px rgba(212, 175, 55, 0.5);
}

.hn-step-completed {
  background: rgba(212, 175, 55, 0.6);
  border-color: rgba(212, 175, 55, 0.8);
}
</style>
