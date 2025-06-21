<template>
  <div class="w-full">
    <label v-if="label" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
      {{ label }}
    </label>

    <div
      class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center relative"
      :class="{ 'opacity-60 cursor-not-allowed': isLimitReached }"
      @dragover.prevent
      @drop.prevent="onDrop"
      @blur="handleBlur"
    >
      <input
        ref="input"
        type="file"
        accept="image/*"
        :multiple="maxImages !== 1"
        class="hidden"
        @change="addFiles"
      />

      <button
        type="button"
        class="flex flex-col items-center justify-center w-full h-full cursor-pointer"
        :class="{ 'cursor-not-allowed': isLimitReached }"
        @click="isLimitReached ? null : input?.click()"
      >
        <Upload class="w-10 h-10 text-gray-400 mb-2" />
        <span class="text-sm text-gray-500 dark:text-gray-400">
          {{ isLimitReached ? 'Maximum images limit reached' : 'Click to upload or drag and drop' }}
        </span>
        <span class="text-xs text-gray-400 dark:text-gray-500 mt-1">
          PNG, JPG, GIF up to 10MB
          {{ maxImages > 0 ? `(Max ${maxImages} ${maxImages === 1 ? 'image' : 'images'})` : '' }}
        </span>
      </button>

      <div v-if="localImages.length" class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="(img, index) in localImages" :key="imgKey(img, index)" class="relative group">
          <img :src="getPreview(img)" alt="Preview" class="rounded-md object-cover w-full h-32" />
          <button
            type="button"
            class="absolute top-1 right-1 bg-white dark:bg-gray-900 rounded-full p-1 shadow group-hover:opacity-100 opacity-0 transition"
            title="Remove image"
            @click.stop="removeImage(index)"
          >
            <X class="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>
    </div>

    <p v-if="showError && errorMessage" class="text-sm text-red-500 mt-2">
      {{ errorMessage }}
    </p>

    <p v-if="description" class="text-xs text-gray-500 mt-1">
      {{ description }}
    </p>
  </div>
</template>

<script setup>
import { Upload, X } from 'lucide-vue-next'
import { ref, watch, computed } from 'vue'
import { useField } from 'vee-validate'

const props = defineProps({
  name: { type: String, required: true },
  label: { type: String, required: false, default: '' },
  showError: Boolean,
  description: { type: String, required: false, default: '' },
  modelValue: {
    type: Array,
    default: () => []
  },
  maxImages: {
    type: Number,
    default: 0 // 0 means unlimited, 1 for single image, etc.
  }
})

const emit = defineEmits(['update:modelValue', 'resetErrors'])

const input = ref(null)
const localImages = ref([])

const { value, errorMessage, handleBlur, setValue, meta } = useField(props.name)

const isLimitReached = computed(() => {
  return props.maxImages > 0 && localImages.value.length >= props.maxImages
})

const initDone = ref(false)
watch(
  () => props.modelValue,
  val => {
    console.log('modelValue changed:', val, Array.isArray(val) && !initDone.value)
    if (Array.isArray(val) && val.length > 0 && !initDone.value) {
      // If there's a limit, only take up to maxImages
      localImages.value = props.maxImages > 0
        ? [...val].slice(0, props.maxImages)
        : [...val]
      setValue(localImages.value)
      initDone.value = true
    }
  },
  { immediate: true }
)

watch(localImages, val => {
  setValue(val)
  emit('update:modelValue', val)
  if (val.length > 0) emit('resetErrors')
})

const addFiles = event => {
  if (isLimitReached.value) return

  const selected = Array.from(event.target.files).filter(f => f.type.startsWith('image/'))
  const current = localImages.value || []

  const newImages = selected.filter(
    file =>
      !current.some(
        existing =>
          existing instanceof File && existing.name === file.name && existing.size === file.size
      )
  )

  // If there's a limit, only add as many as we can
  const remainingSlots = props.maxImages > 0 ? props.maxImages - current.length : Infinity
  const imagesToAdd = newImages.slice(0, remainingSlots)

  localImages.value = [...current, ...imagesToAdd]
}

const onDrop = event => {
  if (isLimitReached.value) return

  const dropped = Array.from(event.dataTransfer.files).filter(f => f.type.startsWith('image/'))
  const current = localImages.value || []

  const newImages = dropped.filter(
    file =>
      !current.some(
        existing =>
          existing instanceof File && existing.name === file.name && existing.size === file.size
      )
  )

  // If there's a limit, only add as many as we can
  const remainingSlots = props.maxImages > 0 ? props.maxImages - current.length : Infinity
  const imagesToAdd = newImages.slice(0, remainingSlots)

  localImages.value = [...current, ...imagesToAdd]
}

const removeImage = index => {
  localImages.value.splice(index, 1)
  setValue([...localImages.value])
}

const getPreview = img => {
  if (img instanceof File) return URL.createObjectURL(img)
  if (img?.imagePath) return img.imagePath
  return ''
}

const imgKey = (img, index) => {
  if (img instanceof File) return `${img.name}_${img.size}_${index}`
  return img.id ? `existing_${img.id}` : `unknown_${index}`
}
</script>
