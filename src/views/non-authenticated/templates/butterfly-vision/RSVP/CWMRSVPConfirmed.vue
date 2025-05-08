<script setup>
import { Mail, Phone, User, CheckCircle, UserCheck } from 'lucide-vue-next'
import { useTemplateStore } from '@/stores/useTemplateStore'
import { computed } from 'vue'

const templateStore = useTemplateStore()

const guestCompanions = computed(() => {
  return templateStore.guest?.companions ?? []
})

const formatStatus = (status) => {
  if (status === 'attending') {
    return 'Attending'
  } else if (status === 'not-attending') {
    return 'Not Attending'
  } else if (status === 'pending') {
    return 'Pending'
  }
  return ''
}
</script>

<template>
  <div class="mt-6 w-full md:w-3/4 ld:w-1/2 flex items-center justify-center px-2">
    <div class="container flex justify-center py-2">
      <div class="w-full max-w-xl bg-white shadow-xl rounded px-6 py-8 text-dark-blue">
        <!-- Header -->
        <div class="mb-6 text-center">
          <h2
            class="text-2xl font-bold text-purple-600 mb-2 flex items-center justify-center gap-2"
          >
            <CheckCircle class="w-6 h-6 text-purple-600" />
            Thank you, {{ templateStore.guestFullName }}!
          </h2>
          <p class="text-gray-700">
            We’re excited to welcome you to
            <span class="font-semibold">{{ templateStore.eventName }}</span
            >.
          </p>
        </div>

        <!-- Guest Info -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-2 border-b pb-1">Your Information</h3>
          <div class="space-y-2 text-sm">
            <p class="flex items-center gap-2">
              <Mail class="w-4 h-4 text-gray-500" />
              {{ templateStore.guest?.email ?? 'N/A' }}
            </p>
            <p class="flex items-center gap-2">
              <Phone class="w-4 h-4 text-gray-500" />
              {{ templateStore.guest?.phone ?? 'N/A' }}
            </p>
            <p class="flex items-center gap-2">
              <UserCheck class="w-4 h-4 text-gray-500" />
              <span
                class="px-2 py-1 rounded-full text-xs font-semibold"
                :class="[
                  templateStore.guest?.rsvpStatus === 'attending'
                    ? 'text-green-700 bg-green-100'
                    : templateStore.guest?.rsvpStatus === 'not-attending'
                      ? 'text-red-700 bg-red-100'
                      : templateStore.guest?.rsvpStatus === 'pending'
                        ? 'text-yellow-700 bg-yellow-100'
                        : ''
                ]"
              >
                {{ formatStatus(templateStore.guest?.rsvpStatus) }}
              </span>
            </p>
          </div>
        </div>

        <!-- Companions -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-2 border-b pb-1">Accompanying Guests</h3>
          <ul v-if="guestCompanions.length > 0" class="space-y-2 text-sm">
            <li
              v-for="(companion, index) in guestCompanions"
              :key="index"
              class="flex items-center gap-2"
            >
              <User class="w-4 h-4 text-gray-500" />
              {{ companion.name ?? 'Unnamed' }} -
              <span
                class="px-2 py-1 rounded-full text-xs font-semibold"
                :class="[
                  companion.rsvpStatus === 'attending'
                    ? 'text-green-700 bg-green-100'
                    : companion.rsvpStatus === 'not-attending'
                      ? 'text-red-700 bg-red-100'
                      : companion.rsvpStatus === 'pending'
                        ? 'text-yellow-700 bg-yellow-100'
                        : ''
                ]"
              >
                {{ formatStatus(companion.rsvpStatus) }}
              </span>
            </li>
          </ul>
          <p v-else class="text-sm text-gray-500">No accompanying guests.</p>
        </div>

        <!-- Next Steps -->
        <div>
          <p>
            <strong>Need Assistance?</strong>
            Reach out at
            <a
              :href="`mailto:${templateStore.eventOrganizerEmail}`"
              class="text-purple-600 underline"
            >
              {{ templateStore.eventOrganizerEmail }} </a
            >.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
