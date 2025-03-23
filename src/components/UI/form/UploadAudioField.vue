<template>
  <div class="formGroup">
    <label v-if="label">{{ label }}</label>

    <div class="inputGroup">
      <input
        :id="name"
        :name="name"
        type="file"
        :disabled="isReadonly || disabled"
        accept="audio/*"
        @change="handleFileChange"
        ref="fileInput"
        class="hidden"
      />

      <audio
        controls
        v-if="previewUrl"
        :src="previewUrl"
        class="w-full h-12 bg-gray-200 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      ></audio>

      <div
        class="w-full text-center py-2 px-1 rounded-lg bg-gray-600 mt-2 hover:bg-gray-700 cursor-pointer"
        @click="uploadFile"
      >
        Upload
      </div>

      <button v-if="previewUrl" type="button" @click="handleRemoveAudio">Clear Audio</button>

      <p v-if="showErrorMessage" class="errorMessage">{{ errorMessage }}</p>
      <p v-if="description">{{ description }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, toRef } from 'vue'
import { useField } from 'vee-validate'

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  label: String,
  name: { required: true },
  modelValue: { type: File, default: null },
  isReadonly: Boolean,
  disabled: Boolean,
  validate: String,
  showError: Boolean,
  description: String,
  placeholder: String
})

const previewUrl = ref(null)
const showErrorMessage = computed(() => props.showError && errorMessage.value && meta.touched)
const fileInput = ref(null)

const {
  value: inputValue,
  errorMessage,
  meta
} = useField(toRef(props, 'name'), {
  initialValue: props.modelValue
})

watch(
  () => props.modelValue,
  (val) => {
    if (!val) {
      previewUrl.value = null
    }
  }
)

watch(inputValue, (val) => {
  emit('update:modelValue', val)
})

const handleFileChange = (event) => {
  const file = event.target.files[0]
  inputValue.value = file
  if (file) {
    previewUrl.value = URL.createObjectURL(file)
  }
}

const handleRemoveAudio = () => {
  previewUrl.value = null
  inputValue.value = null
}

const uploadFile = () => {
  if (!props.isReadonly && !props.disabled) {
    fileInput.value.click()
  }
}
</script>

<style scoped>
.errorMessage {
  color: red;
}
.formGroup {
  margin-bottom: 20px;
  width: 100%;
  box-sizing: border-box;
}

.inputGroup {
  position: relative;
}

.uploadButton {
  padding: 10px;
  background-color: #4caf50;
  color: white;
  cursor: pointer;
  text-align: center;
  width: 100%;
}

.errorMessage {
  color: red;
  margin-top: 5px;
}

.button {
  background-color: #f44336;
  border: none;
  color: white;
  padding: 10px 20px;
  cursor: pointer;
  display: block;
  margin-top: 10px;
}

.button:hover {
  background-color: #da190b;
}
</style>
