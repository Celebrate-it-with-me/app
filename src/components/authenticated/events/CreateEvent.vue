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
  <Form
    class="flex flex-row gap-x-2 flex-wrap"
    :validation-schema="eventValidationSchema"
    @submit="onSubmit"
    @invalid-submit="onInvalidSubmit"
  >
    <div
      v-if="eventErrors"
      class="w-full"
    >
      <p class="text-lg text-red-800 dark:text-red-400 font-semibold mb-4">
        {{ eventErrors }}
      </p>
    </div>
    <div class="w-[49%]">
      <TextField
        v-model="eventState.eventName"
        name="eventName"
        :label="'Event Name'"
        show-error
        placeholder="Party Time"
        :class-label="'block text-gray-300 font-medium mb-2'"
        :class-input="`w-full bg-gray-900 text-white border-gray-700 border rounded-lg px-4
                       py-2 focus:outline-none focus:border-none focus:ring-2 focus:ring-gray-700`"
      />
    </div>
    <div class="w-[49%]">
      <DateField
        v-model="eventState.eventDate"
        name="eventDate"
        :label="'Event Date'"
        show-error
        placeholder="Select the event Date"
        :class-label="'block text-gray-300 font-medium mb-2'"
        :class-input="`w-full bg-gray-900 text-white border-gray-700 border rounded-lg px-4
                       py-2 focus:outline-none focus:border-none focus:ring-2 focus:ring-gray-700`"
      />
    </div>

    <div class="w-[100%] mt-4">
      <TextAreaField
        v-model="eventState.eventDescription"
        name="eventDescription"
        placeholder="Description"
        label="Event Description"
        show-error
        :class-label="'block text-gray-300 font-medium mb-2'"
        :class-input="`w-full bg-gray-900 text-white border-gray-700 border rounded-lg px-4
                       py-2 focus:outline-none focus:border-none focus:ring-2 focus:ring-gray-700`"
      />
    </div>

    <div class="w-[49%] mt-4">
      <SelectField
        label="Event Status"
        name="status"
        v-model="eventState.status"
        :items="statuses"
        show-error
        :class-label="'block text-gray-300 font-medium mb-2'"
        :class-input="`w-full bg-gray-900 text-white border-gray-700 border rounded-lg px-4
                       py-2 focus:outline-none focus:border-none focus:ring-2 focus:ring-gray-700`"
      />
    </div>

    <div class="w-[49%] mt-4">
      <SelectField
        label="Event Visibility"
        name="visibility"
        v-model="eventState.visibility"
        :items="visibilities"
        show-error
        :class-label="'block text-gray-300 font-medium mb-2'"
        :class-input="`w-full bg-gray-900 text-white border-gray-700 border rounded-lg px-4
                       py-2 focus:outline-none focus:border-none focus:ring-2 focus:ring-gray-700`"
      />
    </div>

    <div class="w-[49%] mt-4">
      <TextField
        v-model="eventState.customUrlSlug"
        disabled
        name="customUrlSlug"
        :label="'Web Url Slug - ReadOnly'"
        placeholder="slug-for-event-web"
        :class-label="'block text-gray-300 font-medium mb-2'"
        :class-input="`w-full bg-gray-900 text-white border-gray-700 border rounded-lg px-4
                       py-2 focus:outline-none focus:border-none focus:ring-2 focus:ring-gray-700`"
      />
    </div>

    <div class="w-full mt-5 flex flex-row gap-x-5 justify-end">
      <button
        type="button"
        class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:border-none focus:ring-2 focus:ring-blue-400"
        @click="cancelCreateEvent"
      >
        Cancel
      </button>
      <button
        type="submit"
        class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:border-none focus:ring-2 focus:ring-blue-400"
      >
        Register
      </button>
    </div>
  </Form>
</template>

<style scoped></style>
