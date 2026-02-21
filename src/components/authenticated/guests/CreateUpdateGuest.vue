<script setup>
import { computed, reactive, ref } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import TextField from '@/components/UI/form/TextField.vue'
import { Form } from 'vee-validate'
import 'vue-color-kit/dist/vue-color-kit.css'
import GuestCompanions from '@/components/authenticated/guests/companions/GuestCompanions.vue'
import CWMLoading from '@/components/UI/loading/CWMLoading.vue'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import GuestsService from '@/modules/guests/services/GuestsService'
import { useNotificationStore } from '@/stores/useNotificationStore'

const emit = defineEmits(['updatedGuest', 'showGuestList'])
const stdState = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: null
})
const forceStep = ref(false)

const loading = ref(false)
const guestsErrors = ref()
const companions = ref({
  companionType: null,
  companionQty: 0,
  companionList: []
})

const eventStore = useEventsStore()
const notificationStr = useNotificationStore()

const guestsValidationSchema = computed(() => {
  return toTypedSchema(
    zod.object({
      firstName: zod.string().min(1, { required_error: 'First Name is required.' }),
      lastName: zod.string().min(1, { required_error: 'Last Name is required.' }),
      email: zod.string().email('Invalid email address').or(zod.literal('')).nullable(),
      phoneNumber: zod.string().nullable()
    })
  )
})

const onSubmit = async (values, { resetForm }) => {
  try {
    loading.value = true

    const response = await GuestsService.create({
      ...stdState,
      eventId: eventStore.currentEvent.id,
      ...companions.value
    })

    if (response.status >= 200 && response.status < 300) {
      notificationStr.addNotification({
        type: 'success',
        message: 'Event guest added successfully!'
      })

      clearForm(resetForm)
    } else {
      console.error('There is some errors', response)
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

const clearForm = resetForm => {
  stdState.firstName = ''
  stdState.lastName = ''
  stdState.email = ''
  stdState.phoneNumber = null

  companions.value = []
  forceStep.value = true

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

const onInvalidSubmit = () => {
  guestsErrors.value = 'Oops something when wrong, please try again later'
}

const backToGuestList = () => {
  emit('showGuestList')
}
</script>

<template>
  <div class="bg-gray-800 text-white p-6 rounded-lg shadow-md w-full">
    <div class="flex justify-between items-center pb-4 border-b border-gray-700 mb-6">
      <h3 class="text-lg font-semibold">Add Guest</h3>
    </div>

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

      <GuestCompanions v-model="companions" :force-step="forceStep" />

      <div class="mt-6 flex justify-end items-center gap-4">
        <button
          type="button"
          class="text-yellow-300 hover:text-yellow-500 underline"
          @click="backToGuestList"
        >
          Back to Guest List
        </button>
        <button
          type="submit"
          class="flex items-center gap-x-2 text-white text-sm font-medium py-2 px-6 rounded-md"
          :class="{
            'bg-blue-500 hover:bg-blue-600': !loading,
            'bg-gray-700 hover:bg-gray-600': loading
          }"
          :disabled="loading"
        >
          <CWMLoading v-if="loading" :size="'h-6 w-6'" />
          <span>Save Guest</span>
        </button>
      </div>
    </Form>
  </div>
</template>
