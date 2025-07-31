<script setup>
import CCard from '@/components/UI/cards/CCard.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { Calendar, Clock, MapPin, ExternalLink, Edit, UserCircle } from 'lucide-vue-next'

const router = useRouter()
const props = defineProps({
  activeEvent: {
    type: Object,
    required: true
  },
  userRole: {
    type: String,
    default: 'viewer'
  }
})

const goToEvent = async () => {
  await router.push({ name: 'event-details', params: { id: props.activeEvent.id } })
}

const editEvent = async () => {
  await router.push({ name: 'edit-event', params: { id: props.activeEvent.id } })
}

const formatDate = date => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const daysUntilEvent = computed(() => {
  const today = new Date()
  const eventDate = new Date(props.activeEvent.startDate)
  const diffTime = eventDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
})

const eventStatus = computed(() => {
  const days = daysUntilEvent.value
  if (days < 0) return { text: 'Past Event', color: 'text-gray-500' }
  if (days === 0) return { text: 'Today!', color: 'text-green-500' }
  if (days <= 7) return { text: `${days} days away`, color: 'text-amber-500' }
  if (days <= 30) return { text: `${days} days away`, color: 'text-blue-500' }
  return { text: `${days} days away`, color: 'text-purple-500' }
})
</script>

<template>
  <CCard variant="feature" class="border-l-4 border-l-rose overflow-visible relative">
    <!-- Status Badge -->
    <div
      class="absolute -top-3 right-4 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-md border border-gray-200 dark:border-gray-700"
    >
      <span :class="['text-xs font-medium', eventStatus.color]">{{ eventStatus.text }}</span>
    </div>

    <!-- Role Badge -->

    <template #title>
      <div class="title-container flex items-center justify-start gap-x-2">
        <h3 class="text-xl font-semibold text-rose-darken">{{ activeEvent.eventName }}</h3>
        <div
          class="bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-md border border-gray-200 dark:border-gray-700 flex items-center"
        >
          <UserCircle
            class="w-3 h-3 mr-1"
            :class="{
              'text-purple-500': userRole === 'owner',
              'text-blue-500': userRole === 'editor',
              'text-gray-500': userRole === 'viewer'
            }"
          />
          <span
            class="text-xs font-medium capitalize"
            :class="{
              'text-purple-500': userRole === 'owner',
              'text-blue-500': userRole === 'editor',
              'text-gray-500': userRole === 'viewer'
            }"
            >{{ userRole }}</span
          >
        </div>
      </div>
    </template>

    <template #content>
      <p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
        {{ activeEvent.eventDescription }}
      </p>

      <div class="space-y-2">
        <div class="flex items-center text-sm text-gray-600 dark:text-gray-300">
          <Calendar class="w-4 h-4 mr-2 text-rose" />
          <span
            >{{ formatDate(activeEvent.startDate) }} – {{ formatDate(activeEvent.endDate) }}</span
          >
        </div>

        <div
          v-if="activeEvent.eventTime"
          class="flex items-center text-sm text-gray-600 dark:text-gray-300"
        >
          <Clock class="w-4 h-4 mr-2 text-rose" />
          <span>{{ activeEvent.eventTime }}</span>
        </div>

        <div
          v-if="activeEvent.location"
          class="flex items-center text-sm text-gray-600 dark:text-gray-300"
        >
          <MapPin class="w-4 h-4 mr-2 text-rose" />
          <span>{{ activeEvent.location }}</span>
        </div>
      </div>
    </template>

    <template #cta>
      <div class="flex flex-col sm:flex-row gap-2">
        <CButton
          class="bg-gradient-to-r from-rose to-rose-dark hover:from-rose-dark hover:to-rose-darken text-white"
          @click="goToEvent"
        >
          <ExternalLink class="w-4 h-4 mr-2" />
          Go to Event
        </CButton>

        <CButton
          variant="outline"
          class="border-rose text-rose hover:bg-rose-light"
          @click="editEvent"
        >
          <Edit class="w-4 h-4 mr-2" />
          Edit
        </CButton>
      </div>
    </template>
  </CCard>
</template>

<style scoped>
.card-menu {
  position: absolute;
  top: -9.5rem;
  right: -10px;
  z-index: 10;
}
</style>
