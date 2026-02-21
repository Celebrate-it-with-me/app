<template>
  <CCard class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600"
        >
          <CalendarDays class="w-5 h-5" />
        </div>
        <h3 class="text-xl font-bold text-gray-900">Add to Calendar Settings</h3>
      </div>
      <button
        class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500"
        :class="modelValue.use_add_to_calendar ? 'bg-blue-500' : 'bg-gray-200'"
        @click="updateForm('use_add_to_calendar', !modelValue.use_add_to_calendar)"
      >
        <span
          class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
          :class="modelValue.use_add_to_calendar ? 'translate-x-5' : 'translate-x-0'"
        />
      </button>
    </div>

    <div
      v-if="modelValue.use_add_to_calendar"
      class="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <label class="block text-sm font-bold text-gray-700 uppercase tracking-wider"
            >Providers</label
          >
          <div class="flex flex-wrap gap-4">
            <CCheckbox
              v-for="provider in ['google', 'apple', 'outlook']"
              :key="provider"
              :model-value="modelValue.calendar_providers.includes(provider)"
              :label="provider.charAt(0).toUpperCase() + provider.slice(1)"
              @update:model-value="val => toggleProvider(provider, val)"
            />
          </div>

          <div class="pt-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Calendar Mode</label>
            <select
              :value="modelValue.calendar_mode"
              class="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              @change="updateForm('calendar_mode', $event.target.value)"
            >
              <option value="modal">Open Modal</option>
              <option value="ics">Direct .ics Download</option>
            </select>
          </div>
        </div>

        <div class="space-y-4">
          <label class="block text-sm font-bold text-gray-700 uppercase tracking-wider"
            >Optional Overrides</label
          >
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Location Override</label>
            <input
              type="text"
              :value="modelValue.calendar_location_override"
              placeholder="Ex: My House, or a link"
              class="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              @input="updateForm('calendar_location_override', $event.target.value)"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description Override</label>
            <textarea
              :value="modelValue.calendar_description_override"
              placeholder="Custom event description..."
              rows="2"
              class="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              @input="updateForm('calendar_description_override', $event.target.value)"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  </CCard>
</template>

<script setup>
import { CalendarDays } from 'lucide-vue-next'
import CCard from '@/components/UI/cards/CCard.vue'
import CCheckbox from '@/components/UI/form2/CCheckbox.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const updateForm = (key, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value
  })
}

const toggleProvider = (provider, checked) => {
  let providers = [...props.modelValue.calendar_providers]
  if (checked) {
    if (!providers.includes(provider)) providers.push(provider)
  } else {
    providers = providers.filter(p => p !== provider)
  }
  updateForm('calendar_providers', providers)
}
</script>
