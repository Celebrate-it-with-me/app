<template>
  <div class="w-full">
    <label v-if="label" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
      {{ label }}
    </label>
    <div class="flex items-center gap-6">
      <div class="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary group">
        <img
          :src="preview || value || defaultAvatar"
          alt="Avatar Preview"
          class="object-cover w-full h-full"
        />
        <label
          class="absolute inset-0 bg-black bg-opacity-40 text-white flex items-center justify-center text-xs font-semibold cursor-pointer opacity-0 group-hover:opacity-100 transition"
        >
          Edit
          <input type="file" accept="image/*" class="hidden" @change="handleFileChange" />
        </label>
      </div>
      <p class="text-xs text-gray-500 dark:text-gray-400">{{ filename }}</p>
    </div>
    <p v-if="error" class="mt-1 text-xs text-red-500">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: String,
  label: String,
  error: String,
  defaultAvatar: {
    type: String,
    default: '/images/default-avatar.png'
  }
})

const emit = defineEmits(['update:modelValue', 'fileSelected'])

const value = computed(() => props.modelValue)
const preview = ref(null)
const filename = ref('')

const handleFileChange = event => {
  const file = event.target.files[0]
  if (file) {
    preview.value = URL.createObjectURL(file)
    filename.value = file.name
    emit('fileSelected', file)
  }
}
</script>
