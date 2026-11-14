<script setup>
import { computed, reactive, ref } from 'vue'
import { CalendarClock, Check, Minus } from 'lucide-vue-next'
import InvitationService from '@/services/PublicEvents/InvitationService'
import { useInvitationContext } from '../composables/useInvitation'
import InvitationSection from './InvitationSection.vue'
import InvitationPanel from './InvitationPanel.vue'
import InvitationButton from './InvitationButton.vue'
import InvitationPetals from '../art/InvitationPetals.vue'

const props = defineProps({
  section: { type: Object, required: true }
})

const { tt, formatDate, slug, code, updateSection, preview } = useInvitationContext()

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
const celebrate = ref(false)

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
  if (preview || !canSubmit.value || saving.value) return
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
    // Petals only for a yes: a decline gets a warm word, not confetti.
    celebrate.value = data.data.guest.status === ATTENDING
  } catch (error) {
    failed.value = true
    message.value = tt(error?.response?.status === 422 ? 'rsvp.closedError' : 'rsvp.error')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <InvitationSection id="rsvp" :title="section.title" :text="section.text" variant="alt">
    <p
      v-if="deadline && rsvp.isOpen"
      class="mx-auto mb-6 inline-flex items-center gap-2 rounded-full bg-inv-primary/10 px-4 py-1.5 text-sm font-medium text-inv-primary-ink"
    >
      <CalendarClock class="h-4 w-4 text-inv-primary" aria-hidden="true" />
      {{ tt('rsvp.deadline', { date: deadline }) }}
    </p>
    <p v-if="!rsvp.isOpen" class="mb-6 rounded-2xl bg-inv-surface px-4 py-3 text-inv-ink-soft text-pretty ring-1 ring-inv-ink/10">
      {{ tt('rsvp.closed') }}
    </p>

    <div class="relative">
      <InvitationPetals v-if="celebrate" @done="celebrate = false" />

      <InvitationPanel>
        <!-- Summary of what was answered -->
        <div v-if="showSummary">
          <ul class="divide-y divide-inv-ink/10">
            <li
              v-for="person in [rsvp.guest, ...rsvp.companions]"
              :key="person.id"
              class="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
            >
              <span class="min-w-0 truncate font-inv-heading text-lg">{{ person.name }}</span>
              <span class="shrink-0 text-inv-ink-soft">{{ statusLabel(person.status) }}</span>
            </li>
          </ul>
          <InvitationButton v-if="rsvp.isOpen" variant="outline" class="mt-7 w-full" :disabled="preview" @click="editing = true">
            {{ tt('rsvp.change') }}
          </InvitationButton>
        </div>

        <!-- Form -->
        <form v-else class="flex flex-col gap-6" novalidate @submit.prevent="submit">
          <fieldset
            v-for="person in [rsvp.guest, ...rsvp.companions]"
            :key="person.id"
            class="border-b border-inv-ink/10 pb-6 last:border-b-0 last:pb-0"
            :disabled="person.id !== mainId && mainDeclined"
          >
            <legend class="font-inv-heading text-xl">{{ person.name }}</legend>
            <div class="mt-3 grid grid-cols-2 gap-3">
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
                  class="flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-inv-ink/20 bg-inv-surface px-3 text-center font-medium transition-[background-color,color,border-color,scale] duration-150 ease-out active:scale-[0.98] peer-checked:border-inv-primary peer-checked:bg-inv-primary peer-checked:text-inv-on-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-inv-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-60"
                >
                  <component :is="option === ATTENDING ? Check : Minus" class="h-4 w-4 shrink-0" aria-hidden="true" />
                  {{ tt(option === ATTENDING ? 'rsvp.attending' : 'rsvp.notAttending') }}
                </span>
              </label>
            </div>
          </fieldset>

          <p v-if="preview" role="note" class="text-center text-sm text-inv-ink-soft">{{ tt('previewNotice') }}</p>
          <InvitationButton type="submit" :loading="saving" :disabled="preview || !canSubmit" class="w-full">
            {{ tt(hasAnswered ? 'rsvp.update' : 'rsvp.submit') }}
          </InvitationButton>
        </form>
      </InvitationPanel>
    </div>

    <p
      role="status"
      aria-live="polite"
      :class="[
        'mt-6 min-h-8 text-pretty',
        failed ? 'text-danger-700' : 'font-inv-script text-4xl text-inv-primary-ink sm:text-5xl'
      ]"
    >
      {{ message }}
    </p>
  </InvitationSection>
</template>
