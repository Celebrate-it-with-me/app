<script setup>
import { computed, reactive, ref, useId } from 'vue'
import { CalendarClock, Check, Minus, Utensils } from 'lucide-vue-next'
import InvitationService from '@/services/PublicEvents/InvitationService'
import { useInvitationContext } from '../composables/useInvitation'
import InvitationSection from './InvitationSection.vue'
import InvitationPanel from './InvitationPanel.vue'
import InvitationButton from './InvitationButton.vue'
import InvitationPetals from '../art/InvitationPetals.vue'

const props = defineProps({
  section: { type: Object, required: true },
  /** card (default) | paper (flat panel) | inline (no panel) */
  variant: { type: String, default: 'card' }
})

const { tt, formatDate, slug, code, updateSection, preview, invitation } = useInvitationContext()

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

const NOTE_MAX = 500
const NAME_MIN = 2
const NAME_MAX = 120
const noteId = useId()

/**
 * The private note is the guest's only channel to the hosts until the wall of comments is on screen: the payload only
 * carries `comments` when the module is active AND the organizer left the section on, so its presence means the guest
 * can write there and the note is hidden. Hidden means not sent: an absent `note` key leaves the saved one untouched.
 */
const showNote = computed(() => !invitation?.value?.sections?.some(item => item.type === 'comments'))

/** Drafts the guest edits: their message and the name of each assigned companion. */
const note = ref(rsvp.value.note ?? '')
const names = reactive(Object.fromEntries(rsvp.value.companions.map(item => [item.id, item.name])))
/** Error codes by field: `note` and `name-<companion id>`. */
const fieldErrors = reactive({})
const canEditNames = computed(() => rsvp.value.canEditNames !== false && rsvp.value.isOpen)
const nameInputId = id => `${noteId}-name-${id}`

const editing = ref(false)
const saving = ref(false)
const message = ref('')
const failed = ref(false)
const celebrate = ref(false)

const mainId = computed(() => rsvp.value.guest.id)
const mainDeclined = computed(() => answers[mainId.value] === NOT_ATTENDING)
// An unsaved sample guest (the editor preview) has no status at all: that is "pending", not an answer.
const isPending = status => !status || status === 'pending'
const hasAnswered = computed(() => !isPending(rsvp.value.guest.status))
const showSummary = computed(() => !rsvp.value.isOpen || (hasAnswered.value && !editing.value))

/** Nobody attends under an invitation the main guest declined: mirror the server rule. */
const valueFor = id => (id !== mainId.value && mainDeclined.value ? NOT_ATTENDING : answers[id])

/**
 * Optional menu step. `menu` only arrives when the event has one with items; one dish per `type` per person,
 * never required, and only for people who attend.
 */
const menu = computed(() => (rsvp.value.menu?.items?.length ? rsvp.value.menu : null))
const menuEditable = computed(() => Boolean(menu.value) && menu.value.editable !== false && rsvp.value.isOpen)
const MENU_TYPES = ['starter', 'main', 'dessert']
const everyone = computed(() => [rsvp.value.guest, ...rsvp.value.companions])
const menuGroups = computed(() =>
  MENU_TYPES.map(type => ({ type, items: menu.value.items.filter(item => item.type === type) })).filter(group => group.items.length)
)
/** Chosen dish id per person and type: `{ [personId]: { [type]: itemId } }`. */
const choices = reactive({})
function loadChoices(data) {
  for (const key of Object.keys(choices)) delete choices[key]
  for (const person of [data.guest, ...data.companions]) {
    choices[person.id] = {}
    for (const id of person.menuItemIds ?? []) {
      const type = data.menu?.items?.find(item => item.id === id)?.type
      if (type) choices[person.id][type] = id
    }
  }
}
loadChoices(rsvp.value)
const attends = id => valueFor(id) === ATTENDING
const attendees = computed(() => everyone.value.filter(person => attends(person.id)))
const showMenu = computed(() => menuEditable.value && attendees.value.length > 0)
const isChosen = (personId, item) => choices[personId]?.[item.type] === item.id
const pickDish = (personId, item) => {
  const current = (choices[personId] ??= {})
  if (current[item.type] === item.id) delete current[item.type]
  else current[item.type] = item.id
}
const dishIds = id => (attends(id) ? Object.values(choices[id]) : [])
const dishNames = id => {
  const person = everyone.value.find(item => item.id === id)
  return (rsvp.value.menu?.items ?? []).filter(item => person?.menuItemIds?.includes(item.id)).map(item => item.name)
}
const dietLabel = diet => {
  if (!diet || diet === 'none' || diet === 'regular') return ''
  const label = tt(`rsvp.menu.diets.${diet}`)
  return label.endsWith(diet) ? diet : label
}
/** Changing an answer to "not attending" drops that person's dishes (everyone's when the main guest declines). */
function setAnswer(id, option) {
  answers[id] = option
  if (option !== NOT_ATTENDING) return
  for (const person of everyone.value) if (person.id === id || id === mainId.value) choices[person.id] = {}
}

