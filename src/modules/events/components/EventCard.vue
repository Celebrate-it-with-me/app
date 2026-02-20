<template>
  <div class="event-card group relative overflow-hidden" :class="statusBorderClass">
    <!-- Card Header -->
    <div class="flex justify-between items-start mb-6">
      <div class="space-y-1">
        <h3
          class="text-xl font-extrabold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors"
        >
          {{ event.eventName }}
        </h3>
        <p class="text-gray-500 dark:text-gray-400 text-sm line-clamp-1 italic">
          "{{ event.eventDescription || 'No description provided' }}"
        </p>
      </div>

      <!-- Status Badge with Dropdown -->
      <div ref="statusDropdownRef" class="relative">
        <button
          class="status-badge cursor-pointer hover:shadow-md transition-all flex items-center gap-1"
          :class="statusBadgeClass"
          @click="toggleStatusDropdown"
        >
          {{ eventStatus }}
          <ChevronDown class="w-3 h-3" />
        </button>

        <!-- Status Dropdown Menu -->
        <div
          v-show="showStatusDropdown"
          class="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50"
        >
          <div class="p-2">
            <button
              v-for="status in availableStatuses"
              :key="status.value"
              :disabled="status.value === event.status || status.disabled"
              class="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :class="{
                'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300':
                  status.value === event.status
              }"
              @click="updateEventStatus(status.value)"
            >
              <div class="w-2 h-2 rounded-full" :class="status.colorClass"></div>
              <span class="font-medium text-gray-700 dark:text-gray-200">{{ status.label }}</span>
              <span
                v-if="status.value === event.status"
                class="ml-auto text-xs text-gray-400 dark:text-gray-500"
                >Current</span
              >
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Date & Time Row -->
    <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
      <div class="flex items-center gap-1.5 font-medium">
        <Calendar class="w-4 h-4 text-purple-500 dark:text-purple-400" />
        {{ formatDate(event.startDate) }}
      </div>
    </div>

    <!-- Setup Progress (MOCK Logic) -->
    <div class="mb-6">
      <div class="flex justify-between items-end mb-2">
        <span class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest"
          >Setup Progress</span
        >
        <span class="text-sm font-black text-purple-600 dark:text-purple-400"
          >{{ Math.round(setupProgress * 100) }}%</span
        >
      </div>
      <div class="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-1000"
          :style="{ width: `${setupProgress * 100}%` }"
        ></div>
      </div>
    </div>

    <!-- Metrics Grid -->
    <div
      class="grid grid-cols-3 gap-2 py-4 border-t border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 -mx-6 px-6"
    >
      <div class="text-center border-r border-gray-100 dark:border-gray-800">
        <div class="text-lg font-black text-gray-900 dark:text-white">
          {{ event.guestsCount || 0 }}
        </div>
        <div class="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">Guests</div>
      </div>
      <div class="text-center border-r border-gray-100 dark:border-gray-800">
        <div class="text-lg font-black text-gray-900 dark:text-white">{{ rsvpRate }}%</div>
        <div class="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">
          RSVP Rate
        </div>
      </div>
      <div class="text-center">
        <div class="text-lg font-black text-rose-500 dark:text-rose-400">{{ daysUntilEvent }}</div>
        <div class="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">
          Days Left
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-3 mt-6">
      <button
        :disabled="isAlreadyActive || !canBeActive"
        class="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all"
        :class="{
          'bg-gray-900 text-white hover:bg-gray-800': !isAlreadyActive && canBeActive,
          'bg-gray-300 text-gray-500 cursor-not-allowed': isAlreadyActive || !canBeActive
        }"
        @click="switchActiveEvent(event)"
      >
        {{ isAlreadyActive ? 'Currently Active' : 'Switch to Active' }}
      </button>
      <button
        class="flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm"
        :disabled="!canEditEvent"
        @click="openDesignStudio(event.id)"
      >
        <Palette class="w-4 h-4" />
      </button>
      <button
        class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <MoreHorizontal class="w-5 h-5 text-gray-400 dark:text-gray-500" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Calendar, MoreHorizontal, Palette, ChevronDown } from 'lucide-vue-next'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { useNotification } from '@kyvg/vue3-notification'

// Refs
const showStatusDropdown = ref(false)
const statusDropdownRef = ref(null)

// Props & Emits
const emits = defineEmits(['switchToActive', 'statusChanged'])
const props = defineProps({
  event: { type: Object, required: true }
})

// Stores
const eventStore = useEventsStore()
const { notify } = useNotification()

