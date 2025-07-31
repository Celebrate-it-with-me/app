<template>
  <div class="space-y-6">
    <div class="flex items-center justify-center gap-4">
      <template v-for="(step, index) in steps" :key="index">
        <div class="flex items-center gap-2">
          <div
            class="w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold"
            :class="[currentStep === index ? 'bg-primary text-white' : 'bg-gray-300 text-gray-700']"
          >
            {{ index + 1 }}
          </div>
          <div class="text-sm font-medium" :class="{ 'text-primary': currentStep === index }">
            {{ step.title }}
          </div>
        </div>
        <div v-if="index < steps.length - 1" class="w-6 h-px bg-gray-300 dark:bg-gray-600" />
      </template>
    </div>

    <slot name="current-Step" :step="currentStep" :step-data="steps[currentStep]" />

    <div class="flex justify-between pt-4">
      <CButton variant="secondary" :disabled="currentStep === 0" @click="prevStep"> Back </CButton>

      <CButton
        variant="primary"
        :disabled="(isLastStep && !canSubmit) || !nextValid"
        @click="nextStep"
      >
        {{ isLastStep ? 'Finish' : 'Next' }}
      </CButton>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import CButton from '@/components/UI/buttons/CButton.vue'

const emit = defineEmits(['submit', 'active-step'])
const props = defineProps({
  steps: {
    type: Array,
    required: true
  },
  canSubmit: {
    type: Boolean,
    default: true
  },
  initialStep: {
    type: Number,
    default: 0
  },
  nextValid: {
    type: Boolean,
    default: true
  }
})

const currentStep = ref(props.initialStep)

const isLastStep = computed(() => {
  return currentStep.value === props.steps.length - 1
})

const nextStep = () => {
  if (isLastStep.value) {
    emit('submit')
    return
  }

  currentStep.value++
  setActiveStep()
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
    setActiveStep()
  }
}

const setActiveStep = () => {
  if (currentStep.value >= 0 && currentStep.value < props.steps.length) {
    emit('active-step', currentStep.value)
  }
}
</script>
