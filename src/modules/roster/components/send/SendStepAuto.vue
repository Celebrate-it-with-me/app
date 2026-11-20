<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Send, TriangleAlert } from 'lucide-vue-next'
import { UiBadge, UiButton, UiCheckbox, UiModal, UiSkeleton, useToast } from '@/ui'
import WhatsappService from '../../services/WhatsappService'
import { useBatchPolling } from '../../composables/useBatchPolling'
import { BATCH_COUNTERS, batchProgress, chunk, localeCounts, mergeBatches, needsBigBatchConfirm, retryable, wizardSendErrorKey } from '../../utils/sendWizard'
import { MESSAGE_VIEW, groupSkipped, retryErrorKey, sendErrorKey, validationCode } from '../../utils/whatsapp'

/**
 * Step 3 · Confirm and send, automatic mode (contract 3.5). Three moments in one component: the summary with the final
 * checks (dry run, "I understand" above 100 families, unpublished event), the live progress of the batch, and the result
 * with retries. A send above 500 families goes out in chunks that share one progress. Closing the wizard does not stop
 * anything: the batch lives in the server and `batches/active` brings it back. Cancelling is F5 (not here).
 */
const props = defineProps({
  eventId: { type: [Number, String], required: true },
  /** Families chosen in steps 1 and 2. Empty when the wizard is reopened on a batch in flight. */
  families: { type: Array, default: () => [] },
  template: { type: String, default: 'invitation' },
  published: { type: Boolean, default: true },
  rsvpOpen: { type: Boolean, default: true },
  /** Reopened from the "sending" banner: go straight to the progress of the active batch. */
  resume: { type: Boolean, default: false }
})
const emit = defineEmits(['sent', 'busy', 'publish', 'unlock', 'finished'])
const { t } = useI18n()
const { success, error: showError } = useToast()

const dry = ref(null) // { queued, skipped }
const dryError = ref(null)
const confirmedBig = ref(false)
const sending = ref(false)
const sendError = ref(null)
const batchIds = ref([])
const skipped = ref([]) // skipped[] answered by the sends
const paused = ref(null) // { key, left } a later chunk stopped by a limit
const root = ref(null)
const showWho = ref(false)
const retrying = ref(false)
const confirmUnknown = ref(null) // messages waiting for the "may have arrived" confirmation
let dryId = 0

const started = computed(() => batchIds.value.length > 0)
const big = computed(() => needsBigBatchConfirm(props.families.length, 'automatic'))
const languages = computed(() => localeCounts(props.families))
const blockedByRsvp = computed(() => !props.rsvpOpen && props.template !== 'save_the_date')
const canSend = computed(() => !!dry.value && dry.value.queued > 0 && props.published && !blockedByRsvp.value && (!big.value || confirmedBig.value) && !sending.value)
const omitted = computed(() => groupSkipped(dry.value?.skipped ?? []))
const omittedTotal = computed(() => omitted.value.reduce((sum, g) => sum + g.guests.length, 0))

// Progress: one merged answer for all the chunks of this send.
const { batch, error: pollError, polling, start: startPolling } = useBatchPolling(async () => mergeBatches(await Promise.all(batchIds.value.map(id => WhatsappService.batch(props.eventId, id)))))
const progress = computed(() => batchProgress(batch.value))
const finished = computed(() => !!batch.value && batch.value.done)
const failedCount = computed(() => batch.value?.failed ?? 0)
const okCount = computed(() => Math.max(0, progress.value.total - (batch.value?.queued ?? 0) - failedCount.value))
const rows = computed(() => [...(batch.value?.messages ?? [])].sort((a, b) => Number(b.status === 'failed') - Number(a.status === 'failed')))
const leftover = computed(() => paused.value?.left ?? 0)

watch(started, value => emit('busy', value), { immediate: true })
watch(finished, value => value && emit('finished', batch.value))

async function runDry() {
  const id = ++dryId
  dry.value = null
  dryError.value = null
  try {
    let queued = 0
    const list = []
    for (const part of chunk(props.families.map(f => f.id))) {
      try {
        const answer = await WhatsappService.send(props.eventId, { template: props.template, audience: 'selected', guestIds: part, dryRun: true })
        queued += answer.queued
        list.push(...answer.skipped)
      } catch (e) {
        if (validationCode(e, 'audience') !== 'no_recipients') throw e
      }
    }
    if (id === dryId) dry.value = { queued, skipped: list }
  } catch (e) {
    if (id !== dryId) return
    dryError.value = wizardSendErrorKey(e, sendErrorKey)
    if (dryError.value === 'locked') emit('unlock')
  }
}

