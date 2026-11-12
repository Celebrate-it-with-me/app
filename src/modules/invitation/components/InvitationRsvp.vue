<script setup>
import { computed, reactive, ref } from 'vue'
import InvitationService from '@/services/PublicEvents/InvitationService'
import { useInvitationContext } from '../composables/useInvitation'
import InvitationSection from './InvitationSection.vue'
import InvitationButton from './InvitationButton.vue'

const props = defineProps({
  section: { type: Object, required: true }
})

const { tt, formatDate, slug, code, updateSection } = useInvitationContext()

const ATTENDING = 'attending'
const NOT_ATTENDING = 'not-attending'
const OPTIONS = [ATTENDING, NOT_ATTENDING]

const rsvp = computed(() => props.section.data)
const answer = status => (OPTIONS.includes(status) ? status : null)

/** Current answer per person (guest and companions), null while unanswered. */
const answers = reactive({
  [rsvp.value.guest.id]: answer(rsvp.value.guest.status),
  ...Object.fromEntries(rsvp.value.companions.map(item => [item.id, answer(item.status)]))
})

const editing = ref(false)
const saving = ref(false)
const message = ref('')
const failed = ref(false)

const mainId = computed(() => rsvp.value.guest.id)
const mainDeclined = computed(() => answers[mainId.value] === NOT_ATTENDING)
const hasAnswered = computed(() => rsvp.value.guest.status !== 'pending')
const showSummary = computed(() => !rsvp.value.isOpen || (hasAnswered.value && !editing.value))

/** Nobody attends under an invitation the main guest declined: mirror the server rule. */
const valueFor = id => (id !== mainId.value && mainDeclined.value ? NOT_ATTENDING : answers[id])
const canSubmit = computed(
  () =>
    answers[mainId.value] !== null &&
    (mainDeclined.value || rsvp.value.companions.every(item => answers[item.id] !== null))
)

const deadline = computed(() => (rsvp.value.deadline ? formatDate(rsvp.value.deadline) : ''))
const statusLabel = status => tt(`rsvp.status.${status}`)

async function submit() {
  if (!canSubmit.value || saving.value) return
  saving.value = true
  failed.value = false
  message.value = ''
  try {
    const { data } = await InvitationService.saveRsvp({
      slug: slug(),
      code: code(),
      guest: answers[mainId.value],
      companions: Object.fromEntries(rsvp.value.companions.map(item => [item.id, valueFor(item.id)]))
    })
    updateSection('rsvp', data.data)
    for (const person of [data.data.guest, ...data.data.companions]) answers[person.id] = answer(person.status)
    editing.value = false
    message.value = tt(data.data.guest.status === ATTENDING ? 'rsvp.thanksYes' : 'rsvp.thanksNo')
  } catch (error) {
    failed.value = true
    message.value = tt(error?.response?.status === 422 ? 'rsvp.closedError' : 'rsvp.error')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <InvitationSection id="rsvp" :title="section.title" :text="section.text" alt>
    <p v-if="deadline && rsvp.isOpen" class="-mt-4 mb-6 text-sm font-medium text-inv-primary">
      {{ tt('rsvp.deadline', { date: deadline }) }}
    </p>
    <p v-if="!rsvp.isOpen" class="mb-6 rounded-2xl bg-inv-surface-alt px-4 py-3 text-inv-ink-soft text-pretty">
      {{ tt('rsvp.closed') }}
    </p>

    <!-- Summary of what was answered -->
    <div v-if="showSummary" class="rounded-3xl bg-inv-surface-alt p-6 text-left ring-1 ring-inv-ink/10">
      <ul class="divide-y divide-inv-ink/10">
        <li
          v-for="person in [rsvp.guest, ...rsvp.companions]"
          :key="person.id"
          class="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
        >
          <span class="min-w-0 truncate font-medium">{{ person.name }}</span>
          <span class="shrink-0 text-inv-ink-soft">{{ statusLabel(person.status) }}</span>
        </li>
      </ul>
      <InvitationButton v-if="rsvp.isOpen" variant="outline" class="mt-6 w-full" @click="editing = true">
        {{ tt('rsvp.change') }}
      </InvitationButton>
    </div>

    <!-- Form -->
    <form v-else class="flex flex-col gap-4 text-left" novalidate @submit.prevent="submit">
      <fieldset
        v-for="person in [rsvp.guest, ...rsvp.companions]"
        :key="person.id"
        class="rounded-3xl bg-inv-surface-alt p-4 ring-1 ring-inv-ink/10"
        :disabled="person.id !== mainId && mainDeclined"
      >
        <legend class="px-1 font-inv-heading text-lg">{{ person.name }}</legend>
        <div class="mt-2 grid grid-cols-2 gap-2">
          <label v-for="option in OPTIONS" :key="option" class="block">
            <input
              type="radio"
              class="peer sr-only"
              :name="`rsvp-${person.id}`"
              :value="option"
              :checked="valueFor(person.id) === option"
              @change="answers[person.id] = option"
            />
            <span
              class="flex min-h-12 cursor-pointer items-center justify-center rounded-2xl border border-inv-ink/20 bg-inv-surface px-3 text-center font-medium transition-[background-color,color,border-color] duration-150 peer-checked:border-inv-primary peer-checked:bg-inv-primary peer-checked:text-inv-on-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-inv-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-60"
            >
              {{ tt(option === ATTENDING ? 'rsvp.attending' : 'rsvp.notAttending') }}
            </span>
          </label>
        </div>
      </fieldset>

      <InvitationButton type="submit" :loading="saving" :disabled="!canSubmit" class="mt-2 w-full">
        {{ tt(hasAnswered ? 'rsvp.update' : 'rsvp.submit') }}
      </InvitationButton>
    </form>

    <p
      role="status"
      aria-live="polite"
      :class="['mt-4 min-h-6 text-pretty', failed ? 'text-danger-700' : 'font-medium text-inv-primary']"
    >
      {{ message }}
    </p>
  </InvitationSection>
</template>
