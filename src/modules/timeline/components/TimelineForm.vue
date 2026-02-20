<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <CInput
      id="title"
      v-model="formData.title"
      name="title"
      label="Activity Title"
      placeholder="e.g., Reception, Ceremony, Dinner"
      :show-error="true"
      required
    />

    <div class="mb-4">
      <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
        Activity Duration (Start - End)
      </label>
      <div
        class="relative flex items-center w-full border-b border-primary transition focus-within:border-b-2"
      >
        <VueDatePicker
          v-model="dateRange"
          range
          :enable-time-picker="true"
          auto-apply
          placeholder="Select start and end time"
          format="MM/dd/yyyy HH:mm"
          input-class-name="custom-datepicker-input"
          teleport="body"
        />
      </div>
    </div>

    <!-- Icon Selector -->
    <div class="mb-4">
      <CSelect
        id="icon-selector"
        v-model="formData.icon"
        name="icon"
        label="Activity Icon (Optional)"
        :options="availableIcons"
        description=""
      />

      <!-- Icon Preview -->
      <div v-if="formData.icon" class="mt-2 flex items-center">
        <span class="text-sm text-gray-600 dark:text-gray-400 mr-2">Icon Preview:</span>
        <component :is="getIconComponent(formData.icon)" class="w-5 h-5 text-primary" />
      </div>
    </div>

    <CTextarea
      id="description"
      v-model="formData.description"
      name="description"
      label="Description (Optional)"
      placeholder="Add any details or notes about this activity"
      :rows="3"
      description=""
    />

    <div v-if="error" class="text-red-500 text-sm mt-2">
      {{ error }}
    </div>

    <div class="flex justify-end space-x-3 mt-6">
      <CButton variant="outline" @click="$emit('cancel')"> Cancel </CButton>
      <CButton type="submit" variant="gradient" :loading="loading">
        {{ isEditing ? 'Update Item' : 'Add Item' }}
      </CButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import {
  Clock,
  Calendar,
  Music,
  Utensils,
  Camera,
  Gift,
  Cake,
  GlassWater,
  MicVocal,
  PartyPopper,
  Users
} from 'lucide-vue-next'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import CInput from '@/components/UI/form2/CInput.vue'
import CTextarea from '@/components/UI/form2/CTextarea.vue'
import CSelect from '@/components/UI/form2/CSelect.vue'
import CButton from '@/components/UI/buttons/CButton.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'submit', 'cancel'])

const formData = ref({ ...props.modelValue })
const error = ref('')

// --- Helper: parse string to Date ---
const parseToDate = val => {
  if (!val) return null
  if (val instanceof Date) return val
  if (typeof val === 'string') {
    const [datePart, timePart = '00:00'] = val.split(' ')
    const [month, day, year] = datePart.split('/').map(Number)
    const [hour, minute] = timePart.split(':').map(Number)
    return new Date(year, month - 1, day, hour, minute)
  }
  return null
}

const formatDateToString = val => {
  if (!val || isNaN(val)) return ''
  return val
    .toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
    .replace(',', '')
}

const dateRange = computed({
  get: () => [parseToDate(formData.value.start_time), parseToDate(formData.value.end_time)],
  set: newVal => {
    if (Array.isArray(newVal)) {
      formData.value.start_time = formatDateToString(newVal[0])
      formData.value.end_time = formatDateToString(newVal[1])
    } else {
      formData.value.start_time = ''
      formData.value.end_time = ''
    }
  }
})

watch(
  () => props.modelValue,
  newVal => {
    // Check if the data is actually different before updating to avoid circular updates
    if (JSON.stringify(newVal) !== JSON.stringify(formData.value)) {
      formData.value = { ...newVal }
    }
  },
  { deep: true }
)

watch(
  formData,
  newVal => {
    // Emit update only if different from current prop to avoid unnecessary cycles
    if (JSON.stringify(newVal) !== JSON.stringify(props.modelValue)) {
      emit('update:modelValue', newVal)
    }
  },
  { deep: true }
)

const availableIcons = [
  { value: 'Calendar', label: 'Calendar' },
  { value: 'Clock', label: 'Clock' },
  { value: 'Utensils', label: 'Dining' },
  { value: 'Music', label: 'Music' },
  { value: 'Camera', label: 'Photography' },
  { value: 'Gift', label: 'Gift' },
  { value: 'Cake', label: 'Cake' },
  { value: 'GlassWater', label: 'Drinks' },
  { value: 'MicVocal', label: 'Speech' },
  { value: 'PartyPopper', label: 'Celebration' },
  { value: 'Users', label: 'Guests' }
]

const getIconComponent = iconName => {
  if (!iconName) return Clock

  const iconMap = {
    Calendar,
    Clock,
    Utensils,
    Music,
    Camera,
    Gift,
    Cake,
    GlassWater,
    MicVocal,
    PartyPopper,
    Users
  }

  return iconMap[iconName] || Clock
}

const handleSubmit = () => {
  error.value = ''

  if (!formData.value.title) {
    error.value = 'Title is required'
    return
  }

  if (!formData.value.start_time || !formData.value.end_time) {
    error.value = 'Start and end time are required'
    return
  }

  const start = parseToDate(formData.value.start_time)
  const end = parseToDate(formData.value.end_time)

  if (start && end && end <= start) {
    error.value = 'End time must be after start time'
    return
  }

  emit('submit')
}
</script>

<style scoped>
:deep(.dp__input_wrap) {
  @apply w-full bg-transparent border-none rounded-none outline-none shadow-none;
  padding: 0 !important;
}

:deep(input.dp__input) {
  @apply text-sm w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400;
  padding-left: 2.5rem;
  padding-right: 0.25rem;
  height: 40px;
  border: none !important;
  box-shadow: none !important;
}
</style>
