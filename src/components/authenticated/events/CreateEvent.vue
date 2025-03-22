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
import CWMLoading from '@/components/UI/loading/CWMLoading.vue'
import { useNotificationStore } from '@/stores/useNotificationStore'
import ToggleField from '@/components/UI/form/ToggleField.vue'

const emit = defineEmits(['cancelCreate'])
const props = defineProps({
  mode: {
    type: String,
    required: false,
    default: 'create',
    validator: (value) => ['create', 'edit'].includes(value)
  }
})


const eventState = reactive({
  eventName: '',
  eventDescription: '',
  status: 'draft',
  startDate: '',
  endDate: '',
  customUrlSlug: '',
  visibility: 'private',
  processing: false,
  saveTheDate: false,
  rsvp: false,
  gallery: false,
  music: false,
  backgroundMusic: false,
  seatsAccommodation: false,
  preview: false,
  eventBudget: false,
  analytics: false
})
const eventErrors = ref()
const notificationStore = useNotificationStore()
const eventStore = useEventsStore()

const eventValidationSchema = computed(() => {
  return toTypedSchema(
    zod
      .object({
        eventName: zod.string().min(1, { message: 'Event Name is required' }),
        startDate: zod
          .string()
          .min(1, { message: 'Start Date is required' })
          .refine(
            (value) => /^\d{2}\/\d{2}\/\d{4}( \d{2}:\d{2})?$/.test(value), // Validate MM/DD/YYYY or MM/DD/YYYY HH:mm
            { message: 'Start Date must be in MM/DD/YYYY or MM/DD/YYYY HH:mm format' }
          )
          .refine(
            (value) => {
              const [datePart, timePart] = value.split(' ')
              const [month, day, year] = datePart.split('/').map(Number)
              const [hours, minutes] = (timePart || '00:00').split(':').map(Number)
              const eventDateTime = new Date(year, month - 1, day, hours, minutes)

              return eventDateTime >= new Date() // Ensure date is not in the past
            },
            { message: 'Start Date cannot be in the past' }
          ),
        endDate: zod
          .string()
          .min(1, { message: 'End Date is required' })
          .refine(
            (value) => /^\d{2}\/\d{2}\/\d{4}( \d{2}:\d{2})?$/.test(value), // Validate MM/DD/YYYY or MM/DD/YYYY HH:mm
            { message: 'End Date must be in MM/DD/YYYY or MM/DD/YYYY HH:mm format' }
          )
          .refine(
            (value) => {
              const [datePart, timePart] = value.split(' ')
              const [month, day, year] = datePart.split('/').map(Number)
              const [hours, minutes] = (timePart || '00:00').split(':').map(Number)
              const endDateTime = new Date(year, month - 1, day, hours, minutes)

              return endDateTime > new Date() // Ensure date is in the future
            },
            { message: 'End Date must be in the future' }
          ),
        status: zod
          .string()
          .refine((value) => statuses.map((status) => status.value).includes(value)),
        visibility: zod
          .string()
          .refine((value) => visibilities.map((visibility) => visibility.value).includes(value))
      })
      .refine(
        (data) => {
          const { startDate, endDate } = data

          if (!startDate || !endDate) {
            return false
          }

          const [startDatePart, startTimePart] = startDate.split(' ')
          const [startMonth, startDay, startYear] = startDatePart.split('/').map(Number)
          const [startHours, startMinutes] = (startTimePart || '00:00').split(':').map(Number)
          const startDateTime = new Date(
            startYear,
            startMonth - 1,
            startDay,
            startHours,
            startMinutes
          )

          const [endDatePart, endTimePart] = endDate.split(' ')
          const [endMonth, endDay, endYear] = endDatePart.split('/').map(Number)
          const [endHours, endMinutes] = (endTimePart || '00:00').split(':').map(Number)
          const endDateTime = new Date(endYear, endMonth - 1, endDay, endHours, endMinutes)

          return endDateTime > startDateTime
        },
        {
          message: 'End Date must be after Start Date'
        }
      )
  )
})

const capitalizedMode = computed(() => {
  return props.mode.charAt(0).toUpperCase() + props.mode.slice(1)
})

onMounted(() => {
  if (props.mode === 'edit') {
    initializeValues()
  }
})

