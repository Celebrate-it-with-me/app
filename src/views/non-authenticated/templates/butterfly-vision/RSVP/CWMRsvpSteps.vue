<script setup>
import { ref } from 'vue'
import MainGuestStep from '@/views/non-authenticated/templates/butterfly-vision/RSVP/Companions/MainGuestStep.vue'
import CompanionsStep from '@/views/non-authenticated/templates/butterfly-vision/RSVP/Companions/CompanionsStep.vue'
import GuestInformationCheck
  from '@/views/non-authenticated/templates/butterfly-vision/RSVP/Companions/GuestInformationCheck.vue'
import { useTemplateStore } from '@/stores/useTemplateStore'

const activeStep = ref(1)

const templateStore = useTemplateStore()

const handleStep = (newStep) => {
  if (templateStore.guest.confirmed === 'no') {
    activeStep.value = (activeStep.value === 3) ? 1 : 3
  } else {
    activeStep.value = newStep
  }
}

</script>

<template>
    <div>
      <div class="mt-6">
        <div
          v-if="activeStep"
        >
          <div class="container mx-auto px-4">
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
        </div>
        <div v-else>
          <p
            class="text-gray-600"
          >
            No active step selected.
          </p>
        </div>
      </div>
    </div>
</template>

<style scoped>

</style>
