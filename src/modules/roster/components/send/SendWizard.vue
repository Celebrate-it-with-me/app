<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Lock, TriangleAlert } from 'lucide-vue-next'
import { UiModal, UiButton, UiCard, UiSkeleton, UiEmptyState } from '@/ui'
import SendWizardService from '../../services/SendWizardService'
import { MODE_DEFAULT, STEPS, loadErrorKey, mergeFamilies, membersOf, needsBigBatchConfirm, templateFor } from '../../utils/sendWizard'
import SendStepWho from './SendStepWho.vue'
import SendStepManual from './SendStepManual.vue'

/**
 * Send wizard, manual mode (contract F3): step 1 "who" and step 3 "confirm" (the assisted wa.me list).
 * Step 2 (preview) and the automatic send are F4: they plug into STEPS and the `automatic` branch of the footer.
 */
const props = defineProps({
  open: { type: Boolean, default: false },
  eventId: { type: [Number, String], default: null },
  eventName: { type: String, default: '' },
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
const emit = defineEmits(['update:open', 'closed', 'unlock', 'publish', 'edit-guest', 'add-guest'])
const { t } = useI18n()

const loading = ref(false)
const errorKey = ref(null)
const audience = ref(null)
const families = ref([])
const category = ref('unsent')
const selectedIds = ref([])
const confirmedBig = ref(false)
const stepIndex = ref(0)
const body = ref(null)
// Step 3 works with the families chosen when it opened (marking one does not reshuffle the list).
const chosen = ref([])
let loadId = 0

const step = computed(() => STEPS[stepIndex.value])
const rsvpOpen = computed(() => audience.value?.rsvp?.isOpen !== false)
const archived = computed(() => !!audience.value?.event?.archived)
const template = computed(() => templateFor(category.value, { rsvpOpen: rsvpOpen.value }))
const members = computed(() => membersOf(families.value, category.value, { template: template.value, selectedIds: selectedIds.value, mode: props.mode }))
const big = computed(() => needsBigBatchConfirm(members.value.length, props.mode))
const canNext = computed(() => members.value.length > 0 && !archived.value && (!big.value || confirmedBig.value))
const published = computed(() => (audience.value ? audience.value.event?.published !== false : props.published))

async function load({ keepStep = false } = {}) {
  if (!props.eventId) return
  const id = ++loadId
  loading.value = true
  errorKey.value = null
  try {
    const [info, recipients, roster] = await Promise.all([
      SendWizardService.audience(props.eventId, 'invitation'),
      SendWizardService.allRecipients(props.eventId, 'invitation'),
      SendWizardService.allRoster(props.eventId)
    ])
    if (id !== loadId) return
    audience.value = info
    families.value = mergeFamilies(recipients, roster)
    if (!keepStep) start()
  } catch (e) {
    if (id === loadId) errorKey.value = loadErrorKey(e)
  } finally {
    if (id === loadId) loading.value = false
  }
}

/** First screen: a family from its menu goes straight to the list when it can be shared; otherwise the first card with people. */
function start() {
  confirmedBig.value = false
  stepIndex.value = 0
  if (props.preselectedIds.length) {
    category.value = 'selected'
    selectedIds.value = [...props.preselectedIds]
    const ready = membersOf(families.value, 'selected', { template: template.value, selectedIds: selectedIds.value, mode: props.mode })
    if (ready.length) {
      chosen.value = ready
      stepIndex.value = STEPS.indexOf('confirm')
    }
    return
  }
  selectedIds.value = []
  const open = rsvpOpen.value
  const first = ['unsent', 'pending', 'all'].find(key => membersOf(families.value, key, { template: templateFor(key, { rsvpOpen: open }), mode: props.mode }).length)
  category.value = first === 'pending' && !open ? 'all' : (first ?? 'unsent')
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
  emit('update:open', false)
  emit('closed')
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

        <UiCard v-if="locked || audience?.mode?.automatic === false" padding="sm" class="mb-4 bg-gold-50" data-testid="wizard-mode-banner">
          <div class="flex items-start gap-3">
            <Lock class="mt-0.5 h-4 w-4 shrink-0 text-gold-700" aria-hidden="true" />
            <div class="min-w-0">
              <p class="text-sm text-ink-700">{{ t(`app.whatsapp.wizard.banner.${bannerKey}`) }}</p>
              <UiButton v-if="locked" class="mt-2" size="sm" variant="outline" @click="emit('unlock')">{{ t('app.whatsapp.wizard.banner.lockedAction') }}</UiButton>
            </div>
          </div>
        </UiCard>
        <div v-if="!published" class="mb-4 flex items-start gap-3 rounded-lg bg-warning-50 px-3 py-2" role="status" data-testid="wizard-unpublished">
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
          v-model:confirmed-big="confirmedBig"
          :families="families"
          :rsvp-open="rsvpOpen"
          :mode="mode"
          :can-edit="canEdit"
          @edit-guest="emit('edit-guest', $event)"
          @add-guest="emit('add-guest')"
        />
        <SendStepManual
          v-else-if="step === 'confirm'"
          :event-id="eventId"
          :event-name="eventName"
          :families="chosen"
          :template="template"
        />
      </template>
    </div>

    <template #footer>
      <template v-if="step === 'confirm' && !loading && !errorKey">
        <UiButton variant="ghost" @click="go(-1)">{{ t('app.whatsapp.wizard.back') }}</UiButton>
        <UiButton @click="close">{{ t('app.whatsapp.wizard.close') }}</UiButton>
      </template>
      <template v-else>
        <UiButton variant="ghost" @click="close">{{ t('app.whatsapp.wizard.cancel') }}</UiButton>
        <UiButton :disabled="loading || !!errorKey || !canNext" @click="next">{{ t('app.whatsapp.wizard.nextCount', { n: members.length }, members.length) }}</UiButton>
      </template>
    </template>
  </UiModal>
</template>