const initializeValues = () => {
    eventState.eventName = eventStore.currentEvent.eventName
    eventState.eventDescription = eventStore.currentEvent.eventDescription
    eventState.status = eventStore.currentEvent.status
    eventState.startDate = eventStore.currentEvent.startDate
    eventState.endDate = eventStore.currentEvent.endDate
    eventState.customUrlSlug = eventStore.currentEvent.customUrlSlug
    eventState.visibility = eventStore.currentEvent.visibility
    eventState.processing = false
    eventState.saveTheDate = !!eventStore.currentEvent?.eventFeature?.saveTheDate ?? false
    eventState.rsvp = !!eventStore.currentEvent?.eventFeature?.rsvp ?? false
    eventState.gallery = !!eventStore.currentEvent?.eventFeature?.gallery ?? false
    eventState.music = !!eventStore.currentEvent?.eventFeature?.music ?? false
    eventState.backgroundMusic = !!eventStore.currentEvent?.eventFeature?.backgroundMusic ?? false
    eventState.seatsAccommodation = !!eventStore.currentEvent?.eventFeature?.seatsAccommodation ?? false
    eventState.preview = !!eventStore.currentEvent?.eventFeature?.preview ?? false
    eventState.eventBudget = !!eventStore.currentEvent?.eventFeature?.budget ?? false
    eventState.analytics = !!eventStore.currentEvent?.eventFeature?.analytics ?? false
}

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

const createOrEditEvent = async () => {
  if (props.mode === 'edit') {
    return await eventStore.editEvent(eventState)
  }

  return await eventStore.createEvent(eventState)
}

const onSubmit = async (fields, { resetForm }) => {
  try {
    eventState.processing = true

    const result = await createOrEditEvent()

    if (result.status >= 200 && result.status < 300) {
      notificationStore.addNotification({
        type: 'success',
        message: 'Event processed successfully!'
      })

      //cleanForm(resetForm)

      await eventStore.initEvents(result.data.data.id)
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

const cleanForm = (resetForm) => {
  eventState.eventName = ''
  eventState.eventDescription = ''
  eventState.eventDate = ''
  eventState.status = 'draft'
  eventState.customUrlSlug = ''
  eventState.visibility = 'private'
  eventState.processing = false

  resetForm({
    values: {
      eventName: '',
      eventDescription: '',
      eventDate: '',
      status: 'draft',
      customUrlSlug: '',
      visibility: 'private',
      processing: false
    },
    touched: {
      eventName: false,
      eventDescription: false,
      eventDate: false,
      status: false,
      customUrlSlug: false,
      visibility: false,
      processing: false
    }
  })
}

const onInvalidSubmit = (err) => {
  eventErrors.value = 'Please fix the following errors'

  if (Object.keys(err.errors).length) {
    eventErrors.value = Object.values(err.errors)[0] || 'Please fix the following errors'
  }
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
      <h3 class="text-lg font-semibold">
        <span v-if="mode === 'create'">
          {{ capitalizedMode }} Event</span>
        <span v-else>Edit Event</span>
      </h3>
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
          <SelectField
            label="Status"
            name="status"
            show-error
            v-model="eventState.status"
            :items="statuses"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
          />
        </div>

        <div>
          <DateField
            v-model="eventState.startDate"
            label="Start Date"
            name="startDate"
            show-error
            also-time
            placeholder="MM/DD/YYYY"
            :class-input="`w-full bg-gray-900 text-white border-none px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`"
          />
        </div>

        <div>
          <DateField
            v-model="eventState.endDate"
            label="End Date"
            name="endDate"
            show-error
            also-time
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

      <div class="mt-5 border-b border-gray-700 mb-5"></div>

      <h3 class="text-lg font-semibold">Event Features</h3>
      <div class="grid grid-cols-2 gap-6 mt-5">
        <ToggleField label="Save the Date" name="saveTheDate" v-model="eventState.saveTheDate" />

        <ToggleField label="RSVP" name="rsvp" v-model="eventState.rsvp" />

        <ToggleField label="Gallery" name="gallery" v-model="eventState.gallery" />

        <ToggleField label="Music" name="music" v-model="eventState.music" />

        <ToggleField label="Background Music" name="backgroundMusic" v-model="eventState.backgroundMusic" />

        <ToggleField
          label="Seats Accommodation"
          name="seatsAccommodation"
          v-model="eventState.seatsAccommodation"
        />

        <ToggleField label="Page Event Preview" name="preview" v-model="eventState.preview" />

        <ToggleField label="Event Budget" name="eventBudget" v-model="eventState.eventBudget" />

        <ToggleField label="Event Analytics" name="analytics" v-model="eventState.analytics" />
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
          class="text-white text-sm font-medium py-2 px-6 rounded-md"
          :class="
            eventState.processing
              ? 'bg-gray-500 hover:bg-gray-600 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
          "
          :disabled="eventState.processing"
        >
          <CWMLoading v-if="eventState.processing" />
          <span v-if="eventState.processing">Sending...</span>
          <span v-else>
            <span v-if="mode === 'create'">Save Event</span>
            <span v-else>Edit Event</span>
          </span>
        </button>
      </div>
    </Form>
  </div>
</template>

<style scoped></style>