// Computed properties
const setupProgress = computed(() => {
  return props.event?.setupProgress ?? 0
})

const eventStatus = computed(() => {
  if (!props.event?.status) return 'Unknown'
  const statusMap = {
    published: 'Live',
    draft: 'Draft',
    archived: 'Archived',
    canceled: 'Canceled'
  }
  return statusMap[props.event.status] || 'Unknown'
})

const statusBorderClass = computed(() => {
  if (!props.event?.status) return 'border-l-4 border-l-transparent'
  const borderMap = {
    published: 'border-l-4 border-l-green-500 shadow-green-50',
    draft: 'border-l-4 border-l-yellow-400',
    archived: 'border-l-4 border-l-gray-400',
    canceled: 'border-l-4 border-l-red-500'
  }
  return borderMap[props.event.status] || 'border-l-4 border-l-transparent'
})

const statusBadgeClass = computed(() => {
  if (!props.event?.status) return 'bg-gray-100 dark:bg-gray-800'
  const badgeMap = {
    published:
      'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800',
    draft:
      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800',
    archived:
      'bg-gray-100 dark:bg-gray-700/30 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700',
    canceled:
      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
  }
  return badgeMap[props.event.status] || 'bg-gray-100 dark:bg-gray-800'
})

const canBeActive = computed(() => {
  if (!props.event?.status) return false
  return ['draft', 'published'].includes(props.event.status)
})

const canEditEvent = computed(() => {
  if (!props.event?.status) return false
  return !['archived', 'canceled'].includes(props.event.status)
})

const availableStatuses = computed(() => {
  const currentStatus = props.event?.status
  if (!currentStatus) return []

  const allStatuses = [
    {
      value: 'draft',
      label: 'Draft',
      colorClass: 'bg-yellow-400',
      description: 'Work in progress'
    },
    {
      value: 'published',
      label: 'Published',
      colorClass: 'bg-green-500',
      description: 'Live and public'
    },
    {
      value: 'archived',
      label: 'Archived',
      colorClass: 'bg-gray-400',
      description: 'Completed event'
    },
    {
      value: 'canceled',
      label: 'Canceled',
      colorClass: 'bg-red-500',
      description: 'Event canceled'
    }
  ]

  const allowedTransitions = {
    draft: ['published', 'canceled'],
    published: ['draft', 'archived', 'canceled'],
    archived: [],
    canceled: ['draft']
  }

  return allStatuses.map(status => ({
    ...status,
    disabled:
      !allowedTransitions[currentStatus]?.includes(status.value) && status.value !== currentStatus
  }))
})

const rsvpRate = computed(() => {
  if (!props.event?.guestsCount) return 0
  return Math.round((props.event.rsvpResponse / props.event.guestsCount) * 100)
})

const daysUntilEvent = computed(() => {
  if (!props.event?.startDate) return 0
  const eventDate = new Date(props.event.startDate)
  const today = new Date()
  const timeDiff = eventDate.getTime() - today.getTime()
  return Math.ceil(timeDiff / (1000 * 3600 * 24))
})

const isAlreadyActive = computed(() => {
  if (!props.event?.id || !eventStore.activeEvent?.id) return false
  return props.event.id === eventStore.activeEvent.id
})

// Methods
const toggleStatusDropdown = () => {
  showStatusDropdown.value = !showStatusDropdown.value
}

const updateEventStatus = async newStatus => {
  if (newStatus === props.event.status) {
    showStatusDropdown.value = false
    return
  }

  try {
    showStatusDropdown.value = false

    console.log(`Updating event ${props.event.id} from ${props.event.status} to ${newStatus}`)

    emits('statusChanged', { eventId: props.event.id, newStatus, oldStatus: props.event.status })

    notify({
      title: 'Status Updated',
      text: `Event status changed to ${newStatus}`,
      type: 'success'
    })
  } catch (error) {
    console.error('Error updating event status:', error)
    notify({
      title: 'Error',
      text: 'Failed to update event status',
      type: 'error'
    })
  }
}

const formatDate = dateStr => {
  if (!dateStr) return 'TBD'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const switchActiveEvent = event => {
  emits('switchToActive', event)
}

const openDesignStudio = id => {
  console.log('Design Studio - Coming soon!', id)
}

// Click outside handler
const handleClickOutside = event => {
  if (statusDropdownRef.value && !statusDropdownRef.value.contains(event.target)) {
    showStatusDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.event-card {
  @apply bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300;
}
.status-badge {
  @apply px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider;
}
</style>
