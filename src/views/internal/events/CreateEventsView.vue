<template>
  <div class="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-card">
    <!-- Header -->
    <div class="flex flex-col justify-start items-start pb-4 mb-8">
      <h2 class="text-xl font-display font-bold text-gray-900 dark:text-white">
        {{ mode === 'edit' ? 'Edit Event' : 'Create New Event' }}
      </h2>
      <p class="text-gray-600 dark:text-gray-400 text-sm">
        Follow the steps to {{ mode === 'edit' ? 'edit your' : 'create a new' }} event.
      </p>
    </div>

    <Form
      :validation-schema="eventValidationSchema"
      @submit="onSubmit"
      @invalid-submit="onInvalidSubmit"
    >
      <CWizard
        :steps="steps"
        :nextValid="isValidNext"
        :initial-step="currentStep"
        @active-step="handleStepChange"
        @submit="handleSubmit"
      >
        <template #current-Step="{ step }">
          <!-- Step 1: Basic Information -->
          <div v-if="step === 0" class="space-y-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>

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
              <CSelect
                v-model="eventState.eventType"
                name="eventType"
                :options="eventTypes"
                id="event-type"
                show-error
              />
            </div>

            <!-- Tips Panel -->
            <div class="bg-primary/5 dark:bg-secondary/10 p-4 rounded-md text-sm text-gray-800 dark:text-white">
              <h4 class="text-lg font-semibold mb-2 text-primary dark:text-pink-300">
                Tips for Basic Information
              </h4>
              <ul class="list-disc ml-4 space-y-1">
                <li>Use a clear and meaningful event name.</li>
                <li>Provide a concise description of your event.</li>
                <li>Select the appropriate event type.</li>
              </ul>
            </div>
          </div>

          <!-- Step 2: Date and Time -->
          <div v-else-if="step === 1" class="space-y-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Date and Time</h3>

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
            </div>

            <!-- Tips Panel -->
            <div class="bg-primary/5 dark:bg-secondary/10 p-4 rounded-md text-sm text-gray-800 dark:text-white">
              <h4 class="text-lg font-semibold mb-2 text-primary dark:text-pink-300">
                Tips for Date and Time
              </h4>
              <ul class="list-disc ml-4 space-y-1">
                <li>Set accurate start and end dates.</li>
                <li>Include time information for better planning.</li>
                <li>Ensure the end date is after the start date.</li>
              </ul>
            </div>
          </div>

          <!-- Step 3: Visibility and Status -->
          <div v-else-if="step === 2" class="space-y-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Visibility and Status</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>

            <!-- Tips Panel -->
            <div class="bg-primary/5 dark:bg-secondary/10 p-4 rounded-md text-sm text-gray-800 dark:text-white">
              <h4 class="text-lg font-semibold mb-2 text-primary dark:text-pink-300">
                Tips for Visibility and Status
              </h4>
              <ul class="list-disc ml-4 space-y-1">
                <li>Choose visibility based on your audience.</li>
                <li>Save as draft if you're not ready to publish.</li>
                <li>You can always update these settings later.</li>
              </ul>
            </div>
          </div>

          <!-- Step 4: Event Features -->
          <div v-else-if="step === 3" class="space-y-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Event Features</h3>
            <p class="text-gray-600 dark:text-gray-400 text-sm">
              Enable or disable the features for your event.
            </p>

            <div class="space-y-4">
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

            <!-- Tips Panel -->
            <div class="bg-primary/5 dark:bg-secondary/10 p-4 rounded-md text-sm text-gray-800 dark:text-white">
              <h4 class="text-lg font-semibold mb-2 text-primary dark:text-pink-300">
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

          <!-- Step 5: Review and Submit -->
          <div v-else-if="step === 4" class="space-y-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Review and Submit</h3>

            <div class="space-y-4">
              <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                <h4 class="font-medium text-gray-900 dark:text-white mb-2">Basic Information</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Event Name</p>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">{{ eventState.eventName || 'Not provided' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Event Type</p>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ eventTypes.find(t => t.value === eventState.eventType)?.label || 'Not selected' }}
                    </p>
                  </div>
                  <div class="md:col-span-2">
                    <p class="text-sm text-gray-500 dark:text-gray-400">Description</p>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">{{ eventState.eventDescription || 'Not provided' }}</p>
                  </div>
                </div>
              </div>

              <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                <h4 class="font-medium text-gray-900 dark:text-white mb-2">Date and Time</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Start Date</p>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">{{ eventState.startDate || 'Not provided' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">End Date</p>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">{{ eventState.endDate || 'Not provided' }}</p>
                  </div>
                </div>
              </div>

              <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                <h4 class="font-medium text-gray-900 dark:text-white mb-2">Visibility and Status</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Status</p>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ statuses.find(s => s.value === eventState.status)?.label || 'Not selected' }}
                    </p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Visibility</p>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ visibilities.find(v => v.value === eventState.visibility)?.label || 'Not selected' }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                <h4 class="font-medium text-gray-900 dark:text-white mb-2">Enabled Features</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div v-for="feature in featuresList" :key="feature.name" class="flex items-center gap-2">
                    <component :is="feature.icon" class="w-4 h-4 text-primary dark:text-secondary" />
                    <p class="text-sm text-gray-900 dark:text-white">
                      {{ feature.label }}:
                      <span :class="eventState[feature.model] ? 'text-green-500' : 'text-red-500'">
                        {{ eventState[feature.model] ? 'Enabled' : 'Disabled' }}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="eventErrors" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md text-sm">
              {{ eventErrors }}
            </div>
          </div>
        </template>
      </CWizard>

      <div class="mt-6 flex justify-end">
        <CButton variant="outline" @click="cancelCreateEvent" class="mr-4">Cancel</CButton>
      </div>
    </Form>
  </div>
