<script setup>
import { computed } from 'vue'
import { CalendarPlus } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import { CWM_API } from '@/services/axios'
import { useInvitationContext } from '../composables/useInvitation'
import InvitationSection from './InvitationSection.vue'
import InvitationButton from './InvitationButton.vue'

const props = defineProps({
  section: { type: Object, required: true }
})

const { tt } = useInvitationContext()
const route = useRoute()

const message = computed(() => props.section.data.message)
const calendar = computed(() => props.section.data.calendar)
// The .ics file is served by the API under the same invitation address.
const icsUrl = computed(() => {
  const base = String(CWM_API.defaults.baseURL ?? '').replace(/\/$/, '')
  return `${base}/invitation/${encodeURIComponent(route.params.slug)}/${encodeURIComponent(route.params.code)}/${calendar.value?.icsPath ?? 'calendar.ics'}`
})
</script>

<template>
  <InvitationSection id="save-the-date" :title="section.title" :text="section.text">
    <p v-if="message" class="mx-auto max-w-prose whitespace-pre-line text-xl text-inv-ink-soft text-pretty">{{ message }}</p>
    <div v-if="calendar" class="mt-8 flex flex-col items-center gap-3">
      <p class="flex items-center gap-2 text-sm font-medium text-inv-ink-soft">
        <CalendarPlus class="h-4 w-4" aria-hidden="true" />
        {{ tt('saveTheDate.addToCalendar') }}
      </p>
      <div class="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <InvitationButton variant="outline" :href="calendar.google" target="_blank" rel="noopener">{{ tt('saveTheDate.google') }}</InvitationButton>
        <InvitationButton variant="outline" :href="icsUrl">{{ tt('saveTheDate.ics') }}</InvitationButton>
      </div>
    </div>
  </InvitationSection>
</template>
