<script setup>
import { PlusIcon } from '@heroicons/vue/16/solid'
import Alert from '@/components/UI/alerts/Alert.vue'
import { reactive, ref, watch } from 'vue'
import TextField from '@/components/UI/form/TextField.vue'
import DateField from '@/components/UI/form/DateField.vue'
import TextAreaField from '@/components/UI/form/TextAreaField.vue'
import SelectField from '@/components/UI/form/SelectField.vue'
import { EVENT_STATUSES as statuses } from '@/constants/constants'
import { EVENT_VISIBILITIES as visibilities } from '@/constants/constants'

// Data
const showAddEventView = ref(false)
const eventState = reactive({
  eventName: '',
  eventDescription: '',
  eventDate: '',
  status: 'draft',
  customUrlSlug: '',
  visibility: 'private'
})


const showAddEvent = () => {
  showAddEventView.value = true
}

const initUrlSlug = () => {
  eventState.customUrlSlug = eventState.eventName
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

watch(() => eventState.eventName, () => {
  initUrlSlug()
})

</script>

<template>
  <section class="my-events">
    <div class="flex flex-row justify-end">
      <h2 class="text-white text-2xl font-semibold">Events</h2>
    </div>
    <section
      class="my-events-container flex flex-row gap-x-4 mt-10 border-2 border-gray-200/10
             p-10 rounded-md min-h-[300px] h-full"
    >
      <div
        class="events-lists w-[30%]"
      >
        <div class="add__new-event">
          <p
            class="text-yellow-100/40 transition-colors duration-500 hover:text-yellow-300/75
                   flex flex-row gap-x-1 justify-start items-center cursor-pointer"
            @click="showAddEvent"
          >
            <PlusIcon class="h-6 w-6" />
            Add New Event
          </p>
        </div>
      </div>

      <div class="event-handle w-[70%]">
        <Alert alert-type="info">
          You don't have any event yet!
        </Alert>
        <div
          class="w-full"
        >
          <Form
            class="flex flex-row gap-x-2 flex-wrap"
          >
            <div
              class="w-[49%]"
            >
              <TextField
                v-model="eventState.eventName"
                name="eventName"
                :label="'Event Name'"
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
                class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg
                    focus:outline-none focus:border-none focus:ring-2 focus:ring-blue-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg
                    focus:outline-none focus:border-none focus:ring-2 focus:ring-blue-400"
              >
                Register
              </button>
            </div>
          </Form>
        </div>
      </div>
    </section>
  </section>
</template>

<style scoped>

</style>