async function resumeActive() {
  try {
    const active = await WhatsappService.activeBatch(props.eventId)
    if (active) {
      batchIds.value = [active.batchId]
      await startPolling()
    } else {
      dryError.value = 'noActive'
    }
  } catch {
    dryError.value = 'generic'
  }
}

onMounted(() => (props.resume ? resumeActive() : runDry()))

async function send() {
  sending.value = true
  sendError.value = null
  const ids = []
  const answered = []
  const parts = chunk(props.families.map(f => f.id))
  for (const [index, part] of parts.entries()) {
    try {
      const answer = await WhatsappService.send(props.eventId, { template: props.template, audience: 'selected', guestIds: part, confirmLarge: big.value })
      ids.push(answer.batchId)
      answered.push(...answer.skipped)
    } catch (e) {
      const key = wizardSendErrorKey(e, sendErrorKey)
      if (key === 'noRecipients' && index > 0) continue
      if (index === 0) {
        sendError.value = key
        if (key === 'locked') emit('unlock')
        sending.value = false
        return
      }
      paused.value = { key, left: parts.slice(index).reduce((n, p) => n + p.length, 0) }
      break
    }
  }
  skipped.value = answered
  batchIds.value = ids
  sending.value = false
  emit('sent', ids)
  await nextTick()
  root.value?.querySelector('[data-step-title]')?.focus() // the send button is gone: the title takes the focus
  await startPolling()
}

// Retries: every failed message of the batch, walking its pages; "may have arrived" ones ask once for all.
async function failedOfBatch() {
  const out = []
  for (const id of batchIds.value) {
    for (let page = 1; page <= 20; page++) {
      const answer = await WhatsappService.batch(props.eventId, id, { page, perPage: 100 })
      out.push(...(answer.messages ?? []))
      if ((answer.messages ?? []).length < 100) break
    }
  }
  return out.filter(m => m.status === 'failed')
}

async function retryFailed(only = null) {
  retrying.value = true
  try {
    const list = only ?? (await failedOfBatch())
    if (retryable({ messages: list }).unknown > 0 && confirmUnknown.value === null) {
      confirmUnknown.value = list
      return
    }
    await doRetry(list)
  } catch (e) {
    showError(t(`app.whatsapp.errors.${retryErrorKey(e)}`))
  } finally {
    retrying.value = false
  }
}

async function doRetry(list) {
  confirmUnknown.value = null
  retrying.value = true
  let done = 0
  for (const message of list) {
    try {
      await WhatsappService.retry(props.eventId, message.messageId)
      done++
    } catch (e) {
      const key = retryErrorKey(e)
      if (key === 'dailyLimit' || key === 'tooManyRequests') {
        showError(t(`app.whatsapp.errors.${key}`))
        break
      }
    }
  }
  if (done) success(t('app.whatsapp.wizard.auto.retried', { n: done }, done))
  retrying.value = false
  await startPolling()
}

const view = status => MESSAGE_VIEW[status] ?? MESSAGE_VIEW.queued
const statusKey = status => (['queued', 'sent', 'delivered', 'read', 'failed'].includes(status) ? status : 'queued')
const errorLabel = message => (message.errorCode === 'unknown_delivery' ? t('app.whatsapp.unknownDelivery') : t('app.whatsapp.failedHelp'))
</script>

