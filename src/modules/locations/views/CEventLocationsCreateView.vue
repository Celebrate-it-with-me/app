<script setup>
import CHeading from '@/components/UI/headings/CHeading.vue'
import CWizard from '@/components/UI/wizard/CWizard.vue'
import LocationDetails from '@/modules/locations/components/LocationDetails.vue'
import LocationImages from '@/modules/locations/components/LocationImages.vue'
import LocationsReviews from '@/modules/locations/components/LocationsReviews.vue'
import useLocationsCreate from '@/modules/locations/composables/useLocationsCreate'

const {
  currentStep,
  isValidNext,
  locationData,
  images,
  steps,
  handleSubmit,
  handleNextStep,
  handleStepChange
} = useLocationsCreate()
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <CHeading :level="2" weight="semibold"> Event Locations </CHeading>
    </div>

    <CWizard
      :steps="steps"
      :next-valid="isValidNext"
      :initial-step="currentStep"
      @active-step="handleStepChange"
      @submit="handleSubmit"
    >
      <template #current-Step>
        <LocationDetails
          v-if="currentStep === 0"
          v-model="locationData"
          :initial-place-name="locationData.name"
          @valid="handleNextStep"
        />

        <LocationImages
          v-else-if="currentStep === 1"
          v-model="images"
          :place-id="locationData.placeId"
        />

        <LocationsReviews
          v-else-if="currentStep === 2"
          :location-data="locationData"
          :images="images"
        />
      </template>
    </CWizard>
  </div>
</template>
