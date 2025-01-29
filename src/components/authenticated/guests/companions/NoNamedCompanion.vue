<script setup>
import NumberPlain from '@/components/UI/plain-ui/NumberPlain.vue'
import { onMounted, ref, watch } from 'vue'

const emit = defineEmits(['setCompanionsQty', 'restartReset', 'update:modelValue'])
const props = defineProps({
  modelValue: {
    type: Number,
    default: 1
  },
  resetQty: {
    type: Boolean,
    default: false
  }
})

const noNamedCompanionQty = ref(1)
const setted = ref(false)

onMounted(() => {
  noNamedCompanionQty.value = parseInt(props.modelValue)
})

const setCompanionsQty = () => {
  // Todo Add Validation for quantity needing to be greater that -1
  setted.value = true
  emit('setCompanionsQty')
}

watch(noNamedCompanionQty, (value) => {
  emit('update:modelValue', parseInt(value))
})

watch(() => props.resetQty, (newValue) => {
  if(newValue) {
    noNamedCompanionQty.value = 1
    setted.value = false

    emit('restartReset')
  }
})

</script>

<template>
  <NumberPlain
    id="noNamedCompanionQty"
    label="Quantity"
    name="noNamedCompanionQty"
    v-model="noNamedCompanionQty"
    :min="0"
    :step="1"
  />

  <button
    v-if="!setted"
    type="button"
    class="bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium
                   py-2 px-4 rounded-md mt-2"
    @click="setCompanionsQty"
  >
    Set
  </button>
</template>

<style scoped>

</style>
