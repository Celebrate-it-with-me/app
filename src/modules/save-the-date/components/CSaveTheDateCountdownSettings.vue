<template>
  <CCard class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600"
        >
          <Clock class="w-5 h-5" />
        </div>
        <h3 class="text-xl font-bold text-gray-900">Countdown Settings</h3>
      </div>
      <button
        class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500"
        :class="modelValue.show_countdown ? 'bg-pink-500' : 'bg-gray-200'"
        @click="updateForm('show_countdown', !modelValue.show_countdown)"
      >
        <span
          class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
          :class="modelValue.show_countdown ? 'translate-x-5' : 'translate-x-0'"
        />
      </button>
    </div>

    <div
      v-if="modelValue.show_countdown"
      class="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300"
    >
      <div class="space-y-4">
        <label class="block text-sm font-bold text-gray-700 uppercase tracking-wider"
          >Date Source</label
        >
        <div class="flex gap-4">
          <button
            type="button"
            class="flex-1 px-4 py-3 rounded-xl border-2 transition-all font-bold text-sm"
            :class="
              modelValue.date_source === 'event'
                ? 'border-pink-500 bg-pink-50 text-pink-700'
                : 'border-gray-100 text-gray-500 hover:border-gray-200'
            "
            @click="updateForm('date_source', 'event')"
          >
            Event Date
          </button>
          <button
            type="button"
            class="flex-1 px-4 py-3 rounded-xl border-2 transition-all font-bold text-sm"
            :class="
              modelValue.date_source === 'custom'
                ? 'border-pink-500 bg-pink-50 text-pink-700'
                : 'border-gray-100 text-gray-500 hover:border-gray-200'
            "
            @click="updateForm('date_source', 'custom')"
          >
            Custom Date
          </button>
        </div>

        <div v-if="modelValue.date_source === 'custom'" class="animate-in fade-in duration-300">
          <label class="block text-sm font-medium text-gray-700 mb-1">Custom Start Date/Time</label>
          <input
            type="datetime-local"
            :value="modelValue.custom_starts_at"
            class="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all"
            @input="updateForm('custom_starts_at', $event.target.value)"
          />
        </div>
      </div>

      <div class="space-y-4">
        <label class="block text-sm font-bold text-gray-700 uppercase tracking-wider"
          >Countdown Units</label
        >
        <div class="grid grid-cols-2 gap-3">
          <CCheckbox
            v-for="unit in [
              { value: 'days', label: 'Days' },
              { value: 'hours', label: 'Hours' },
              { value: 'minutes', label: 'Minutes' },
              { value: 'seconds', label: 'Seconds' }
            ]"
            :key="unit.value"
            :model-value="modelValue.countdown_units.includes(unit.value)"
            :label="unit.label"
            @update:model-value="val => toggleUnit(unit.value, val)"
          />
        </div>

        <div class="pt-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Finish Behavior</label>
          <select
            :value="modelValue.countdown_finish_behavior"
            class="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all text-sm"
            @change="updateForm('countdown_finish_behavior', $event.target.value)"
          >
            <option value="hide">Hide Countdown</option>
            <option value="message">Show Expiry Message</option>
          </select>
        </div>
      </div>
    </div>
  </CCard>
</template>

<script setup>
import { Clock } from 'lucide-vue-next'
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

const toggleUnit = (unit, checked) => {
  let units = [...props.modelValue.countdown_units]
  if (checked) {
    if (!units.includes(unit)) units.push(unit)
  } else {
    units = units.filter(u => u !== unit)
  }
  updateForm('countdown_units', units)
}
</script>
