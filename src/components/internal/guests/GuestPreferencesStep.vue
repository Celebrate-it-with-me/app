<template>
  <section class="bg-white dark:bg-gray-900 shadow-card rounded-2xl p-6 space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <CSelect
        id="meal_preference"
        v-model="localPreferences.meal_preference"
        name="meal_preference"
        label="Meal Preference"
        :options="mealOptions"
        placeholder="Select a meal"
      />

      <CInput
        id="allergies"
        v-model="localPreferences.allergies"
        name="allergies"
        label="Allergies (optional)"
        placeholder="e.g. peanuts, gluten"
      />
    </div>

    <div>
      <CTextarea
        id="notes"
        v-model="localPreferences.notes"
        name="notes"
        label="Additional Notes"
        placeholder="e.g. Please seat near the stage"
      />
    </div>
  </section>
</template>

<script setup>
import { reactive, watch } from 'vue'
import CInput from '@/components/UI/form2/CInput.vue'
import CSelect from '@/components/UI/form2/CSelect.vue'
import CTextarea from '@/components/UI/form2/CTextarea.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const localPreferences = reactive({ ...props.modelValue })

const mealOptions = [
  { label: 'No Preference', value: '' },
  { label: 'Regular', value: 'regular' },
  { label: 'Vegetarian', value: 'vegetarian' },
  { label: 'Vegan', value: 'vegan' },
  { label: 'Gluten-Free', value: 'gluten_free' },
  { label: 'Kosher', value: 'kosher' },
  { label: 'Halal', value: 'halal' }
]

watch(localPreferences, val => {
  emit('update:modelValue', val)
})
</script>
