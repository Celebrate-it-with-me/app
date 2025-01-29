<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import TextField from '@/components/UI/form/TextField.vue'
import { Form } from 'vee-validate'
import 'vue-color-kit/dist/vue-color-kit.css'
import GuestCompanions from '@/components/authenticated/guests/companions/GuestCompanions.vue'

const emit = defineEmits(['updatedGuest'])

const stdState = reactive({
  eventId: null,
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: null
})

const guestsErrors = ref()

const guestsValidationSchema = computed(() => {
  return toTypedSchema(
    zod.object({
      stdTitle: zod.string().min(1, { message: 'Message is required' }),
      stdSubTitle: zod.string().optional(),
      backgroundColor: zod.string().optional(),
      image: zod
        .instanceof(File)
        .optional()
        .refine((file) => !file || ['image/jpeg', 'image/png', 'image/gif'].includes(file.type), {
          message: 'Image must be a valid image file (jpg, png, gif)'
        }),
      useCountdown: zod.boolean({ required_error: '"useCountdown" must be a boolean' }).optional(),
      useAddToCalendar: zod
        .boolean({ required_error: '"useAddToCalendar" must be a boolean' })
        .optional(),
      isEnabled: zod.boolean({ required_error: '"useAddToCalendar" must be a boolean' }).optional()
    })
  )
})

onMounted(() => {})

const onSubmit = async () => {}

const onInvalidSubmit = () => {
  guestsErrors.value = 'Oops something when wrong, please try again later'
}
</script>

<template>
  <div class="bg-gray-800 text-white p-6 rounded-lg shadow-md w-full ">
    <!-- Header Section -->
    <div class="flex justify-between items-center pb-4 border-b border-gray-700 mb-6">
      <h3 class="text-lg font-semibold">Add Guest</h3>
    </div>

    <!-- Event Details Form -->
    <Form
      :validation-schema="guestsValidationSchema"
      @submit="onSubmit"
      @invalid-submit="onInvalidSubmit"
    >

      <h4 class="text-xl font-semibold mb-4">Main Guest</h4>

      <div v-if="guestsErrors" class="w-full mb-4">
        <p class="text-red-500 font-semibold">
          {{ guestsErrors }}
        </p>
      </div>

      <div class="flex flex-col gap-6 pb-10 border-b border-gray-600">
        <div class="flex flex-row gap-x-4">
          <div class="w-1/2">
            <TextField
              v-model="stdState.firstName"
              label="First Name"
              name="firstName"
              show-error
              placeholder="First Name"
              :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
            />
          </div>

          <div class="w-1/2">
            <TextField
              v-model="stdState.lastName"
              label="Last Name"
              name="lastName"
              show-error
              placeholder="Last Name"
              :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
            />
          </div>
        </div>
        <div class="flex flex-row gap-x-4">
          <div class="w-1/2">
            <TextField
              v-model="stdState.email"
              label="Email"
              name="email"
              type="email"
              show-error
              placeholder="email@celebrate.com"
              :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
            />
          </div>

          <div class="w-1/2">
            <TextField
              v-model="stdState.phoneNumber"
              label="Phone Number"
              name="phoneNumber"
              type="text"
              show-error
              placeholder="123-456-7890"
              :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
            />
          </div>

        </div>
      </div>

      <GuestCompanions />

      <!-- Form Buttons -->
      <div class="mt-6 flex justify-end items-center gap-4">
        <button
          type="submit"
          class="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-6 rounded-md"
        >
          Save Guest
        </button>
      </div>
    </Form>
  </div>
</template>

<style scoped></style>
