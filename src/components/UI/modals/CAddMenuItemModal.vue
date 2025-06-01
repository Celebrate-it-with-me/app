<template>
  <CModal v-model="showModal" :show-footer="false">
    <template #title> Add Menu Item </template>

    <Form
      :validation-schema="menuValidationSchema"
      class="space-y-4"
      @submit="onSubmit"
      @invalid-submit="onInvalidSubmit"
    >
      <CInput
        id="name"
        name="name"
        label="Item Name"
        placeholder="e.g. Grilled Salmon"
        show-error
      />

      <CSelect
        id="type"
        name="itemType"
        label="Course Type"
        :options="[
          { label: 'Starter', value: 'starter' },
          { label: 'Main Course', value: 'main' },
          { label: 'Dessert', value: 'dessert' }
        ]"
        show-error
      />

      <CSelect
        id="diet_type"
        name="dietType"
        label="Diet Type"
        :options="[
          { label: 'Regular', value: 'regular' },
          { label: 'Vegan', value: 'vegan' },
          { label: 'Vegetarian', value: 'vegetarian' },
          { label: 'Gluten-Free', value: 'gluten_free' }
        ]"
        show-error
      />

      <CTextarea
        id="notes"
        name="notes"
        label="Notes or Ingredients"
        placeholder="Optional notes..."
        show-error
      />

      <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
        <CButton variant="ghost" @click="close">Close</CButton>
        <button
          type="submit"
          class="inline-flex items-center justify-center font-medium transition-all duration-150 rounded-xl px-4 py-2 text-sm bg-primary text-white hover:bg-pink-600 shadow-pink-300 shadow-md min-w-[100px]"
        >
          Confirm
        </button>
      </div>
    </Form>
  </CModal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Form } from 'vee-validate'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import CModal from '@/components/UI/modals/CModal.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CInput from '@/components/UI/form2/CInput.vue'
import CSelect from '@/components/UI/form2/CSelect.vue'
import CTextarea from '@/components/UI/form2/CTextarea.vue'

const emit = defineEmits(['close', 'submitted'])
const props = defineProps({
  modelValue: Boolean,
  menu: {
    type: Object,
    required: true
  }
})

const showModal = ref(false)

const close = () => {
  emit('close')
}

const menuValidationSchema = computed(() => {
  return toTypedSchema(
    z.object({
      name: z.string().min(2, 'Name is required'),
      itemType: z.enum(['starter', 'main', 'dessert'], {
        required_error: 'Type is required'
      }),
      dietType: z.string().optional(),
      notes: z.string().optional()
    })
  )
})

const onSubmit = values => {
  emit('submitted', {
    ...values,
    menu_id: props.menu.id
  })
}

const onInvalidSubmit = error => {
  console.log('Validation errors:', error)
}

watch(
  () => props.modelValue,
  newVal => {
    showModal.value = newVal
  },
  { immediate: true }
)

watch(showModal, value => {
  if (!value) {
    emit('close')
  }
})
</script>
