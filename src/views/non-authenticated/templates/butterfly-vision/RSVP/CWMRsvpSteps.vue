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
      <h2 class="sr-only">Steps</h2>

      <div
        class="relative after:absolute after:inset-x-0 after:top-1/2 after:block after:h-0.5
               after:-translate-y-1/2 after:rounded-lg after:bg-gray-100"
      >
        <ol class="relative z-10 flex justify-between text-sm font-medium text-gray-500">
          <li
            class="flex items-center gap-2 bg-white p-2"
          >
            <span
              class="size-6 rounded-full text-center text-[10px]/6 font-bold"
              :class="activeStep === 1 ? 'bg-[#dba3ff] text-white' : 'bg-gray-100' "
            >
              1
            </span>
            <span class="sm:block"> Asistiras ? </span>
          </li>
          <li
            class="flex items-center gap-2 bg-white p-2"
          >
            <span
              class="size-6 rounded-full text-center text-[10px]/6 font-bold"
              :class="activeStep === 2 ? 'bg-[#dba3ff] text-white' : 'bg-gray-100' "
            >
              2
            </span>
            <span class="sm:block"> Acompañantes </span>
          </li>
          <li
            class="flex items-center gap-2 bg-white p-2"
          >
            <span
              class="size-6 rounded-full text-center text-[10px]/6 font-bold"
              :class="activeStep === 3 ? 'bg-[#dba3ff] text-white' : 'bg-gray-100' "
            >
              3
            </span>
            <span class="sm:block"> Confirme </span>
          </li>
        </ol>
      </div>

      <div class="mt-6">
        <div
          v-if="activeStep"
        >
          <div class="text-gray-600 mt-2">
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
