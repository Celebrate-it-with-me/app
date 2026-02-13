<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { Form } from 'vee-validate'
import TextField from '@/components/UI/form/TextField.vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import EmailField from '@/components/UI/form/EmailField.vue'
import PhoneNumberField from '@/components/UI/form/PhoneNumberField.vue'
import { FwbButton } from 'flowbite-vue'
import { useGuestsStore } from '@/stores/useGuestStore'
import { useNotificationStore } from '@/stores/useNotificationStore'

const emit = defineEmits(['processedCompanion'])
const props = defineProps({
  companion: {
    type: [Object, null],
    required: false,
    default: null
  },
  mode: {
    type: String,
    required: false,
    default: 'Create'
  }
})

const companionState = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  loading: false
})

const guestStore = useGuestsStore()
const errorMessage = ref('')
const notificationStore = useNotificationStore()

const companionValidationSchema = computed(() => {
  return toTypedSchema(
    zod.object({
      firstName: zod.string().min(1, { required_error: 'First Name is required.' }),
      lastName: zod.string().min(1, { required_error: 'Last Name is required.' }),
      email: zod.string().email('Invalid email address').or(zod.literal('')).optional(),
      phoneNumber: zod.string().optional()
    })
  )
})

onMounted(() => {
  if (props.mode.toLowerCase() === 'update') {
    initCompanion()
  }
})

const initCompanion = () => {
  companionState.firstName = props.companion.firstName
  companionState.lastName = props.companion.lastName
  companionState.email = props.companion.email
  companionState.phoneNumber = props.companion.phoneNumber
  companionState.loading = false
}

const handleRequest = async () => {
  if (props.mode.toLowerCase() === 'update') {
    return await guestStore.updateCompanion({
      companionId: props.companion.id,
      firstName: companionState.firstName,
      lastName: companionState.lastName,
      phoneNumber: companionState.phoneNumber,
      email: companionState.email
    })
  }

  return await guestStore.createCompanion({
    firstName: companionState.firstName,
    lastName: companionState.lastName,
    phoneNumber: companionState.phoneNumber,
    email: companionState.email
  })
}

const onSubmit = async () => {
  try {
    companionState.loading = true

    const response = await handleRequest()

    if (response.status >= 200 && response.status < 300) {
      await guestStore.loadGuests()
      await guestStore.updateCurrentGuest()
      emit('processedCompanion')
      notificationStore.addNotification({
        type: 'success',
        message: 'Companion created successfully!'
      })
    } else {
      notificationStore.addNotification({
        type: 'error',
        message: 'Oops something went wrong!'
      })
    }
  } catch (error) {
    console.error(error)
  } finally {
    companionState.loading = false
  }
}

const onInvalidSubmit = error => {
  console.log(error)

  errorMessage.value = error.message || 'Oops something went wrong. Please try again.'
}
</script>

<template>
  <div class="w-full">
    <h2 class="text-2xl font-thin mb-12">
      {{ mode.charAt(0).toUpperCase() + mode.slice(1) }} guest companion
    </h2>
    <Form
      :validation-schema="companionValidationSchema"
      @submit="onSubmit"
      @invalid-submit="onInvalidSubmit"
    >
      <div class="w-1/2 flex justify-between items-start gap-x-2">
        <TextField
          v-model="companionState.firstName"
          label="First Name"
          placeholder="First Name"
          name="firstName"
          show-error
          :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
        />

        <TextField
          v-model="companionState.lastName"
          label="Last Name"
          placeholder="Last Name"
          name="lastName"
          show-error
          :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
        />
      </div>
      <div class="w-1/2 flex justify-between items-start mt-5 gap-x-2">
        <EmailField
          v-model="companionState.email"
          label="Email"
          placeholder="Email"
          name="email"
          show-error
          :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
        />

        <PhoneNumberField
          v-model="companionState.phoneNumber"
          label="Phone Number"
          placeholder="Phone Number"
          name="phoneNumber"
          show-error
          :show-icon="false"
          :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
        />
      </div>

      <div class="w-1/2 flex justify-end items-center gap-x-2 mt-5">
        <fwb-button color="dark">Cancel</fwb-button>
        <fwb-button color="default" :loading="companionState.loading"> Submit </fwb-button>
      </div>
    </Form>
  </div>
</template>

<style scoped></style>
