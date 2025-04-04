<script setup>
import { Form } from 'vee-validate'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import TextField from '@/components/UI/form/TextField.vue'
import EmailField from '@/components/UI/form/EmailField.vue'
import SelectField from '@/components/UI/form/SelectField.vue'
import { useTemplateStore } from '@/stores/useTemplateStore'
import ConfirmationField from '@/components/UI/form/ConfirmationField.vue'

const confirmationError = ref(false)
const emit = defineEmits(['goToNext'])
const mainGuestState = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  confirmed: '',
  mealPreference: ''
})

const templateStore = useTemplateStore()
const mainGuestValidationSchema = computed(() => {
  return toTypedSchema(
    zod.object({
      firstName: zod.string().min(1, 'First Name is required'),
      lastName: zod.string().min(1, 'Last Name is required'),
      email: zod.string().email({ message: 'Invalid email address' }).optional(),
      phoneNumber: zod
        .string()
        .regex(/^[0-9]*$/, { message: 'Phone Number must be numeric' })
        .optional(),
      confirmed: zod.enum(['yes', 'no'], { required_error: 'Please select a confirmation option' })
    })
  )
})

onMounted(() => {
  mainGuestState.firstName = templateStore.guest?.firstName ?? ''
  mainGuestState.lastName = templateStore.guest?.lastName ?? ''
  mainGuestState.email = templateStore.guest?.email ?? ''
  mainGuestState.phoneNumber = templateStore.guest?.phoneNumber ?? ''
  mainGuestState.mealPreference = templateStore.guest?.mealPreference ?? 0
  mainGuestState.confirmed = templateStore.guest?.confirmed ?? 0
})

const onSubmit = () => {
  templateStore.initRsvpGuestData(mainGuestState)
  emit('goToNext')
}

const onInvalidSubmit = (error) => {
  console.log(error)

  if (error.errors?.confirmed) {
    confirmationError.value = true
  }
}

watch(() => mainGuestState.confirmed, () => {
  confirmationError.value = false
})
</script>

<template>
  <div class="main__guest-container w-full flex flex-col items-center">
    <div class="form-container w-full max-w-4xl mx-auto shadow-md sm:rounded-lg p-4 md:p-10">
      <Form
        :validation-schema="mainGuestValidationSchema"
        @submit="onSubmit"
        @invalid-submit="onInvalidSubmit"
        class="flex flex-col gap-5 mt-8"
      >
        <div class="first-row flex flex-row gap-x-5">
          <div class="relative z-0 w-full mb-5 group">
            <TextField
              v-model="mainGuestState.firstName"
              name="firstName"
              id="firstName"
              required
              disabled
              :show-error="true"
              label="First Name"
              placeholder=" "
              class-input="block py-2.5 px-0 w-full text-md text-dark-blue bg-transparent border-0 border-b
               border-gray-300 appearance-none dark:text-gray-900 dark:border-gray-600
               dark:focus:border-[#dba3ff] focus:outline-none focus:ring-0 focus:border-[#dba3ff] peer"
              class-label="peer-focus:font-medium absolute text-xl mb-2 text-[#754e9e] font-semibold
                           duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0]
                           peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto
                           peer-focus:text-rose-400 peer-focus:dark:text-rose-400 peer-placeholder-shown:scale-100
                           peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            />
          </div>
        </div>

        <div class="first-row flex flex-row gap-x-5">
          <div class="relative z-0 w-full mb-5 group">
            <TextField
              v-model="mainGuestState.lastName"
              name="lastName"
              id="lastName"
              required
              disabled
              :show-error="true"
              label="Last Name"
              placeholder=" "
              class-input="block py-2.5 px-0 w-full text-md text-dark-blue bg-transparent border-0 border-b
               border-gray-300 appearance-none dark:text-gray-900 dark:border-gray-900
               dark:focus:border-rose-400 focus:outline-none focus:ring-0 focus:border-rose-400 peer"
              class-label="peer-focus:font-medium absolute text-xl text-[#754e9e] font-semibold
               duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0]
               peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto
               peer-focus:text-rose-400 peer-focus:dark:text-rose-400 peer-placeholder-shown:scale-100
               peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            />
          </div>
        </div>
        <div class="second-row flex flex-row gap-x-5">
          <div class="relative z-0 w-full mb-5 group">
            <EmailField
              v-model="mainGuestState.email"
              name="email"
              id="email"
              required
              :show-error="true"
              label="Email"
              placeholder="Email"
              class-input="block py-2.5 px-0 w-full text-md text-dark-blue bg-transparent border-0 border-b
               border-gray-300 appearance-none dark:text-gray-900 dark:border-gray-600
               dark:focus:border-rose-400 focus:outline-none focus:ring-0 focus:border-[#dba3ff] peer"
              class-label="peer-focus:font-medium absolute text-xl text-[#754e9e] font-semibold
               duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0]
               peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto
               peer-focus:text-rose-400 peer-focus:dark:text-rose-400 peer-placeholder-shown:scale-100
               peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            />
          </div>
        </div>

        <div class="second-row flex flex-row gap-x-5">
          <div class="relative z-0 w-full mb-5 group">
            <TextField
              v-model="mainGuestState.phoneNumber"
              name="phoneNumber"
              id="phoneNumber"
              required
              :show-error="true"
              label="Phone Number"
              placeholder=" "
              class-input="block py-2.5 px-0 w-full text-md text-dark-blue bg-transparent border-0 border-b
               border-gray-300 appearance-none dark:text-gray-900 dark:border-gray-600
               dark:focus:border-rose-400 focus:outline-none focus:ring-0 focus:border-[#dba3ff] peer"
              class-label="peer-focus:font-medium absolute text-xl text-[#754e9e] font-semibold
               duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0]
               peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto
               peer-focus:text-rose-400 peer-focus:dark:text-rose-400 peer-placeholder-shown:scale-100
               peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            />
          </div>
        </div>

        <div class="third-row flex flex-row items-center gap-x-5">
          <div class="relative z-0 mb-2 group">
            <ConfirmationField
              name="confirmed"
              v-model="mainGuestState.confirmed"
              label=""
              :show-error="true"
              :options="[
                { value: 'yes', label: 'Yes, I will be there' },
                { value: 'no', label: 'Sorry, I can’t come' }
              ]"
            />
          </div>
        </div>
        <div class="action-button w-full flex flew-row justify-end">
          <button
            class="px-6 py-2 border-2 font-bold"
            style="
              font-family: inherit;
              color: #dba3ff;
              background-color: transparent;
              border-color: #dba3ff;
              border-radius: 8px;
            "
          >
            Next
          </button>
        </div>
      </Form>
    </div>
  </div>
</template>

<style scoped></style>
