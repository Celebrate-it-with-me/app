import { ref, computed, onMounted, reactive } from 'vue'
import { useEventsStore } from '../stores/useEventsStore'
import { useUserStore } from '@/stores/useUserStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { useRoute, useRouter } from 'vue-router'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import {
  Calendar,
  Cake,
  Baby,
  Heart,
  Music,
  Waves,
  ImageIcon,
  MessageSquareText,
  MapIcon,
  Wallet,
  PartyPopper,
  Sparkles
} from 'lucide-vue-next'

export function useCreateEventController() {
  const eventStore = useEventsStore()
  const notificationStore = useNotificationStore()
  const route = useRoute()
  const router = useRouter()

  const mode = ref('create')
  const showEmptyState = ref(false)
  const currentStep = ref(0)

  const eventState = reactive({
    eventName: '',
    eventDescription: '',
    eventType: '',
    startDate: '',
    endDate: '',
    isPublished: false,
    isPublic: true,
    processing: false,
    // Features
    rsvp: false,
    menu: false,
    sweetMemories: false,
    music: false,
    location: false,
    backgroundMusic: false,
    eventComments: false,
    budget: false
  })

  const smartDefaults = {
    wedding: ['rsvp', 'menu', 'sweetMemories', 'location'],
    birthday: ['rsvp', 'sweetMemories', 'location'],
    quinceanera: ['rsvp', 'menu', 'sweetMemories', 'music', 'location'],
    'baby-shower': ['rsvp', 'menu', 'sweetMemories', 'location'],
    other: ['rsvp', 'location']
  }

  const featuresList = [
    {
      name: 'RSVP',
      model: 'rsvp',
      icon: Calendar,
      label: 'RSVP',
      description: 'Let guests confirm attendance',
      category: 'core'
    },
    {
      name: 'Location',
      model: 'location',
      icon: MapIcon,
      label: 'Location',
      description: 'Share event venue details',
      category: 'core'
    },
    {
      name: 'sweetMemories',
      model: 'sweetMemories',
      icon: ImageIcon,
      label: 'Sweet Memories',
      description: 'Photo gallery for guests',
      category: 'core'
    },
    {
      name: 'Menu',
      model: 'menu',
      icon: Cake,
      label: 'Menu',
      description: 'Meal selection for guests',
      category: 'core'
    },
    {
      name: 'Music',
      model: 'music',
      icon: Music,
      label: 'Suggested Music',
      description: 'Guests can suggest songs',
      category: 'social'
    },
    {
      name: 'eventComments',
      model: 'eventComments',
      icon: MessageSquareText,
      label: 'Guest Comments',
      description: 'Wall for guest messages',
      category: 'social'
    },
    {
      name: 'backgroundMusic',
      model: 'backgroundMusic',
      icon: Waves,
      label: 'Background Music',
      description: 'Play music during event',
      category: 'ambient'
    },
    {
      name: 'Budget',
      model: 'budget',
      icon: Wallet,
      label: 'Budget Tracker',
      description: 'Manage event expenses',
      category: 'admin'
    }
  ]

  const onboardingTypes = [
    { id: 'wedding', label: 'Wedding', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50' },
    { id: 'birthday', label: 'Birthday', icon: Cake, color: 'text-orange-500', bg: 'bg-orange-50' },
    {
      id: 'quinceanera',
      label: 'Quinceañera',
      icon: Sparkles,
      color: 'text-purple-500',
      bg: 'bg-purple-50'
    },
    {
      id: 'baby-shower',
      label: 'Baby Shower',
      icon: Baby,
      color: 'text-blue-500',
      bg: 'bg-blue-50'
    },
    { id: 'other', label: 'Other', icon: PartyPopper, color: 'text-gray-500', bg: 'bg-gray-50' }
  ]

  const selectEventType = typeId => {
    const type = eventTypes.value.find(t => t.label.toLowerCase().includes(typeId.toLowerCase()))
    if (type) {
      eventState.eventType = type.value
    }

    const defaults = smartDefaults[typeId] || smartDefaults.other
    defaults.forEach(feature => {
      eventState[feature] = true
    })

    showEmptyState.value = false
  }

  const eventValidationSchema = computed(() => {
    return toTypedSchema(
      zod
        .object({
          eventName: zod.string().min(1, 'Event name is required.'),
          eventType: zod.number({
            required_error: 'Event type is required.',
            invalid_type_error: 'Invalid event type.'
          }),
          startDate: zod.string().min(1, 'Start date is required.'),
          endDate: zod.string().min(1, 'End date is required.')
        })
        .refine(
          data => {
            if (!data.startDate || !data.endDate) return true
            const [start, end] = [new Date(data.startDate), new Date(data.endDate)]
            return end > start
          },
          { message: 'End Date must be after Start Date', path: ['endDate'] }
        )
    )
  })

  const eventTypes = computed(() => {
    return eventStore.eventTypes.map(type => ({
      label: type.name,
      value: type.id
    }))
  })

  const getCurrentStepSubtitle = () => {
    const subtitles = [
      'Basic information about your celebration',
      'Choose the features you want to include',
      'Set your event visibility and status',
      'Review and launch your event'
    ]
    return subtitles[currentStep.value] || ''
  }

  const validateCurrentStep = () => {
    // Basic validation for wizard logic - usually handled by CWizard and Form
    return true
  }

  const cancelCreateEvent = () => {
    Object.keys(eventState).forEach(key => {
      if (typeof eventState[key] === 'boolean') {
        eventState[key] = false
      } else if (typeof eventState[key] === 'string') {
        eventState[key] = ''
      } else if (typeof eventState[key] === 'number') {
        eventState[key] = 0
      }
    })
    currentStep.value = 0
    router.push('/dashboard/events')
  }

  const createOrEditEvent = () => {
    const payload = {
      ...eventState,
      status: eventState.isPublished ? 'published' : 'draft',
      visibility: eventState.isPublic ? 'public' : 'private'
    }
    return mode.value === 'edit' ? eventStore.editEvent(payload) : eventStore.createEvent(payload)
  }

  const onSubmit = async () => {
    try {
      eventState.processing = true
      const result = await createOrEditEvent()
      if (result.status >= 200 && result.status < 300) {
        notificationStore.addNotification({
          type: 'success',
          message: `Event ${mode.value === 'edit' ? 'updated' : 'created'} successfully!`
        })
        router.push('/dashboard/events')
      } else {
        notificationStore.addNotification({
          type: 'error',
          message: result.data?.message || 'Something went wrong'
        })
      }
    } catch (error) {
      console.error('Error submitting event:', error)
      notificationStore.addNotification({
        type: 'error',
        message: 'An error occurred while saving the event'
      })
    } finally {
      eventState.processing = false
    }
  }

  onMounted(async () => {
    if (eventStore.eventTypes.length === 0) {
      await eventStore.loadEventsPlansAndType()
    }

    if (mode.value === 'create' && !eventStore.hasEvents) {
      showEmptyState.value = true
    }

    if (route.query.type) {
      selectEventType(route.query.type)
    }

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

        eventStore.activeEvent.eventFeatures.forEach(feature => {
          features[feature.name] = feature.isActive
        })

        Object.assign(eventState, {
          ...current,
          ...features,
          isPublished: current.status === 'published',
          isPublic: current.visibility === 'public'
        })
      }
    }
  })

  return {
    mode,
    showEmptyState,
    currentStep,
    eventState,
    featuresList,
    onboardingTypes,
    eventTypes,
    eventValidationSchema,
    selectEventType,
    getCurrentStepSubtitle,
    validateCurrentStep,
    cancelCreateEvent,
    onSubmit
  }
}