</template>

<script setup>
import { Form } from 'vee-validate'
import { computed, reactive, ref, onMounted, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'

import CInput from '@/components/UI/form2/CInput.vue'
import CTextarea from '@/components/UI/form2/CTextarea.vue'
import CDate from '@/components/UI/form2/CDate.vue'
import CSelect from '@/components/UI/form2/CSelect.vue'
import CToggle from '@/components/UI/form2/CToggle.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CWMLoading from '@/components/UI/loading/CWMLoading.vue'
import CWizard from '@/components/UI/wizard/CWizard.vue'

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

// Wizard configuration
const currentStep = ref(0)
const isValidNext = ref(true)

const steps = [
  { title: 'Basic Info' },
  { title: 'Date & Time' },
  { title: 'Visibility' },
  { title: 'Features' },
  { title: 'Review' },
]

const handleStepChange = (step) => {
  currentStep.value = step
  validateCurrentStep()
}

const validateCurrentStep = () => {
  switch (currentStep.value) {
    case 0: // Basic Info
      isValidNext.value = !!eventState.eventName && !!eventState.eventType
      break
    case 1: // Date & Time
      isValidNext.value = !!eventState.startDate && !!eventState.endDate
      break
    case 2: // Visibility
      isValidNext.value = !!eventState.status && !!eventState.visibility
      break
    case 3: // Features
      isValidNext.value = true // Features are optional
      break
    case 4: // Review
      isValidNext.value = true // Review is just for confirmation
      break
    default:
      isValidNext.value = true
  }
}

// Watch for changes in form fields to update validation
watch(
  () => [
    eventState.eventName,
    eventState.eventType,
    eventState.startDate,
    eventState.endDate,
    eventState.status,
    eventState.visibility
  ],
  () => validateCurrentStep(),
  { deep: true }
)

const handleSubmit = () => {
  onSubmit()
}

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
      eventType: zod.number({
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

      // Initialize validation for wizard
      validateCurrentStep()
    }
  }
})


const normalizeBooleans = (obj, keys) => {
  keys.forEach((key) => {
    obj[key] = !!obj[key]
  })
}

const cancelCreateEvent = () => {
  // Reset form data
  Object.keys(eventState).forEach(key => {
    if (typeof eventState[key] === 'boolean') {
      eventState[key] = false
    } else if (typeof eventState[key] === 'string') {
      eventState[key] = ''
    } else if (typeof eventState[key] === 'number') {
      eventState[key] = 0
    }
  })

  // Reset wizard to first step
  currentStep.value = 0

  // Navigate back to events view
  router.push('/dashboard/events')
}

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
