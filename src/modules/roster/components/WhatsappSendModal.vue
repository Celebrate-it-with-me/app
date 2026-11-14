<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Lock, MessageCircle, Send } from 'lucide-vue-next'
import { UiModal, UiButton, UiRadioGroup, UiBadge, UiCard } from '@/ui'
import WhatsappService from '../services/WhatsappService'
import { TEMPLATES, MAX_BATCH, groupSkipped, sendErrorKey, manualShareUrl } from '../utils/whatsapp'

const props = defineProps({
  open: { type: Boolean, default: false },
  eventId: { type: [Number, String], default: null },
  eventName: { type: String, default: '' },
  /** The plan does not include automatic sending: only manual wa.me links are offered. */
  locked: { type: Boolean, default: false },
  /** Only manual links (locked, or the module is off for the event). */
  manual: { type: Boolean, default: false },
  /** Families on screen, for the manual links. */
  families: { type: Array, default: () => [] },
  /** People counts of the audiences, to show before sending. */
  counts: { type: Object, default: () => ({ all: 0, pending: 0 }) },
  selectedIds: { type: Array, default: () => [] }
})
const emit = defineEmits(['update:open', 'sent', 'unlock'])
const { t } = useI18n()

const template = ref('invitation')
const audience = ref('all')
const step = ref('form') // form | confirm | result
const sending = ref(false)
const errorKey = ref(null)
const result = ref(null)

watch(
  () => props.open,
  open => {
    if (!open) return
    template.value = 'invitation'
    audience.value = props.selectedIds.length ? 'selected' : 'all'
    step.value = 'form'
    errorKey.value = null
    result.value = null
  },
  { immediate: true }
)
// A reminder is for those who have not answered.
watch(template, value => {
  if (value === 'reminder_pending' && audience.value === 'all') audience.value = 'pending'
})

const templateOptions = computed(() => TEMPLATES.map(key => ({ value: key, label: t(`app.whatsapp.templates.${key}.name`), description: t(`app.whatsapp.templates.${key}.help`) })))
const audienceOptions = computed(() => [
  { value: 'all', label: t('app.whatsapp.audience.all', { n: props.counts.all }, props.counts.all) },
  { value: 'pending', label: t('app.whatsapp.audience.pending', { n: props.counts.pending }, props.counts.pending) },
  {
    value: 'selected',
    label: t('app.whatsapp.audience.selected', { n: props.selectedIds.length }, props.selectedIds.length),
    description: props.selectedIds.length ? '' : t('app.whatsapp.audience.selectedHelp'),
    disabled: !props.selectedIds.length
  }
])
const recipients = computed(() => (audience.value === 'all' ? props.counts.all : audience.value === 'pending' ? props.counts.pending : props.selectedIds.length))
const tooMany = computed(() => audience.value === 'selected' && props.selectedIds.length > MAX_BATCH)
const skippedGroups = computed(() => groupSkipped(result.value?.skipped ?? []))
const recentlySent = computed(() => (result.value?.skipped ?? []).filter(s => s.reason === 'recently_sent'))

async function send(override = null) {
  sending.value = true
  errorKey.value = null
  try {
    const body = override ?? { template: template.value, audience: audience.value, guestIds: props.selectedIds }
    result.value = await WhatsappService.send(props.eventId, body)
    step.value = 'result'
    emit('sent', result.value)
  } catch (e) {
    errorKey.value = sendErrorKey(e)
    step.value = 'form'
    if (errorKey.value === 'locked') emit('unlock')
  } finally {
    sending.value = false
  }
}

const resendRecent = () => send({ template: template.value, audience: 'selected', guestIds: recentlySent.value.map(s => s.guestId), force: true })

const shareText = family => t('app.roster.shareText', { name: family.name, event: props.eventName, link: family.link })
const title = computed(() => (props.locked || props.manual ? t('app.whatsapp.manual.title') : t('app.whatsapp.title')))
</script>

