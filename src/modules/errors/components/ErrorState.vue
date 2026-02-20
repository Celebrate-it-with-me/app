<script setup>
import CButton from '@/components/UI/buttons/CButton.vue'

defineProps({
  icon: { type: Object, required: true },
  iconBgClass: { type: String, default: 'bg-gray-100' },
  iconColorClass: { type: String, default: 'text-gray-700' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  hint: { type: String, default: '' },
  primaryActionText: { type: String, default: '' },
  secondaryActionText: { type: String, default: '' }
})

defineEmits(['primary', 'secondary'])
</script>

<template>
  <div class="text-center">
    <div
      class="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center"
      :class="iconBgClass"
    >
      <component :is="icon" class="w-7 h-7" :class="iconColorClass" />
    </div>

    <h2 class="mt-4 text-2xl font-black tracking-tight text-gray-900">
      {{ title }}
    </h2>

    <p class="mt-2 text-gray-600">
      {{ message }}
    </p>

    <p v-if="hint" class="mt-3 text-sm text-gray-500">
      {{ hint }}
    </p>

    <div class="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
      <CButton v-if="primaryActionText" variant="primary" @click="$emit('primary')">
        {{ primaryActionText }}
      </CButton>

      <CButton v-if="secondaryActionText" variant="outline" @click="$emit('secondary')">
        {{ secondaryActionText }}
      </CButton>
    </div>

    <div class="mt-6">
      <slot name="extra" />
    </div>
  </div>
</template>
