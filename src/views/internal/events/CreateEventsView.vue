<template>
  <Form
    :validation-schema="eventValidationSchema"
    @submit="onSubmit"
    @invalid-submit="onInvalidSubmit"
  >
    <div class="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-card">
      <!-- Header -->
      <div class="flex flex-col justify-start items-start pb-4 mb-8">
        <h2 class="text-xl font-display font-bold text-gray-900 dark:text-white">
          {{ mode === 'edit' ? 'Edit Event' : 'Create New Event' }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400 text-sm">
          Enable or disable the features for your event.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div class="lg:col-span-2 space-y-10">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="md:col-span-2">
              <CInput
                v-model="eventState.eventName"
                name="eventName"
                placeholder="Enter event name"
                id="event-name"
                show-error
              />
            </div>

            <div class="md:col-span-2">
              <CTextarea
                :rows="1"
                v-model="eventState.eventDescription"
                name="eventDescription"
                placeholder="Tell us about your event..."
                show-error
                id="event-description"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CDate
              v-model="eventState.startDate"
              name="startDate"
              placeholder="MM/DD/YYYY"
              also-time
              show-error
              id="start-date"
            />

            <CDate
              v-model="eventState.endDate"
              name="endDate"
              placeholder="MM/DD/YYYY"
              also-time
              id="end-date"
              show-error
            />

            <CSelect
              v-model="eventState.status"
              name="status"
              :options="statuses"
              id="event-status"
              show-error
            />

            <CSelect
              v-model="eventState.visibility"
              name="visibility"
              :options="visibilities"
              id="event-visibility"
              show-error
            />

            <CSelect
              v-model="eventState.eventType"
              name="eventType"
              :options="eventTypes"
              id="event-type"
              show-error
            />
          </div>
        </div>

        <!-- Tips Panel -->
        <div
          class="hidden lg:block bg-primary/5 dark:bg-secondary/10 p-4 rounded-md text-sm text-gray-800 dark:text-white self-stretch h-full"
        >
          <h3 class="text-lg font-semibold mb-4 text-primary dark:text-pink-300">
            Tips for Creating a Great Event
          </h3>
          <ul class="list-disc ml-4 space-y-2">
            <li>Use a clear and meaningful event name.</li>
            <li>Set accurate start and end dates.</li>
            <li>Choose visibility based on your audience.</li>
            <li>Save as draft if you're not ready to publish.</li>
          </ul>
          <p class="mt-4 text-xs text-gray-500 dark:text-gray-400">
            You can always update these details later.
          </p>
        </div>
      </div>

      <!-- Features -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 items-start">
        <div class="md:col-span-2 space-y-4">
          <h2 class="text-xl font-display font-bold text-gray-900 dark:text-white">
            Event Features
          </h2>
          <p class="text-gray-600 dark:text-gray-400 text-sm">
            Enable or disable the features for your event.
          </p>

          <div
            v-for="feature in featuresList"
            :key="feature.name"
            class="flex items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-700 py-5"
          >
            <div class="flex items-center gap-4 w-full">
              <component :is="feature.icon" class="w-6 h-6 text-primary dark:text-secondary mt-1" />
              <div class="flex-1">
                <p class="text-sm font-semibold text-gray-900 dark:text-white">
                  {{ feature.label }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ feature.description }}</p>
              </div>
            </div>
            <div class="flex-shrink-0 ml-4">
              <CToggle :name="feature.name" v-model="eventState[feature.model]" />
            </div>
          </div>
        </div>

        <div
          class="hidden lg:block bg-primary/5 dark:bg-secondary/10 p-4 rounded-md text-sm text-gray-800 dark:text-white self-stretch h-full"
        >
          <h4 class="text-lg font-semibold mb-4 text-primary dark:text-pink-300">
            Feature Settings
          </h4>
          <p>
            These settings control which modules will be available in your event dashboard and
            shared page.
          </p>
          <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Toggle on only the features you plan to use — they can be changed at any time later.
          </p>
        </div>
      </div>

      <div class="mt-10 flex justify-end gap-4">
        <CButton variant="outline" @click="cancelCreateEvent">Cancel</CButton>
        <CButton type="submit" :disabled="eventState.processing">
          <template v-if="eventState.processing">
            <CWMLoading class="mr-2" />
            Sending...
          </template>
          <template v-else>
            {{ mode === 'edit' ? 'Update Event' : 'Create Event' }}
          </template>
        </CButton>
      </div>
    </div>
  </Form>
</template>

<script setup>
import { Form } from 'vee-validate'
import { computed, reactive, ref, onMounted } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'

import CInput from '@/components/UI/form2/CInput.vue'
import CTextarea from '@/components/UI/form2/CTextarea.vue'
import CDate from '@/components/UI/form2/CDate.vue'
import CSelect from '@/components/UI/form2/CSelect.vue'
import CToggle from '@/components/UI/form2/CToggle.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CWMLoading from '@/components/UI/loading/CWMLoading.vue'

import { useEventsStore } from '@/stores/useEventsStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { EVENT_STATUSES as statuses, EVENT_VISIBILITIES as visibilities, DEFAULT_ERROR_MESSAGE } from '@/constants/constants'
import {
  Calendar,
  Music,
  Waves,
  ImageIcon,
  MessageSquareText,
  MapIcon,
} from 'lucide-vue-next'
import { useUserStore } from '@/stores/useUserStore'
import { useRoute, useRouter } from 'vue-router'