const canSubmit = computed(
  () =>
    answers[mainId.value] !== null &&
    (mainDeclined.value || rsvp.value.companions.every(item => answers[item.id] !== null))
)

const deadline = computed(() => (rsvp.value.deadline ? formatDate(rsvp.value.deadline) : ''))
const statusLabel = status => tt(`rsvp.status.${isPending(status) ? 'pending' : status}`)
const errorText = code => tt(`rsvp.errors.${code}`)

/** Same codes the API answers with, so a client-side stop reads like a server one. */
function nameProblem(value) {
  const length = [...value.trim()].length
  if (length === 0) return 'required'
  if (length < NAME_MIN) return 'too_short'
  if (length > NAME_MAX) return 'too_long'
  return null
}

function validate() {
  for (const key of Object.keys(fieldErrors)) delete fieldErrors[key]
  if (canEditNames.value) {
    for (const item of rsvp.value.companions) {
      const problem = nameProblem(names[item.id] ?? '')
      if (problem) fieldErrors[`name-${item.id}`] = problem
    }
  }
  if (showNote.value && [...note.value.trim()].length > NOTE_MAX) fieldErrors.note = 'too_long'
  return Object.keys(fieldErrors).length === 0
}

/** Maps a 422 `errors` object to field codes; returns the message for what is not a field. */
function applyServerErrors(errors = {}) {
  const first = key => (Array.isArray(errors[key]) ? errors[key][0] : undefined)
  if (first('rsvp') === 'closed') return tt('rsvp.closedError')
  rsvp.value.companions.forEach((item, index) => {
    const code = first(`companions.${index}.name`)
    if (code) fieldErrors[`name-${item.id}`] = code
  })
  if (first('note')) fieldErrors.note = first('note')
  if (Object.keys(fieldErrors).length) return tt('rsvp.error')
  if (Object.keys(errors).some(key => key.endsWith('menuItemIds'))) {
    fieldErrors.menu = 'invalid'
    return tt('rsvp.menu.errors.invalid')
  }
  if (first('companions') === 'invalid') return errorText('invalid')
  return null
}

function syncDrafts(data) {
  note.value = data.note ?? ''
  for (const item of data.companions) names[item.id] = item.name
  loadChoices(data)
}

