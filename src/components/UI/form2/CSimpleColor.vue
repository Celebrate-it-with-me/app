<template>
  <div class="w-full">
    <!-- Label -->
    <label
      v-if="label"
      :for="name"
      class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200"
    >
      {{ label }}
    </label>

    <div class="flex flex-wrap gap-3 relative mb-2">
      <!-- Color Pills -->
      <div
        v-for="(color, index) in localColors"
        :key="index"
        class="relative"
      >
        <div
          class="w-10 h-10 rounded-full border border-gray-300 cursor-pointer"
          :style="{ backgroundColor: color }"
        ></div>
        <button
          type="button"
          class="absolute -top-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-0.5 border border-gray-300 dark:border-gray-600"
          @click="removeColor(index)"
          title="Remove color"
        >
          <X class="w-3 h-3 text-gray-500" />
        </button>
      </div>

      <!-- Add Color -->
      <div class="relative w-10 h-10">
        <button
          v-if="!showColorPicker"
          type="button"
          @click="showColorPicker = true"
          class="w-full h-full rounded-full border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400"
          title="Add a new color"
        >
          <Plus class="w-5 h-5" />
        </button>

        <input
          v-else
          type="color"
          class="absolute top-0 left-0 w-full h-full cursor-pointer appearance-none bg-transparent p-0"
          style="border: none;"
          @input="addColor"
          ref="colorInput"
        />
      </div>
    </div>

    <p v-if="showErrorMessage" class="mt-1 text-xs text-red-500">
      {{ errorMessage }}
    </p>

    <p v-if="description" class="mt-1 text-xs text-gray-500">
      {{ description }}
    </p>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useField } from 'vee-validate'
import { Plus, X } from 'lucide-vue-next'

const props = defineProps({
  name: { type: String, required: true },
  label: { type: String, default: '' },
  modelValue: {
    type: Array,
    default: () => []
  },
  description: { type: String, default: '' },
  showError: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'resetErrors'])

const {
  value: fieldValue,
  errorMessage,
  setValue,
  meta
} = useField(props.name)

const showColorPicker = ref(false)
const localColors = ref([])

// Initial sync from modelValue to fieldValue and local
setValue(props.modelValue)
localColors.value = [...props.modelValue]

// When modelValue changes externally (ex: from parent), update field and local
watch(() => props.modelValue, (val) => {
  if (Array.isArray(val)) {
    setValue(val)
    localColors.value = [...val]
  }
})

// When field value changes (via vee-validate), update local and emit to parent
watch(fieldValue, (val) => {
  if (JSON.stringify(localColors.value) !== JSON.stringify(val)) {
    localColors.value = [...val]
    emit('update:modelValue', val)
    if (val.length > 0) emit('resetErrors')
  }
})

const addColor = (event) => {
  const color = event.target.value
  if (!localColors.value.includes(color)) {
    localColors.value.push(color)
    setValue([...localColors.value])
  }
  showColorPicker.value = false
}

const removeColor = (index) => {
  localColors.value.splice(index, 1)
  setValue([...localColors.value])
}

const showErrorMessage = computed(() => {
  return props.showError && errorMessage.value && meta.touched
})
</script>