<template>
  <UiModal :open="open" :title="title" size="md" @update:open="emit('update:open', $event)">
    <!-- Free plan: no automatic sending, only the manual link -->
    <template v-if="locked || manual">
      <UiCard v-if="locked" padding="sm" class="bg-gold-50">
        <div class="flex items-start gap-3">
          <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-100 text-gold-700"><Lock class="h-4 w-4" aria-hidden="true" /></span>
          <div class="min-w-0">
            <p class="font-semibold text-ink-900">{{ t('app.whatsapp.manual.lockedTitle') }}</p>
            <p class="mt-1 text-sm text-ink-700">{{ t('app.whatsapp.manual.lockedText') }}</p>
            <UiButton class="mt-3" size="sm" variant="outline" @click="emit('unlock')">{{ t('app.whatsapp.manual.upgrade') }}</UiButton>
          </div>
        </div>
      </UiCard>
      <p class="mt-4 text-sm text-ink-500">{{ t('app.whatsapp.manual.help') }}</p>
      <ul v-if="families.length" class="mt-3 divide-y divide-line rounded-xl border border-line">
        <li v-for="family in families" :key="family.id" class="flex items-center justify-between gap-3 px-3 py-2.5">
          <div class="min-w-0">
            <p class="truncate font-medium text-ink-900">{{ family.name }}</p>
            <p class="truncate text-sm text-ink-500">{{ family.phone || t('app.whatsapp.state.no_phone') }}</p>
          </div>
          <UiButton
            v-if="family.phone && family.link"
            size="sm"
            variant="secondary"
            :href="manualShareUrl(family, shareText(family))"
            target="_blank"
            rel="noopener"
            :aria-label="t('app.whatsapp.manual.shareLabel', { name: family.name })"
          >
            <MessageCircle class="h-4 w-4" aria-hidden="true" />
            {{ t('app.whatsapp.manual.share') }}
          </UiButton>
        </li>
      </ul>
      <p v-else class="mt-3 text-sm text-ink-500">{{ t('app.whatsapp.manual.empty') }}</p>
    </template>

    <!-- Step 1: choose -->
    <template v-else-if="step === 'form'">
      <p v-if="errorKey" role="alert" class="mb-4 rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700">{{ t(`app.whatsapp.errors.${errorKey}`) }}</p>
      <fieldset>
        <legend class="mb-2 text-sm font-semibold text-ink-700">{{ t('app.whatsapp.templateLabel') }}</legend>
        <UiRadioGroup v-model="template" :options="templateOptions" cards />
      </fieldset>
      <fieldset class="mt-5">
        <legend class="mb-2 text-sm font-semibold text-ink-700">{{ t('app.whatsapp.audienceLabel') }}</legend>
        <UiRadioGroup v-model="audience" :options="audienceOptions" />
      </fieldset>
      <p class="mt-4 rounded-lg bg-cream-100 px-3 py-2 text-sm text-ink-700" aria-live="polite">
        {{ t('app.whatsapp.preview', { n: recipients }, recipients) }}
      </p>
      <p v-if="tooMany" role="alert" class="mt-2 text-sm text-danger-700">{{ t('app.whatsapp.errors.tooMany') }}</p>
    </template>

    <!-- Step 2: confirm -->
    <template v-else-if="step === 'confirm'">
      <p class="text-base text-ink-700">
        {{ t('app.whatsapp.confirm.text', { template: t(`app.whatsapp.templates.${template}.name`), n: recipients }, recipients) }}
      </p>
      <p class="mt-3 text-sm text-ink-500">{{ t('app.whatsapp.confirm.note') }}</p>
    </template>

    <!-- Step 3: result -->
    <template v-else>
      <div class="rounded-xl bg-success-50 px-4 py-3 text-success-700" role="status">
        <p class="font-semibold">{{ t('app.whatsapp.result.queued', { n: result.queued }, result.queued) }}</p>
        <p class="text-sm">{{ t('app.whatsapp.result.queuedHelp') }}</p>
      </div>
      <div v-if="skippedGroups.length" class="mt-4">
        <p class="font-semibold text-ink-900">{{ t('app.whatsapp.result.skipped', { n: result.skipped.length }, result.skipped.length) }}</p>
        <ul class="mt-2 space-y-3">
          <li v-for="group in skippedGroups" :key="group.reason" class="rounded-lg border border-line p-3">
            <div class="flex flex-wrap items-center gap-2">
              <UiBadge tone="warning" size="sm">{{ group.guests.length }}</UiBadge>
              <p class="text-sm font-medium text-ink-900">{{ t(`app.whatsapp.skip.${group.reason}`) }}</p>
            </div>
            <p class="mt-1 text-sm text-ink-500">{{ group.guests.join(', ') }}</p>
          </li>
        </ul>
        <UiButton v-if="recentlySent.length" class="mt-3" size="sm" variant="secondary" :loading="sending" @click="resendRecent">
          {{ t('app.whatsapp.result.resend', { n: recentlySent.length }, recentlySent.length) }}
        </UiButton>
      </div>
      <p v-if="errorKey" role="alert" class="mt-3 text-sm text-danger-700">{{ t(`app.whatsapp.errors.${errorKey}`) }}</p>
    </template>

    <template #footer>
      <template v-if="locked || manual || step === 'result'">
        <UiButton variant="ghost" @click="emit('update:open', false)">{{ t('app.whatsapp.close') }}</UiButton>
      </template>
      <template v-else-if="step === 'form'">
        <UiButton variant="ghost" @click="emit('update:open', false)">{{ t('app.roster.cancel') }}</UiButton>
        <UiButton :disabled="!recipients || tooMany" @click="step = 'confirm'">{{ t('app.whatsapp.next') }}</UiButton>
      </template>
      <template v-else>
        <UiButton variant="ghost" :disabled="sending" @click="step = 'form'">{{ t('app.whatsapp.back') }}</UiButton>
        <UiButton :loading="sending" @click="send()">
          <Send class="h-4 w-4" aria-hidden="true" />
          {{ t('app.whatsapp.confirm.send') }}
        </UiButton>
      </template>
    </template>
  </UiModal>
</template>