const emit = defineEmits(['cancelCreate'])
const eventState = reactive({
  eventName: '',
  eventDescription: '',
  eventType: '',
  status: '',
  startDate: '',
  endDate: '',
  visibility: '',
  processing: false,
  saveTheDate: false,
  rsvp: false,
  menu: false,
  sweetMemories: false,
  music: false,
  backgroundMusic: false,
  eventComments: false,
  seatsAccommodation: false,
  preview: false,
  eventBudget: false,
  analytics: false,
  location: false,
})

const featuresList = [
  { name: 'Menu', model: 'menu', icon: Calendar, label: 'Menu', description: 'Allow the guest to select the menu.' },
  { name: 'RSVP', model: 'rsvp', icon: Calendar, label: 'RSVP', description: 'Allow guests to RSVP to your event.' },
  { name: 'sweetMemories', model: 'sweetMemories', icon: ImageIcon, label: 'Sweet Memories', description: 'Create a photo gallery to capture memories of your event.' },
  { name: 'music', model: 'music', icon: Waves, label: 'Music', description: 'Share a music playlist with your guests.' },
  { name: 'backgroundMusic', model: 'backgroundMusic', icon: Music, label: 'Background Music', description: 'Enable background music on the event page.' },
  { name: 'eventComments', model: 'eventComments', icon: MessageSquareText, label: 'Event Comments', description: 'On/Off event comments sections.' },
  { name: 'location', model: 'location', icon: MapIcon, label: 'Location', description: 'Enable location on the event page.' },
]

const eventStore = useEventsStore()
const userStore = useUserStore()
const notificationStore = useNotificationStore()
const eventErrors = ref('')
const router = useRouter()
const route = useRoute()
const mode = ref('create')

const eventValidationSchema = computed(() => {
  return toTypedSchema(
    zod.object({
      eventName: zod.string().min(1, 'Event name is required.'),
      eventType: zod.string({
        required_error: 'Event type is required.',
        invalid_type_error: 'Invalid event type.'
      }),
      startDate: zod.string().min(1, 'Start date is required.'),
      endDate: zod.string().min(1, 'End date is required.'),
      status: zod.string().min(1, { message: 'Status is required' }),
      visibility: zod.string().min(1, { message: 'Status is required' })
    }).refine(data => {
      const [start, end] = [new Date(data.startDate), new Date(data.endDate)]
      return end > start
    }, { message: 'End Date must be after Start Date' })
  )
})

const eventTypes = computed(() => {
  return eventStore.eventTypes.map((type) => ({
    label: type.name,
    value: type.id + ''
  }))
})

onMounted(async () => {
  if (route.name === 'edit-event') {
    mode.value = 'edit'
    const routeId = route.params.id?.toString()
    const activeId = eventStore.activeEvent?.id?.toString()

    if (!routeId || routeId !== activeId) {
      notificationStore.addNotification({
        type: 'error',
        message: 'You can only edit the currently active event.'
      })
      await router.push('/dashboard')
    } else {
      const current = eventStore.activeEvent
      let features = {}

      eventStore.activeEvent.eventFeatures.forEach((feature) => {
        features[feature.name] = feature.isActive
      })

      Object.assign(eventState, {
        ...current,
        ...features
      })

      normalizeBooleans(eventState, [
        'saveTheDate',
        'rsvp',
        'menu',
        'sweetMemories',
        'music',
        'backgroundMusic',
        'eventComments',
        'seatsAccommodation',
        'preview',
        'eventBudget',
        'analytics'
      ])
    }
  }
})


const normalizeBooleans = (obj, keys) => {
  keys.forEach((key) => {
    obj[key] = !!obj[key]
  })
}

const cancelCreateEvent = () => emit('cancelCreate')

const createOrEditEvent = () => mode.value === 'edit'
  ? eventStore.editEvent(eventState)
  : eventStore.createEvent(eventState)

const onSubmit = async () => {
  try {
    eventState.processing = true
    const result = await createOrEditEvent()
    if (result.status >= 200 && result.status < 300) {
      notificationStore.addNotification({
        type: 'success',
        message: 'Event processed successfully!'
      })

      const userUpdated = await userStore.initUserEvents()

      if (userUpdated.status >= 200 && userUpdated.status < 300) {
        const result = userUpdated.data?.data ?? {}
        await eventStore.initUserEventsData(result)

        await router.push('/dashboard/events')
      } else {
        console.log('Error loading events')
        if (userUpdated.status === 401) {
          notificationStore.addNotification({
            type: 'error',
            message: 'Session expired. Please log in again.',
          })
        }
      }
    } else {
      eventErrors.value = result.response?.data?.message ?? DEFAULT_ERROR_MESSAGE
    }
  } catch (error){
    console.log('checking errors', error)
    eventErrors.value = DEFAULT_ERROR_MESSAGE
  } finally {
    eventState.processing = false
  }
}

const onInvalidSubmit = (e) => {
  console.log('invalid form', e)
  eventErrors.value = Object.values(e.errors)[0] || DEFAULT_ERROR_MESSAGE
}
</script>
