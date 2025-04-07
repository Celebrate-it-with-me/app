<script setup>
import { Form } from 'vee-validate'
import TextField from '@/components/UI/form/TextField.vue'
import EmailField from '@/components/UI/form/EmailField.vue'
import { computed, onMounted, reactive } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import ConfirmationField from '@/components/UI/form/ConfirmationField.vue'
import { useTemplateStore } from '@/stores/useTemplateStore'

const emit = defineEmits(['confirmed'])
const props = defineProps({
  currentCompanion: {
    type: [Object, null],
    required: false,
    default: null
  }
})

const templateStore = useTemplateStore()

const localCompanion = reactive({
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  confirmed: 'yes'
})

onMounted(() => {
  if(props.currentCompanion) {
    localCompanion.id = props.currentCompanion?.id ?? ''
    localCompanion.firstName = props.currentCompanion?.firstName ?? ''
    localCompanion.lastName = props.currentCompanion?.lastName ?? ''
    localCompanion.email = props.currentCompanion?.email ?? ''
    localCompanion.phoneNumber = props.currentCompanion?.phoneNumber ?? ''
    localCompanion.confirmed = props.currentCompanion?.confirmed ?? 'yes'
  }
})

const companionValidationSchema = computed(() => {
  return toTypedSchema(
    zod.object({
      firstName: zod.string().min(1, 'First Name is required'),
      lastName: zod.string().min(1, 'Last Name is required'),
      email: zod.string()
        .email({ message: 'Invalid email address' })
        .optional(),
      phoneNumber: zod
        .string()
        .regex(/^[0-9\s]*$/, { message: 'Phone Number must be numeric' })
        .optional(),
      confirmed: zod
        .enum(['yes', 'no'], { message: 'Please select a confirmation option' })
    })
  )
})

const onSubmit = () => {
  emit('confirmed', localCompanion)
}

const onInvalidSubmit = (errors) => {
  console.log(errors)
}

</script>

<template>
  <div class="relative w-full overflow-x-auto shadow-md sm:rounded-lg p-4 md:p-10">
    <Form
      :validation-schema="companionValidationSchema"
      @submit="onSubmit"
      @invalid-submit="onInvalidSubmit"
    >
      <div class="first-row flex flex-row gap-x-5">
        <div class="relative z-0 w-full mb-5 group">
          <TextField
            v-model="localCompanion.firstName"
            name="firstName"
            id="firstName"
            required
            show-error
            label="First Name"
            placeholder=" "
            class-input="block py-2.5 px-0 w-full text-md text-gray-900 bg-transparent border-0 border-b
               border-gray-300 appearance-none dark:text-gray-900 dark:border-gray-600
               dark:focus:border-[#dba3ff] focus:outline-none focus:ring-0 focus:border-[#dba3ff] peer"
            class-label="peer-focus:font-medium absolute text-lg text-[#754e9e] font-semibold
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
            v-model="localCompanion.lastName"
            name="lastName"
            id="lastName"
            required
            :show-error="true"
            label="Last Name"
            placeholder=" "
            class-input="block py-2.5 px-0 w-full text-md text-gray-900 bg-transparent border-0 border-b
               border-gray-300 appearance-none dark:text-gray-900 dark:border-gray-900
               dark:focus:border-rose-400 focus:outline-none focus:ring-0 focus:border-[#dba3ff] peer"
            class-label="peer-focus:font-medium absolute text-lg text-[#754e9e] font-semibold
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
            v-model="localCompanion.email"
            name="email"
            id="email"
            required
            :show-error="true"
            label="Email"
            placeholder=" "
            class-input="block py-2.5 px-0 w-full text-md text-gray-900 bg-transparent border-0 border-b
             border-gray-300 appearance-none dark:text-gray-900 dark:border-gray-600
             dark:focus:border-rose-400 focus:outline-none focus:ring-0 focus:border-[#dba3ff] peer"
            class-label="peer-focus:font-medium absolute text-lg text-[#754e9e] font-semibold
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
            v-model="localCompanion.phoneNumber"
            name="phoneNumber"
            id="phoneNumber"
            required
            :show-error="true"
            label="Phone Number"
            placeholder=" "
            class-input="block py-2.5 px-0 w-full text-md text-gray-900 bg-transparent border-0 border-b
             border-gray-300 appearance-none dark:text-gray-900 dark:border-gray-600
             dark:focus:border-rose-400 focus:outline-none focus:ring-0 focus:border-[#dba3ff] peer"
            class-label="peer-focus:font-medium absolute text-lg text-[#754e9e] font-semibold
             duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0]
             peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto
             peer-focus:text-rose-400 peer-focus:dark:text-rose-400 peer-placeholder-shown:scale-100
             peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          />
        </div>
      </div>

      <div class="third-row flex flex-row items-center gap-x-5">
        <div class="relative z-0 mb-2 group w-1/2">
          <ConfirmationField
            name="confirmed"
            v-model="localCompanion.confirmed"
            label=""
            :show-error="true"
            :options="[
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' }
              ]"
          />
        </div>
      </div>
      <div class="action-button w-full flex flew-row justify-end">
        <button
          class="px-4 py-1 border-2 font-bold"
          style="
            font-family: inherit;
            color: #dba3ff;
            background-color: transparent;
            border-color: #dba3ff;
            border-radius: 8px;
          "
        >
          Confirm
        </button>
      </div>
    </Form>
  </div>
</template>

<style scoped></style>
