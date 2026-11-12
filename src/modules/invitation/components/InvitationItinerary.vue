<script setup>
import { computed } from 'vue'
import { useInvitationContext } from '../composables/useInvitation'
import { iconFor, parseMoment } from '@/modules/timeline/utils/program'
import InvitationSection from './InvitationSection.vue'

const props = defineProps({
  section: { type: Object, required: true }
})

const { locale } = useInvitationContext()

const items = computed(() => {
  const format = new Intl.DateTimeFormat(locale.value, { hour: 'numeric', minute: '2-digit' })
  return props.section.data.items.map(item => ({
    ...item,
    icon: iconFor(item.type),
    time: format.format(parseMoment(item.startTime)),
    until: item.endTime ? format.format(parseMoment(item.endTime)) : null
  }))
})
</script>

<template>
  <InvitationSection id="itinerary" :title="section.title" :text="section.text">
    <ol class="mx-auto max-w-md space-y-6 text-left">
      <li v-for="(item, index) in items" :key="index" class="flex gap-4">
        <span
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-inv-primary/10 text-inv-primary ring-1 ring-inv-accent/50"
        >
          <component :is="item.icon" class="h-5 w-5" aria-hidden="true" />
        </span>
        <div class="min-w-0">
          <p class="text-sm font-medium text-inv-ink-soft">{{ item.until ? `${item.time} – ${item.until}` : item.time }}</p>
          <h3 class="font-inv-heading text-xl text-inv-primary-ink">{{ item.title }}</h3>
          <p v-if="item.description" class="mt-1 text-inv-ink-soft text-pretty">{{ item.description }}</p>
        </div>
      </li>
    </ol>
  </InvitationSection>
</template>