async function submit() {
  if (preview || !canSubmit.value || saving.value) return
  failed.value = false
  message.value = ''
  if (!validate()) {
    failed.value = true
    message.value = tt('rsvp.error')
    return
  }
  saving.value = true
  // Only what changed travels: a name or message the guest did not touch is left alone.
  const payload = {
    slug: slug(),
    code: code(),
    guest: answers[mainId.value],
    companions: Object.fromEntries(rsvp.value.companions.map(item => [item.id, valueFor(item.id)]))
  }
  if (canEditNames.value) {
    const changed = rsvp.value.companions.filter(item => names[item.id].trim() !== item.name)
    if (changed.length) payload.names = Object.fromEntries(changed.map(item => [item.id, names[item.id].trim()]))
  }
  if (showNote.value && note.value.trim() !== (rsvp.value.note ?? '')) payload.note = note.value.trim()
  // Dishes travel only when the event has a menu; an empty list clears a person who no longer attends.
  if (menuEditable.value) {
    payload.menu = {
      guest: dishIds(mainId.value),
      companions: Object.fromEntries(rsvp.value.companions.map(item => [item.id, dishIds(item.id)]))
    }
  }
  try {
    const { data } = await InvitationService.saveRsvp(payload)
    updateSection('rsvp', data.data)
    syncDrafts(data.data)
    for (const person of [data.data.guest, ...data.data.companions]) answers[person.id] = answer(person.status)
    editing.value = false
    message.value = tt(data.data.guest.status === ATTENDING ? 'rsvp.thanksYes' : 'rsvp.thanksNo')
    // Petals only for a yes: a decline gets a warm word, not confetti.
    celebrate.value = data.data.guest.status === ATTENDING
  } catch (error) {
    failed.value = true
    const status = error?.response?.status
    if (status === 422) {
      message.value = applyServerErrors(error.response.data?.errors) ?? tt('rsvp.closedError')
    } else if (status === 429) {
      message.value = errorText('too_many_attempts')
    } else {
      message.value = tt('rsvp.error')
    }
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

      <component :is="variant === 'inline' ? 'div' : InvitationPanel" class="inv-rsvp" :data-rsvp="variant" v-bind="variant === 'paper' ? { variant: 'flat' } : {}">
        <!-- Summary of what was answered -->
        <div v-if="showSummary">
          <ul class="divide-y divide-inv-ink/10">
            <li
              v-for="person in [rsvp.guest, ...rsvp.companions]"
              :key="person.id"
              class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3.5 first:pt-0 last:pb-0"
            >
              <span class="min-w-0 truncate font-inv-heading text-lg">{{ person.name }}</span>
              <span class="shrink-0 text-inv-ink-soft">{{ statusLabel(person.status) }}</span>
              <p v-if="dishNames(person.id).length" class="basis-full text-sm text-inv-ink-soft">
                <Utensils class="mr-1 inline h-4 w-4 align-text-bottom" aria-hidden="true" />{{ dishNames(person.id).join(' · ') }}
              </p>
            </li>
          </ul>
          <div v-if="showNote && rsvp.note" class="mt-6 border-t border-inv-ink/10 pt-5">
            <p class="text-sm font-medium text-inv-ink-soft">{{ tt('rsvp.yourNote') }}</p>
            <p class="mt-1 whitespace-pre-line break-words text-inv-ink">{{ rsvp.note }}</p>
          </div>
          <InvitationButton v-if="rsvp.isOpen" variant="outline" class="mt-7 w-full" :disabled="preview" @click="editing = true">
            {{ tt('rsvp.change') }}
          </InvitationButton>
        </div>

        <!-- Form -->
        <form v-else class="flex flex-col gap-6" novalidate @submit.prevent="submit">
          <div
            v-for="person in [rsvp.guest, ...rsvp.companions]"
            :key="person.id"
            class="border-b border-inv-ink/10 pb-6 last:border-b-0 last:pb-0"
          >
            <div v-if="person.id !== mainId && canEditNames" class="mb-4">
              <label :for="nameInputId(person.id)" class="block text-sm font-medium text-inv-ink-soft">
                {{ tt('rsvp.nameLabel') }}
              </label>
              <input
                :id="nameInputId(person.id)"
                v-model="names[person.id]"
                type="text"
                name="name"
                autocomplete="off"
                :maxlength="NAME_MAX + 20"
                :aria-invalid="fieldErrors[`name-${person.id}`] ? 'true' : undefined"
                :aria-describedby="fieldErrors[`name-${person.id}`] ? `${nameInputId(person.id)}-error` : undefined"
                class="mt-1 block min-h-12 w-full rounded-2xl border border-inv-ink/20 bg-inv-surface px-4 text-base text-inv-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inv-primary"
              />
              <p v-if="fieldErrors[`name-${person.id}`]" :id="`${nameInputId(person.id)}-error`" class="mt-1 text-sm text-danger-700">
                {{ errorText(fieldErrors[`name-${person.id}`]) }}
              </p>
            </div>
            <fieldset :disabled="person.id !== mainId && mainDeclined">
              <legend class="font-inv-heading text-xl">{{ person.id === mainId ? person.name : names[person.id] || person.name }}</legend>
              <div class="mt-3 grid grid-cols-2 gap-3">
                <label v-for="option in OPTIONS" :key="option" class="block">
                  <input
                    type="radio"
                    class="peer sr-only"
                    :name="`rsvp-${person.id}`"
                    :value="option"
                    :checked="valueFor(person.id) === option"
                    @change="setAnswer(person.id, option)"
                  />
                  <span
                    class="inv-rsvp__option flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-inv-ink/20 bg-inv-surface px-3 text-center leading-tight font-medium text-balance transition-[background-color,color,border-color,scale] duration-150 ease-out active:scale-[0.98] peer-checked:border-inv-primary peer-checked:bg-inv-primary peer-checked:text-inv-on-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-inv-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-60"
                  >
                    <component :is="option === ATTENDING ? Check : Minus" class="h-4 w-4 shrink-0" aria-hidden="true" />
                    {{ tt(option === ATTENDING ? 'rsvp.attending' : 'rsvp.notAttending') }}
                  </span>
                </label>
              </div>
            </fieldset>
          </div>

          <!-- Optional menu: one dish per type for each person who attends -->
          <div v-if="showMenu" class="flex flex-col gap-6 border-b border-inv-ink/10 pb-6" data-rsvp-menu>
            <div>
              <h3 class="font-inv-heading text-xl">{{ menu.title || tt('rsvp.menu.title') }}</h3>
              <p class="mt-1 text-sm text-inv-ink-soft text-pretty">{{ menu.description || tt('rsvp.menu.help') }}</p>
              <p v-if="fieldErrors.menu" role="alert" class="mt-2 text-sm text-danger-700">{{ tt('rsvp.menu.errors.invalid') }}</p>
            </div>
            <fieldset v-for="person in attendees" :key="person.id" class="min-w-0" :data-menu-person="person.id">
              <legend class="font-inv-heading text-lg">{{ person.id === mainId ? person.name : names[person.id] || person.name }}</legend>
              <div v-for="group in menuGroups" :key="group.type" class="mt-3" role="group" :aria-label="tt(`rsvp.menu.types.${group.type}`)">
                <p class="text-sm font-medium text-inv-ink-soft">{{ tt(`rsvp.menu.types.${group.type}`) }}</p>
                <div class="mt-2 grid gap-2">
                  <button
                    v-for="item in group.items"
                    :key="item.id"
                    type="button"
                    :aria-pressed="isChosen(person.id, item) ? 'true' : 'false'"
                    :data-dish="item.id"
                    class="inv-rsvp__option flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-2xl border border-inv-ink/20 bg-inv-surface px-3 py-2 text-left font-medium text-inv-ink transition-[background-color,color,border-color,scale] duration-150 ease-out active:scale-[0.98] aria-pressed:border-inv-primary aria-pressed:bg-inv-primary aria-pressed:text-inv-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inv-primary"
                    @click="pickDish(person.id, item)"
                  >
                    <img v-if="item.imageUrl" :src="item.imageUrl" alt="" loading="lazy" class="h-10 w-10 shrink-0 rounded-xl object-cover" />
                    <span class="min-w-0 flex-1">
                      <span class="block break-words">{{ item.name }}</span>
                      <span v-if="dietLabel(item.dietType)" class="block text-xs font-normal opacity-80">{{ dietLabel(item.dietType) }}</span>
                      <span v-if="item.notes" class="block break-words text-xs font-normal opacity-80">{{ item.notes }}</span>
                    </span>
                    <Check v-if="isChosen(person.id, item)" class="h-4 w-4 shrink-0" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </fieldset>
          </div>

          <div v-if="showNote" data-rsvp-note>
            <label :for="`${noteId}-note`" class="block text-sm font-medium text-inv-ink-soft">{{ tt('rsvp.noteLabel') }}</label>
            <textarea
              :id="`${noteId}-note`"
              v-model="note"
              rows="3"
              name="note"
              :aria-invalid="fieldErrors.note ? 'true' : undefined"
              :aria-describedby="`${noteId}-note-hint`"
              class="mt-1 block min-h-24 w-full resize-y rounded-2xl border border-inv-ink/20 bg-inv-surface px-4 py-3 text-base text-inv-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inv-primary"
            />
            <div :id="`${noteId}-note-hint`" class="mt-1 flex items-start justify-between gap-3 text-sm">
              <p v-if="fieldErrors.note" class="text-danger-700">{{ errorText(fieldErrors.note) }}</p>
              <span v-else />
              <span :class="note.length > NOTE_MAX ? 'text-danger-700' : 'text-inv-ink-soft'">{{ tt('rsvp.noteCount', { n: note.length, max: NOTE_MAX }) }}</span>
            </div>
          </div>

          <p v-if="preview" role="note" class="text-center text-sm text-inv-ink-soft">{{ tt('previewNotice') }}</p>
          <InvitationButton type="submit" :loading="saving" :disabled="preview || !canSubmit" class="w-full">
            {{ tt(hasAnswered ? 'rsvp.update' : 'rsvp.submit') }}
          </InvitationButton>
        </form>
      </component>
    </div>

    <p
      role="status"
      aria-live="polite"
      :class="[
        'inv-rsvp__note mt-6 min-h-8 text-pretty',
        failed ? 'text-danger-700' : 'font-inv-script text-4xl text-inv-primary-ink sm:text-5xl'
      ]"
    >
      {{ message }}
    </p>
  </InvitationSection>
</template>
