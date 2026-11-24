<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { TriangleAlert } from 'lucide-vue-next'
import WhatsAppIcon from '@/components/brand/WhatsAppIcon.vue'
import { UiModal, UiButton, UiCard, UiSkeleton, UiEmptyState } from '@/ui'
import SendWizardService from '../../services/SendWizardService'
import { useToast } from '@/ui'
import { MODE_DEFAULT, STEPS, allowedTemplates, loadErrorKey, mergeFamilies, membersOf, templateFor, withoutTemplate } from '../../utils/sendWizard'
import SendStepWho from './SendStepWho.vue'
import SendStepPreview from './SendStepPreview.vue'
import SendStepManual from './SendStepManual.vue'
import SendStepAuto from './SendStepAuto.vue'

/**
 * Send wizard (contract 3): step 1 "who", step 2 "preview" (real cover + message, template, language) and step 3
 * "confirm". Step 3 is the assisted wa.me list in manual mode and the send with live progress in automatic mode.
 */
const props = defineProps({
  open: { type: Boolean, default: false },
  eventId: { type: [Number, String], default: null },
  eventName: { type: String, default: '' },
  /** Already formatted date line of the event (cover card in step 2). */
  eventDateLabel: { type: String, default: '' },
  /** Reopen straight on the progress of the batch in flight (the "sending" banner). */
  resume: { type: Boolean, default: false },
  published: { type: Boolean, default: true },
  /** The plan does not include automatic sending (changes the banner). */
  locked: { type: Boolean, default: false },
  canEdit: { type: Boolean, default: true },
  /** Families to start with (the row menu): step 1 is skipped when they can be shared. */
  preselectedIds: { type: Array, default: () => [] },
  /** Bumped by the parent after it edits a guest, so the wizard reads the families again. */
  reloadToken: { type: Number, default: 0 },
  /** `manual` (wa.me) or `automatic` (Meta, F4). Opt-outs are shareable and big batches need no confirmation in manual mode. */
  mode: { type: String, default: MODE_DEFAULT }
})
const emit = defineEmits(['update:open', 'closed', 'unlock', 'publish', 'edit-guest', 'add-guest', 'sent'])
const { t } = useI18n()
const { toast } = useToast()

const loading = ref(false)
const errorKey = ref(null)
const audience = ref(null)
const families = ref([])
const category = ref('unsent')
const selectedIds = ref([])
const stepIndex = ref(0)
const body = ref(null)
// Step 3 works with the families chosen when it opened (marking one does not reshuffle the list).
const chosen = ref([])
const templateOverride = ref(null)
const customText = ref(null)
const excludedIds = ref([])
const unapproved = ref([]) // locales a preview answered "template not approved" for
const sending = ref(false) // an automatic batch has started
const inFlight = ref(false)
let loadId = 0

const step = computed(() => STEPS[stepIndex.value])
// The server has the last word: an automatic request falls back to manual when it says the send is not available.
const effectiveMode = computed(() => (props.mode === 'automatic' && audience.value?.mode?.automatic === false ? 'manual' : props.mode))
const automatic = computed(() => effectiveMode.value === 'automatic')
const rsvpOpen = computed(() => audience.value?.rsvp?.isOpen !== false)
const archived = computed(() => !!audience.value?.event?.archived)
const template = computed(() => {
  const proposed = templateFor(category.value, { rsvpOpen: rsvpOpen.value })
  return templateOverride.value && allowedTemplates({ rsvpOpen: rsvpOpen.value }).includes(templateOverride.value) ? templateOverride.value : proposed
})
const baseMembers = computed(() => membersOf(families.value, category.value, { template: template.value, selectedIds: selectedIds.value, mode: effectiveMode.value }))
const members = computed(() => baseMembers.value.filter(f => !excludedIds.value.includes(f.id)))
const published = computed(() => (audience.value ? audience.value.event?.published !== false : props.published))
const missing = computed(() => (automatic.value ? withoutTemplate(members.value, templatesState.value) : []))
const templatesState = computed(() => {
  const state = { ...(audience.value?.templates ?? {}) }
  for (const locale of unapproved.value) state[locale] = { sendable: false }
  return state
})
const canNext = computed(() => {
  if (!members.value.length || archived.value) return false
  if (step.value !== 'preview') return true
  return !missing.value.length && (!automatic.value || published.value)
})

const defaultText = computed(() => t(`app.whatsapp.wizard.messages.${template.value}`, { name: '{name}', event: '{event}', link: '{link}' }))
const text = computed(() => customText.value ?? defaultText.value)
watch(template, () => (customText.value = null))

