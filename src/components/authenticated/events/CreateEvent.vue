<script setup>
import DateField from '@/components/UI/form/DateField.vue'
import TextAreaField from '@/components/UI/form/TextAreaField.vue'
import TextField from '@/components/UI/form/TextField.vue'
import SelectField from '@/components/UI/form/SelectField.vue'
import { Form } from 'vee-validate'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import {
  DEFAULT_ERROR_MESSAGE,
  EVENT_STATUSES as statuses,
  EVENT_VISIBILITIES as visibilities
} from '@/constants/constants'
import { useEventsStore } from '@/stores/useEventsStore'
import { useUserStore } from '@/stores/useUserStore'
import { XMarkIcon } from '@heroicons/vue/16/solid'

const emit = defineEmits(['cancelCreate'])
const eventState = reactive({
  eventName: '',
  eventDescription: '',
  eventDate: '',
  status: 'draft',
  customUrlSlug: '',
  visibility: 'private',
  processing: false
})
const eventErrors = ref()

const userStore = useUserStore()
const eventStore = useEventsStore()

onMounted(() => {
  console.log('checking token', userStore.token)
})

const eventValidationSchema = computed(() => {
  return toTypedSchema(
    zod.object({
      eventName: zod.string().min(1, { message: 'Event Name is required' }),
      eventDate: zod
        .string()
        .min(1, { message: 'Event Date is required' })
        .refine(
          (value) => /^\d{2}\/\d{2}\/\d{4}$/.test(value), // Regex to validate MM/DD/YYYY format
          { message: 'Event Date must be in MM/DD/YYYY format' }
        )
        .refine(
          (value) => {
            const [month, day, year] = value.split('/').map(Number) // Parse the date values
            const eventDate = new Date(year, month - 1, day) // `month - 1` because JavaScript uses 0-indexed months
            const today = new Date()
            today.setHours(0, 0, 0, 0) // Set current date to start of the day (ignore time)
            return eventDate >= today // Check if date is today or in the future
          },
          { message: 'Event Date cannot be in the past' }
        ),
      status: zod
        .string()
        .refine((value) => statuses.map((status) => status.value).includes(value)),
      visibility: zod
        .string()
        .refine((value) => visibilities.map((visibility) => visibility.value).includes(value))
    })
  )
})

const initUrlSlug = () => {
  eventState.customUrlSlug = eventState.eventName
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}

const cancelCreateEvent = () => {
  emit('cancelCreate')
}

const onSubmit = async () => {
  try {
    eventState.processing = true

    const result = await eventStore.createEvent(eventState)
    if (result.status >= 200 && result.status < 300) {
      // process event added.
    } else {
      const { data } = result.response ?? {}
      eventErrors.value = data.message ?? DEFAULT_ERROR_MESSAGE
    }
  } catch (e) {
    eventErrors.value = DEFAULT_ERROR_MESSAGE
    console.log('catching errors', e)
  } finally {
    eventState.processing = false
  }
}

const onInvalidSubmit = (err) => {
  console.log(err)
  eventErrors.value = 'Please fix the following errors'
}

watch(
  () => eventState.eventName,
  () => {
    initUrlSlug()
  }
)
</script>

<template>
  <div class="bg-gray-800 text-white p-6 rounded-lg shadow-md">
    <!-- Header Section -->
    <div class="flex justify-between items-center pb-4 border-b border-gray-700 mb-6">
      <h3 class="text-lg font-semibold">Create or Edit Event Details</h3>
      <XMarkIcon
        class="h-6 w-6 cursor-pointer"
        @click="cancelCreateEvent"
      ></XMarkIcon>
    </div>

    <!-- Event Details Form -->
    <Form
      :validation-schema="eventValidationSchema"
      @submit="onSubmit"
      @invalid-submit="onInvalidSubmit"
    >
      <!-- Error Section -->
      <div v-if="eventErrors" class="w-full mb-4">
        <p class="text-red-500 font-semibold">
          {{ eventErrors }}
        </p>
      </div>

      <div class="grid grid-cols-2 gap-6">
        <!-- Event Name -->
        <div>
          <TextField
            v-model="eventState.eventName"
            label="Event Name"
            name="eventName"
            show-error
            placeholder="Enter the event name"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
          />
        </div>

        <!-- Event Date -->
        <div>
          <DateField
            v-model="eventState.eventDate"
            label="Event Date"
            name="eventDate"
            show-error
            placeholder="MM/DD/YYYY"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
          />
        </div>

        <!-- Event Description -->
        <div class="col-span-2">
          <TextAreaField
            v-model="eventState.eventDescription"
            label="Event Description"
            name="eventDescription"
            show-error
            placeholder="Tell us more about the event..."
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
          />
        </div>

        <!-- Event Status -->
        <div>
          <SelectField
            label="Status"
            name="status"
            show-error
            v-model="eventState.status"
            :items="statuses"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
          />
        </div>

        <!-- Event Visibility -->
        <div>
          <SelectField
            label="Visibility"
            name="visibility"
            show-error
            v-model="eventState.visibility"
            :items="visibilities"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
          />
        </div>

        <!-- Custom URL Slug -->
        <div>
          <p class="text-gray-400 text-sm mb-1">Web URL Slug</p>
          <TextField
            v-model="eventState.customUrlSlug"
            disabled
            name="customUrlSlug"
            placeholder="Generated automatically"
            :class-input="`w-full bg-gray-900 text-gray-500 border-none px-2 py-1 rounded-md`"
          />
        </div>
      </div>

      <!-- Form Buttons -->
      <div class="mt-6 flex justify-end items-center gap-4">
        <button
          type="button"
          @click="cancelCreateEvent"
          class="bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium py-2 px-6 rounded-md"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-6 rounded-md"
        >
          Save Event
        </button>
      </div>
    </Form>
  </div>
</template>


<style scoped></style>
