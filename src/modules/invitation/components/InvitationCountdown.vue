<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useInvitationContext } from '../composables/useInvitation'
import { timeLeft } from '@/modules/save-the-date/utils/stage'
import InvitationSection from './InvitationSection.vue'

const props = defineProps({
  section: { type: Object, required: true }
})

const { tt } = useInvitationContext()

// The event time is wall-clock time of the event; the browser reads it as local, which is right for guests nearby.
const now = ref(new Date())
let timer
onMounted(() => {
  timer = setInterval(() => (now.value = new Date()), 1000)
})
onBeforeUnmount(() => clearInterval(timer))

const left = computed(() => timeLeft(props.section.data.startsAt, now.value))
const over = computed(() => Object.values(left.value).every(n => n === 0))
const units = ['days', 'hours', 'minutes', 'seconds']
const pad = n => String(n).padStart(2, '0')
</script>

<template>
  <InvitationSection id="countdown" :title="section.title" :text="section.text" variant="alt">
    <p v-if="over" class="font-inv-heading text-3xl text-inv-primary-ink">{{ tt('saveTheDate.passed') }}</p>
    <dl v-else class="mx-auto grid max-w-md grid-cols-4 gap-3">
      <div v-for="unit in units" :key="unit" class="rounded-2xl bg-inv-surface px-2 py-4 shadow-soft ring-1 ring-inv-accent/30">
        <dt class="order-2 mt-1 text-xs text-inv-ink-soft sm:text-sm">{{ tt(`saveTheDate.units.${unit}`) }}</dt>
        <dd class="font-inv-heading text-3xl tabular-nums text-inv-primary-ink sm:text-5xl">{{ unit === 'days' ? left[unit] : pad(left[unit]) }}</dd>
      </div>
    </dl>
  </InvitationSection>
</template>
