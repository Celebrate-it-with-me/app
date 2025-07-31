<script setup>
import RadioPlain from '@/components/UI/plain-ui/RadioPlain.vue'
import { onMounted, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, null],
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])
const companionType = ref(null)

onMounted(() => {
  companionType.value = props.modelValue
})

watch(companionType, value => {
  emit('update:modelValue', value)
})
</script>

<template>
  <h5 class="text-lg font-normal mb-2">Type:</h5>
  <div class="select-companion-type flex flex-row gap-x-4">
    <RadioPlain
      id="option1"
      v-model="companionType"
      name="companionType"
      value="no-named"
      label="No Named"
    />

    <RadioPlain
      id="option2"
      v-model="companionType"
      name="companionType"
      value="named"
      label="Named"
    />
  </div>
</template>

<style scoped></style>
