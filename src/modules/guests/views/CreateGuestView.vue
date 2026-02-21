<template>
  <div class="space-y-8">
    <CHeading :level="2" weight="semibold">Add Guest</CHeading>

    <CWizard
      :steps="steps"
      :next-valid="isValidNext"
      :initial-step="currentStep"
      @active-step="handleStepChange"
      @submit="handleSubmit"
    >
      <template #current-Step>
        <GuestInfoStep v-if="currentStep === 0" v-model="guestData" />

        <GuestCompanionsStep
          v-else-if="currentStep === 1"
          v-model:named="namedCompanions"
          v-model:unnamed-count="unnamedCompanions"
        />

        <GuestSummaryStep
          v-else-if="currentStep === 2"
          :guest-data="guestData"
          :named-companions="namedCompanions"
          :unnamed-companions="unnamedCompanions"
          :preferences="preferences"
        />
      </template>
    </CWizard>
  </div>
</template>

<script setup>
import CWizard from '@/components/UI/wizard/CWizard.vue'
import CHeading from '@/components/UI/headings/CHeading.vue'
import GuestInfoStep from '@/modules/guests/components/GuestInfoStep.vue'
import GuestCompanionsStep from '@/modules/guests/components/GuestCompanionsStep.vue'
import GuestSummaryStep from '@/modules/guests/components/GuestSummaryStep.vue'
import { useCreateGuestWizard } from '@/modules/guests/composables/useCreateGuestWizard'

const {
  currentStep,
  namedCompanions,
  unnamedCompanions,
  guestData,
  preferences,
  steps,
  isValidNext,
  handleSubmit,
  handleStepChange
} = useCreateGuestWizard()
</script>