async function load({ keepStep = false } = {}) {
  if (!props.eventId) return
  const id = ++loadId
  loading.value = true
  errorKey.value = null
  try {
    const [info, recipients, roster, reminderInfo] = await Promise.all([
      SendWizardService.audience(props.eventId, 'invitation'),
      SendWizardService.allRecipients(props.eventId, 'invitation'),
      SendWizardService.allRoster(props.eventId),
      // Who is held back depends on the template: the 3-reminders cap only shows up when asking for reminders.
      SendWizardService.audience(props.eventId, 'reminder_pending').catch(() => null)
    ])
    const holds = reminderInfo?.blocked?.reminder_limit > 0 || reminderInfo?.blocked?.recently_sent > 0
    const reminders = props.mode === 'automatic' && info?.mode?.automatic !== false && holds ? await SendWizardService.allRecipients(props.eventId, 'reminder_pending').catch(() => []) : []
    if (id !== loadId) return
    audience.value = info
    families.value = mergeFamilies(recipients, roster, reminders)
    if (!keepStep) start()
    if (props.resume) resumeBatch()
  } catch (e) {
    if (id === loadId) errorKey.value = loadErrorKey(e)
  } finally {
    if (id === loadId) loading.value = false
  }
}

/** First screen: a family from its menu goes straight to the list when it can be shared; otherwise the first card with people. */
function start() {
  stepIndex.value = 0
  templateOverride.value = null
  customText.value = null
  excludedIds.value = []
  unapproved.value = []
  sending.value = false
  inFlight.value = false
  if (props.preselectedIds.length) {
    category.value = 'selected'
    selectedIds.value = [...props.preselectedIds]
    const ready = membersOf(families.value, 'selected', { template: template.value, selectedIds: selectedIds.value, mode: effectiveMode.value })
    if (ready.length) {
      chosen.value = ready
      stepIndex.value = STEPS.indexOf('preview')
    }
    return
  }
  selectedIds.value = []
  const open = rsvpOpen.value
  const first = ['unsent', 'pending', 'all'].find(key => membersOf(families.value, key, { template: templateFor(key, { rsvpOpen: open }), mode: effectiveMode.value }).length)
  category.value = first === 'pending' && !open ? 'all' : (first ?? 'unsent')
}

/** Reopened from the banner: straight to the progress of the batch in flight (step 3 reads it from the server). */
function resumeBatch() {
  chosen.value = []
  stepIndex.value = STEPS.indexOf('confirm')
  sending.value = true
  inFlight.value = true
}

watch(() => props.open, open => open && load(), { immediate: true })
watch(() => props.reloadToken, () => props.open && load({ keepStep: true }))

async function go(delta) {
  stepIndex.value = Math.min(Math.max(stepIndex.value + delta, 0), STEPS.length - 1)
  await nextTick()
  body.value?.querySelector('[data-step-title]')?.focus()
}

async function next() {
  chosen.value = members.value
  await go(1)
}

function close() {
  if (inFlight.value) toast({ title: t('app.whatsapp.wizard.auto.closedWhileSending'), tone: 'neutral' })
  emit('update:open', false)
  emit('closed')
}

function setTemplate(value) {
  templateOverride.value = value
}
function exclude(ids) {
  excludedIds.value = [...new Set([...excludedIds.value, ...ids])]
}
function onBusy(value) {
  sending.value = value
  inFlight.value = value
}
function onFinished() {
  inFlight.value = false
  emit('sent')
}
const bannerKey = computed(() => (props.locked ? 'locked' : 'off'))
</script>

