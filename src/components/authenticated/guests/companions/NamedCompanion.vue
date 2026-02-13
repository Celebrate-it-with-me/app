<script setup>
import TextField from '@/components/UI/form/TextField.vue'
import { Form } from 'vee-validate'
import PhoneNumberField from '@/components/UI/form/PhoneNumberField.vue'
import { computed, reactive } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'

const emit = defineEmits(['companionSend'])
const companion = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: ''
})

const namedValidationSchema = computed(() => {
  return toTypedSchema(
    zod.object({
      firstName: zod.string().min(1, { required_error: 'First Name is required.' }),
      lastName: zod.string().min(1, { required_error: 'Last Name is required.' }),
      email: zod.string().email('Invalid email address').or(zod.literal('')).optional(),
      phoneNumber: zod.string().optional()
    })
  )
})

const onNamedValidationSubmit = (values, { resetForm }) => {
  emit('companionSend', { ...companion })

  clearCompanion(resetForm)
}

const onNamedInvalidSubmit = error => {
  console.log(error)
}

const clearCompanion = resetForm => {
  companion.firstName = ''
  companion.lastName = ''
  companion.email = ''
  companion.phoneNumber = ''

  resetForm({
    values: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: ''
    },
    touched: {
      firstName: false,
      lastName: false,
      email: false,
      phoneNumber: false
    }
  })
}
</script>

<template>
  <Form
    :validation-schema="namedValidationSchema"
    @submit="onNamedValidationSubmit"
    @invalid-submit="onNamedInvalidSubmit"
  >
    <div class="flex flex-col gap-6 w-full">
      <div class="flex flex-row gap-x-4">
        <div class="w-1/2">
          <TextField
            v-model="companion.firstName"
            label="First Name"
            name="firstName"
            show-error
            placeholder="First Name"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
          />
        </div>

        <div class="w-1/2">
          <TextField
            v-model="companion.lastName"
            label="Last Name"
            name="lastName"
            show-error
            placeholder="Last Name"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
          />
        </div>
      </div>
      <div class="flex flex-row gap-x-4 w-full">
        <div class="w-1/2">
          <TextField
            v-model="companion.email"
            label="Email"
            name="email"
            type="email"
            show-error
            placeholder="email@celebrate.com"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
          />
        </div>

        <div class="w-1/2">
          <PhoneNumberField
            v-model="companion.phoneNumber"
            name="phoneNumber"
            label="Phone Number"
            show-error
          />
        </div>
      </div>
      <div>
        <button
          type="submit"
          class="bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-2 px-4 rounded-md mt-2"
        >
          Add
        </button>
      </div>
    </div>
  </Form>
</template>

<style scoped></style>