<template>
  <div ref="root">
    <!-- 1 · Summary and last checks -->
    <template v-if="!started && !resume">
      <h3 class="font-heading text-xl text-ink-900" data-step-title tabindex="-1">{{ t('app.whatsapp.wizard.auto.title') }}</h3>

      <div v-if="!dry && !dryError" class="mt-4 space-y-3" data-testid="auto-loading" aria-hidden="true">
        <UiSkeleton height="1.4rem" width="70%" />
        <UiSkeleton height="3rem" />
      </div>
      <div v-else-if="dryError" role="alert" class="mt-4 rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700" data-testid="auto-dry-error">
        {{ t(`app.whatsapp.errors.${dryError}`) }}
      </div>
      <template v-else>
        <p class="mt-3 text-base text-ink-900" data-testid="auto-summary">
          {{ t('app.whatsapp.wizard.auto.summary', { n: dry.queued, template: t(`app.whatsapp.wizard.templates.${template}`) }, dry.queued) }}
        </p>
        <p v-if="languages.length > 1" class="mt-1 text-sm text-ink-500">{{ languages.map(l => `${t(`app.whatsapp.wizard.preview.lang.${l.locale}`)} ${l.n}`).join(' · ') }}</p>

        <div v-if="omittedTotal" class="mt-3 rounded-xl bg-cream-100 px-3 py-2" data-testid="auto-omitted">
          <p class="text-sm font-medium text-ink-900">{{ t('app.whatsapp.wizard.auto.omitted', { n: omittedTotal }, omittedTotal) }}</p>
          <UiButton size="sm" variant="link" class="h-auto" :aria-expanded="showWho" @click="showWho = !showWho">
            {{ showWho ? t('app.whatsapp.wizard.auto.hideWho') : t('app.whatsapp.wizard.auto.seeWho') }}
          </UiButton>
          <ul v-if="showWho" class="mt-2 space-y-2">
            <li v-for="group in omitted" :key="group.reason" class="text-sm">
              <p class="font-medium text-ink-700">{{ t('app.whatsapp.previewSkip.' + group.reason, { n: group.guests.length }, group.guests.length) }}</p>
              <p class="text-ink-500">{{ group.guests.join(', ') }}</p>
            </li>
          </ul>
        </div>

        <p class="mt-3 text-sm text-ink-500">{{ t('app.whatsapp.wizard.auto.from') }}</p>

        <div v-if="!published" class="mt-4 flex items-start gap-3 rounded-lg bg-warning-50 px-3 py-2" role="alert" data-testid="auto-unpublished">
          <TriangleAlert class="mt-0.5 h-4 w-4 shrink-0 text-warning-700" aria-hidden="true" />
          <div class="min-w-0 text-sm text-ink-700">
            {{ t('app.whatsapp.wizard.auto.unpublished') }}
            <UiButton size="sm" variant="link" class="ml-1 h-auto" @click="emit('publish')">{{ t('app.whatsapp.wizard.banner.publish') }}</UiButton>
          </div>
        </div>
        <p v-if="blockedByRsvp" role="alert" class="mt-4 rounded-lg bg-warning-50 px-3 py-2 text-sm text-ink-700" data-testid="auto-rsvp">{{ t('app.whatsapp.wizard.banner.rsvpClosed') }}</p>

        <div v-if="big" class="mt-4 rounded-xl border border-gold-500/40 bg-gold-50 p-3" data-testid="auto-big">
          <UiCheckbox v-model="confirmedBig">{{ t('app.whatsapp.wizard.auto.big', { n: families.length }) }}</UiCheckbox>
        </div>

        <p v-if="sendError" role="alert" class="mt-4 rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700" data-testid="auto-send-error">{{ t(`app.whatsapp.errors.${sendError}`) }}</p>

        <UiButton class="mt-5" block size="lg" :disabled="!canSend" :loading="sending" data-testid="auto-send" @click="send">
          <Send class="h-4 w-4" aria-hidden="true" />
          {{ t('app.whatsapp.wizard.auto.send', { n: dry.queued }, dry.queued) }}
        </UiButton>
      </template>
    </template>

    <!-- Resume found nothing in flight -->
    <p v-else-if="dryError === 'noActive'" class="text-sm text-ink-700" data-testid="auto-none">{{ t('app.whatsapp.wizard.auto.noActive') }}</p>
    <p v-else-if="dryError" role="alert" class="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700">{{ t(`app.whatsapp.errors.${dryError}`) }}</p>

    <!-- 2 · Progress and result -->
    <template v-else>
      <h3 class="font-heading text-xl text-ink-900" data-step-title tabindex="-1">
        {{ finished ? t('app.whatsapp.wizard.auto.doneTitle') : t('app.whatsapp.wizard.auto.sending') }}
      </h3>

      <p v-if="pollError && !polling" role="alert" class="mt-3 text-sm text-danger-700" data-testid="auto-poll-error">
        {{ t('app.whatsapp.wizard.auto.pollError') }}
        <UiButton size="sm" variant="link" class="h-auto" @click="startPolling">{{ t('app.whatsapp.wizard.retry') }}</UiButton>
      </p>
      <div v-if="!batch && !pollError" class="mt-4 space-y-3" data-testid="auto-progress-loading" aria-hidden="true">
        <UiSkeleton height="0.75rem" />
        <UiSkeleton height="1.2rem" width="60%" />
      </div>
      <template v-else-if="batch">
        <div aria-live="polite">
          <div class="flex items-baseline justify-between gap-3 text-sm">
            <p class="font-medium text-ink-900" data-testid="auto-progress">{{ t('app.whatsapp.wizard.auto.progress', { done: progress.processed, total: progress.total }) }}</p>
            <p class="text-ink-500">{{ progress.percent }}%</p>
          </div>
          <div
            class="mt-2 h-2 overflow-hidden rounded-full bg-cream-100"
            role="progressbar"
            :aria-valuenow="progress.processed"
            aria-valuemin="0"
            :aria-valuemax="progress.total"
            :aria-label="t('app.whatsapp.wizard.auto.progress', { done: progress.processed, total: progress.total })"
          >
            <div class="h-full origin-left rounded-full bg-rose-600 transition-transform duration-300 ease-out motion-reduce:transition-none" :style="{ transform: `scaleX(${progress.percent / 100})` }" />
          </div>
          <p class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-ink-700" data-testid="auto-counters">
            <span v-for="key in BATCH_COUNTERS" :key="key">{{ t(`app.whatsapp.wizard.auto.counter.${key}`, { n: batch[key] ?? 0 }) }}</span>
          </p>
        </div>

        <p v-if="finished" class="mt-4 rounded-xl bg-success-50 px-4 py-3 font-medium text-success-700" role="status" data-testid="auto-result">
          {{ t('app.whatsapp.wizard.auto.result', { ok: okCount, failed: failedCount }) }}
        </p>
        <p v-else class="mt-3 text-sm text-ink-500">{{ t('app.whatsapp.wizard.auto.continues') }}</p>

        <p v-if="paused" role="alert" class="mt-3 rounded-lg bg-warning-50 px-3 py-2 text-sm text-ink-700" data-testid="auto-paused">
          {{ t('app.whatsapp.wizard.auto.paused', { n: leftover }, leftover) }}
        </p>

        <div v-if="finished && failedCount" class="mt-3">
          <UiButton variant="secondary" :loading="retrying" data-testid="auto-retry-all" @click="retryFailed()">
            {{ t('app.whatsapp.wizard.auto.retryFailed', { n: failedCount }, failedCount) }}
          </UiButton>
        </div>

        <details v-if="finished && skipped.length" class="mt-3 rounded-xl border border-line px-3 py-2" data-testid="auto-skipped">
          <summary class="cursor-pointer text-sm font-medium text-ink-900">{{ t('app.whatsapp.wizard.auto.skippedTitle', { n: skipped.length }, skipped.length) }}</summary>
          <ul class="mt-2 space-y-2">
            <li v-for="group in groupSkipped(skipped)" :key="group.reason" class="text-sm">
              <p class="font-medium text-ink-700">{{ t(`app.whatsapp.skip.${group.reason}`) }}</p>
              <p class="text-ink-500">{{ group.guests.join(', ') }}</p>
            </li>
          </ul>
        </details>

        <ul v-if="rows.length" class="mt-4 max-h-72 divide-y divide-line overflow-y-auto rounded-xl border border-line" data-testid="auto-rows">
          <li v-for="message in rows" :key="message.messageId ?? message.guestId" class="px-3 py-2.5">
            <div class="flex items-center justify-between gap-3">
              <p class="min-w-0 truncate font-medium text-ink-900">{{ message.guestName }}</p>
              <UiBadge class="shrink-0" :tone="view(message.status).tone" size="sm">
                <component :is="view(message.status).icon" class="h-3.5 w-3.5" aria-hidden="true" />
                <span class="sr-only">{{ t('app.whatsapp.wizard.auto.statusOf') }}</span>
                {{ t(`app.whatsapp.state.${statusKey(message.status)}`) }}
              </UiBadge>
            </div>
            <div v-if="message.status === 'failed'" class="mt-1 flex items-center justify-between gap-3">
              <p class="min-w-0 text-xs text-danger-700">{{ errorLabel(message) }}</p>
              <UiButton size="sm" variant="secondary" class="shrink-0" :disabled="retrying" :aria-label="t('app.whatsapp.wizard.auto.retryOne', { name: message.guestName })" @click="retryFailed([message])">
                {{ t('app.whatsapp.retry') }}
              </UiButton>
            </div>
          </li>
        </ul>
      </template>
    </template>

    <UiModal :open="!!confirmUnknown" :title="t('app.whatsapp.retryConfirm.title')" size="sm" @update:open="confirmUnknown = null">
      <p class="text-ink-700">{{ t('app.whatsapp.retryConfirm.body') }}</p>
      <template #footer>
        <UiButton variant="ghost" @click="confirmUnknown = null">{{ t('app.roster.cancel') }}</UiButton>
        <UiButton :loading="retrying" @click="doRetry(confirmUnknown)">{{ t('app.whatsapp.retryConfirm.send') }}</UiButton>
      </template>
    </UiModal>
  </div>
</template>