<template>
  <UiModal :open="open" :title="t('app.whatsapp.wizard.title')" size="md" fullscreen-mobile @update:open="$event ? emit('update:open', true) : close()">
    <div ref="body">
      <p class="mb-3 text-xs font-medium uppercase tracking-wide text-ink-500" aria-live="polite" data-testid="wizard-step">
        {{ t('app.whatsapp.wizard.stepOf', { n: stepIndex + 1, total: STEPS.length }) }}
      </p>
      <div class="mb-4 flex gap-1.5" aria-hidden="true">
        <span v-for="(s, i) in STEPS" :key="s" class="h-1.5 flex-1 rounded-full" :class="i <= stepIndex ? 'bg-rose-600' : 'bg-cream-200'" />
      </div>

      <div v-if="loading" class="space-y-3" data-testid="wizard-loading" aria-hidden="true">
        <UiSkeleton height="1.5rem" width="60%" />
        <UiSkeleton v-for="n in 3" :key="n" height="4.5rem" />
      </div>

      <UiEmptyState v-else-if="errorKey" :title="t('app.whatsapp.wizard.loadError')" :description="t(`app.whatsapp.wizard.errors.${errorKey}`)">
        <UiButton v-if="errorKey === 'generic'" variant="secondary" @click="load()">{{ t('app.whatsapp.wizard.retry') }}</UiButton>
      </UiEmptyState>

      <template v-else>
        <p v-if="archived" role="alert" class="mb-4 rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700">{{ t('app.whatsapp.wizard.errors.archived') }}</p>

        <UiCard v-if="locked || audience?.mode?.automatic === false" padding="sm" class="mb-4 bg-cream-100" data-testid="wizard-mode-banner">
          <div class="flex items-start gap-3">
            <WhatsAppIcon class="mt-0.5 h-4 w-4 shrink-0 text-success-700" />
            <div class="min-w-0">
              <p class="text-sm text-ink-700">{{ t(`app.whatsapp.wizard.banner.${bannerKey}`) }}</p>
              <UiButton v-if="locked" class="mt-2" size="sm" variant="outline" @click="emit('unlock')">{{ t('app.whatsapp.wizard.banner.lockedAction') }}</UiButton>
            </div>
          </div>
        </UiCard>
        <div v-if="!published && !(automatic && step === 'confirm')" class="mb-4 flex items-start gap-3 rounded-lg bg-warning-50 px-3 py-2" role="status" data-testid="wizard-unpublished">
          <TriangleAlert class="mt-0.5 h-4 w-4 shrink-0 text-warning-700" aria-hidden="true" />
          <div class="min-w-0 text-sm text-ink-700">
            {{ t('app.whatsapp.wizard.banner.unpublished') }}
            <UiButton v-if="canEdit" size="sm" variant="link" class="ml-1 h-auto" @click="emit('publish')">{{ t('app.whatsapp.wizard.banner.publish') }}</UiButton>
          </div>
        </div>
        <p v-if="!rsvpOpen" class="mb-4 rounded-lg bg-cream-100 px-3 py-2 text-sm text-ink-700" data-testid="wizard-rsvp-closed">{{ t('app.whatsapp.wizard.banner.rsvpClosed') }}</p>

        <SendStepWho
          v-if="step === 'who'"
          v-model:category="category"
          v-model:selected-ids="selectedIds"
          :families="families"
          :rsvp-open="rsvpOpen"
          :mode="effectiveMode"
          :can-edit="canEdit"
          @edit-guest="emit('edit-guest', $event)"
          @add-guest="emit('add-guest')"
        />
        <SendStepPreview
          v-else-if="step === 'preview'"
          :event-id="eventId"
          :event-name="eventName"
          :event-date-label="eventDateLabel"
          :families="members"
          :template="template"
          :text="text"
          :customized="customText !== null"
          :mode="effectiveMode"
          :rsvp-open="rsvpOpen"
          :missing="missing"
          :can-edit="canEdit"
          @update:template="setTemplate"
          @update:text="customText = $event"
          @restore="customText = null"
          @exclude="exclude"
          @unapproved="unapproved = [...new Set([...unapproved, $event])]"
        />
        <SendStepAuto
          v-else-if="step === 'confirm' && automatic"
          :event-id="eventId"
          :families="chosen"
          :template="template"
          :published="published"
          :rsvp-open="rsvpOpen"
          :resume="resume"
          @busy="onBusy"
          @sent="emit('sent')"
          @finished="onFinished"
          @publish="emit('publish')"
          @unlock="emit('unlock')"
        />
        <SendStepManual v-else-if="step === 'confirm'" :event-id="eventId" :event-name="eventName" :families="chosen" :text="text" />
      </template>
    </div>

    <template #footer>
      <template v-if="step === 'confirm' && !loading && !errorKey">
        <UiButton v-if="!sending" variant="ghost" @click="go(-1)">{{ t('app.whatsapp.wizard.back') }}</UiButton>
        <UiButton @click="close">{{ t('app.whatsapp.wizard.close') }}</UiButton>
      </template>
      <template v-else>
        <UiButton v-if="step === 'preview'" variant="ghost" @click="go(-1)">{{ t('app.whatsapp.wizard.back') }}</UiButton>
        <UiButton v-else variant="ghost" @click="close">{{ t('app.whatsapp.wizard.cancel') }}</UiButton>
        <UiButton :disabled="loading || !!errorKey || !canNext" @click="next">{{ t('app.whatsapp.wizard.nextCount', { n: members.length }, members.length) }}</UiButton>
      </template>
    </template>
  </UiModal>
</template>
