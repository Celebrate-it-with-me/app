<script setup>
/**
 * The template selector: ONE screen, two zones. On the left the grid (search, filters, cards); on the right the live
 * preview of the selected template and the main button. On a phone it is one column: preview, a strip of thumbnails and
 * the button in the footer. The API decides what is locked or allowed; this screen only dresses its answers (contract:
 * docs/plans/template-stage5-contract-draft.md, 3.2, 3.3, 3.5, 8, and module-template-compat-contract.md).
 *
 * Changing template saves straight away when nothing resets, nothing is lost and nothing is published; otherwise a short
 * confirmation says what is kept and what restarts.
 */
import { computed, onBeforeUnmount, provide, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Check, Lock, RotateCcw } from 'lucide-vue-next'
import { UiButton, UiModal, UiSkeleton, useToast } from '@/ui'
import { SUPPORT_EMAIL, mailtoLink } from '@/config/brand'
import PaymentsService from '@/modules/payments/services/PaymentsService'
import UnlockBanner from '@/modules/payments/components/UnlockBanner.vue'
import { formatMoney } from '@/modules/payments/utils/money'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { eventMoment, formatEventDate } from '@/utils/eventDateTime'
import { useTemplatePicker } from '../composables/useTemplatePicker'
import { useTemplateBrowser } from '../composables/useTemplateBrowser'
import { useFavoriteTemplates } from '../composables/useFavoriteTemplates'
import { MINIATURE_SESSION, createMiniatureSession } from '../composables/useMiniatureSession'
import { conflictingModules, moduleNames, storedUserId } from '../utils/templatePicker'
import TemplateFilters from './TemplateFilters.vue'
import TemplateGrid from './TemplateGrid.vue'
import TemplateThumbStrip from './TemplateThumbStrip.vue'
import TemplatePreviewPanel from './TemplatePreviewPanel.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  eventId: { type: [Number, String], required: true },
  /** Open straight on this template (coming back from the payment, or a deep link). */
  initialTemplateId: { type: [Number, String], default: null },
  /** True when she just came back from paying: the button offers "use it now". */
  fromPayment: { type: Boolean, default: false },
  /** Slugs of the event's active modules: changing to a template that lacks one asks for confirmation first. */
  activeModules: { type: Array, default: () => [] },
  /** Stage of the invitation (`invitation` | `save_the_date`): what the preview shows first. */
  stage: { type: String, default: 'invitation' }
})
const emit = defineEmits(['update:open', 'changed', 'unlock', 'undone'])

const { t, te, tm, rt, locale } = useI18n()
const toast = useToast()
const eventsStore = useEventsStore()
const picker = useTemplatePicker(() => props.eventId)
const favorites = useFavoriteTemplates(storedUserId)
const browser = useTemplateBrowser(() => picker.templates.value, favorites.ids)
// Shared by the miniatures: payload cache (kept while the sheet lives), spaced request queue and a pool of 2 iframes.
const miniatures = createMiniatureSession()
provide(MINIATURE_SESSION, miniatures)
onBeforeUnmount(() => miniatures.dispose())

const selected = ref(null)
const previewLocale = ref('es')
const previewState = ref('invitation')
const quote = ref(null)
const confirmOpen = ref(false)
const confirmError = ref('') // '' or the key of templatePicker.errors.*
const discardAsk = ref(false)
const publishedOpen = ref(false)

const event = computed(() => eventsStore.activeEvent)
const eventName = computed(() => event.value?.eventName ?? '')
const dateLabel = computed(() => (event.value ? formatEventDate(eventMoment(event.value), 'date', locale.value, event.value.timezone) : ''))
const conflictNames = computed(() => moduleNames(conflictingModules(selected.value, props.activeModules), { t, te }).join(', '))
const isCurrent = computed(() => !!selected.value?.current)
const isLocked = computed(() => !!selected.value?.locked)
const hasLockedTemplates = computed(() => picker.templates.value.some(template => template.locked))
const dirty = computed(() => !!selected.value && !isCurrent.value)
const price = computed(() => (quote.value ? formatMoney(quote.value.amountCents, quote.value.currency, locale.value) : ''))
const unlockLabel = computed(() => (price.value ? t('templatePicker.preview.unlockPrice', { price: price.value }) : t('templatePicker.preview.unlock')))
const paidNow = computed(() => props.fromPayment && !isCurrent.value && !isLocked.value && selected.value?.tier === 'premium')
const included = computed(() => tm('pricing.full.items').slice(0, 4).map(item => rt(item)))
const mailHref = computed(() => mailtoLink({ subject: t('templatePicker.published.mailSubject') }))
const busy = computed(() => picker.applying.value)

function renderPreview() {
  if (!selected.value) return
  picker.loadPreview(selected.value, { locale: previewLocale.value, state: previewState.value })
}

async function loadQuote() {
  quote.value = null
  try {
    quote.value = await PaymentsService.quote(props.eventId)
  } catch {
    /* the price is a courtesy: the unlock screen shows it */
  }
}

function select(template) {
  if (!template || String(selected.value?.id) === String(template.id)) return
  selected.value = template
  confirmError.value = ''
  if (!template.current) picker.loadImpact(template)
  if (template.locked) loadQuote()
}

function goUnlock() {
  emit('unlock', selected.value)
  emit('update:open', false)
}

/** Closing with a template looked at but not applied asks first; closing on the current one does not. */
function onOpenChange(value) {
  if (!value && dirty.value && !busy.value && !confirmOpen.value) {
    discardAsk.value = true
    return
  }
  emit('update:open', value)
}

function leave() {
  discardAsk.value = false
  emit('update:open', false)
}

/** Does this change need to be asked about (something restarts, a module is lost, or the published look changes)? */
function needsConfirmation(data) {
  return !!(data?.resets?.length || data?.changesPublishedLook || conflictNames.value)
}

async function primary() {
  if (isLocked.value) return goUnlock()
  confirmError.value = ''
  const data = picker.impactStatus.value === 'ready' ? picker.impact.value : await picker.loadImpact(selected.value)
  if (!data || needsConfirmation(data)) {
    confirmOpen.value = true
    return
  }
  await apply()
}

async function apply() {
  confirmError.value = ''
  const target = selected.value
  const result = await picker.apply(target)
  if (result.ok) {
    confirmOpen.value = false
    emit('changed', result.data, target, picker.undo.value)
    emit('update:open', false)
    return
  }
  if (result.code === 'plan_required') {
    confirmOpen.value = false
    return goUnlock()
  }
  if (result.code === 'template_locked') {
    confirmOpen.value = false
    publishedOpen.value = true
    return
  }
  if (result.code === 'template_not_available' || result.code === 'template_not_found') {
    confirmOpen.value = false
    toast.error(t('templatePicker.errors.notAvailable'))
    await picker.load()
    select(picker.templates.value.find(item => item.current) ?? picker.templates.value[0])
    return
  }
  confirmError.value = result.code === 'event_archived' ? 'archived' : result.code === 'forbidden' ? 'forbidden' : 'generic'
}

async function undo() {
  const name = picker.undo.value?.name
  const result = await picker.undoLast()
  if (result.ok) {
    emit('undone', result.data)
    toast.success(t('templatePicker.undone', { name }))
  } else {
    const key = { event_archived: 'archived', forbidden: 'forbidden' }[result.code]
    toast.error(result.code === 'template_locked' ? t('templatePicker.published.text') : t(`templatePicker.errors.${key ?? 'generic'}`))
  }
  return result
}

function kindText(group, item) {
  const key = `templatePicker.confirm.${group}.${item.kind}`
  return te(key) ? t(key, { count: item.count ?? 0 }) : t(`templatePicker.confirm.${group}.other`)
}

async function begin() {
  selected.value = null
  confirmOpen.value = false
  discardAsk.value = false
  confirmError.value = ''
  browser.clear()
  previewLocale.value = locale.value === 'en' ? 'en' : 'es'
  previewState.value = props.stage === 'save_the_date' ? 'save_the_date' : 'invitation'
  picker.resetPreview()
  await picker.load()
  const list = picker.templates.value
  const wanted = props.initialTemplateId != null ? list.find(item => String(item.id) === String(props.initialTemplateId)) : null
  select(wanted ?? list.find(item => item.current) ?? list[0])
}

watch(
  () => props.open,
  open => {
    if (open) begin()
    else miniatures.dispose()
  },
  { immediate: true }
)
watch([selected, previewLocale, previewState], renderPreview)

defineExpose({ undo, picker })
</script>

<template>
  <UiModal :open="open" :title="t('templatePicker.title')" :description="t('templatePicker.subtitle')" size="xl" bare fullscreen-mobile @update:open="onOpenChange">
    <div class="flex h-full flex-col sm:h-[min(44rem,calc(92dvh-9.5rem))]" data-testid="template-picker-body">
    <div v-if="hasLockedTemplates && !fromPayment" class="shrink-0 px-4 pt-2 sm:px-6">
      <UnlockBanner :event-id="eventId" @unlock="goUnlock" />
    </div>
    <div class="flex min-h-0 flex-1 flex-col overflow-y-auto lg:grid lg:grid-cols-[minmax(0,1fr)_25rem] lg:overflow-hidden">
      <!-- left zone (wide screens): search, filters and the grid, with its own scroll -->
      <div class="hidden min-h-0 flex-col gap-4 px-6 py-4 lg:flex" data-testid="template-left">
        <TemplateFilters
          v-if="browser.enabled.value && picker.status.value === 'ready'"
          v-model:access="browser.access.value"
          v-model:tag="browser.tag.value"
          v-model:query="browser.query.value"
          v-model:favorites-only="browser.favoritesOnly.value"
          :tags="browser.tags.value"
          :count="browser.results.value.length"
          :has-favorites="favorites.count.value > 0"
        />
        <div class="min-h-0 flex-1 overflow-y-auto p-1 -m-1">
          <TemplateGrid
            :status="picker.status.value"
            :templates="browser.results.value"
            :total="picker.templates.value.length"
            :selected-id="selected?.id"
            :event-id="eventId"
            :event-name="eventName"
            :date-label="dateLabel"
            :can-favorite="browser.enabled.value"
            :is-favorite="favorites.isFavorite"
            @select="select"
            @favorite="template => favorites.toggle(template.id)"
            @retry="picker.load()"
            @clear="browser.clear()"
          />
        </div>
      </div>

      <!-- right zone (and the whole phone layout): the preview of the selected template -->
      <TemplatePreviewPanel
        v-if="selected || picker.status.value === 'ready'"
        :template="selected"
        :payload="picker.previewPayload.value"
        :status="picker.previewStatus.value"
        :error="picker.previewError.value"
        :language="previewLocale"
        :stage="previewState"
        :included="included"
        :paid-now="paidNow"
        class="order-1 lg:order-none lg:shrink"
        @update:language="previewLocale = $event"
        @update:stage="previewState = $event"
        @retry="renderPreview"
      />
      <div v-else-if="picker.status.value === 'loading' || picker.status.value === 'idle'" class="p-5 lg:hidden" role="status" :aria-label="t('templatePicker.loading')"><UiSkeleton height="20rem" /></div>

      <!-- phone: a strip of thumbnails instead of the grid -->
      <div class="order-2 flex shrink-0 flex-col gap-3 px-4 pb-4 pt-3 lg:hidden" data-testid="template-strip-zone">
        <TemplateThumbStrip v-if="picker.status.value === 'ready'" :templates="picker.templates.value" :selected-id="selected?.id" :event-id="eventId" :event-name="eventName" :date-label="dateLabel" @select="select" />
        <TemplateGrid v-else :status="picker.status.value" :templates="[]" :total="picker.templates.value.length" @retry="picker.load()" />
      </div>
    </div>
    </div>

    <template #footer>
      <p v-if="confirmError" class="mr-auto self-center text-sm text-danger-700" role="alert">{{ t(`templatePicker.errors.${confirmError}`) }}</p>
      <p v-else-if="selected && !isCurrent && !isLocked" class="mr-auto hidden self-center text-sm text-ink-500 sm:block">{{ t('templatePicker.action.keeps') }}</p>
      <UiButton variant="ghost" @click="onOpenChange(false)">{{ t('templatePicker.confirm.cancel') }}</UiButton>
      <UiButton v-if="selected && isCurrent" disabled>{{ t('templatePicker.preview.inUseButton') }}</UiButton>
      <UiButton v-else-if="selected && isLocked" data-testid="primary-action" @click="primary">
        <Lock class="h-4 w-4" aria-hidden="true" />
        {{ unlockLabel }}
      </UiButton>
      <UiButton v-else-if="selected" data-testid="primary-action" :loading="busy" :disabled="picker.previewStatus.value === 'forbidden'" @click="primary">
        {{ paidNow ? t('templatePicker.preview.useNow') : t('templatePicker.preview.use') }}
      </UiButton>
    </template>

    <!-- short confirmation: only when something restarts, a module is lost or the published look changes -->
    <UiModal :open="confirmOpen" :title="t('templatePicker.confirm.title', { name: selected?.name ?? '' })" size="sm" @update:open="value => !busy && (confirmOpen = value)">
      <div class="flex flex-col gap-3" data-testid="confirm-change">
        <div v-if="picker.impactStatus.value === 'loading'" role="status" :aria-label="t('templatePicker.confirm.loading')"><UiSkeleton :lines="3" /></div>
        <div v-else-if="picker.impactStatus.value === 'error'" class="rounded-xl bg-danger-50 p-3" role="alert">
          <p class="text-sm text-danger-700">{{ t('templatePicker.confirm.failed') }}</p>
          <UiButton class="mt-2" size="sm" variant="secondary" @click="picker.loadImpact(selected)">{{ t('templatePicker.retry') }}</UiButton>
        </div>
        <template v-else-if="picker.impact.value">
          <p v-if="conflictNames" class="rounded-xl bg-warning-50 p-3 text-sm text-warning-700" role="note" data-testid="missing-ask">{{ t('templatePicker.missing.ask', { names: conflictNames }) }}</p>
          <ul v-if="picker.impact.value.keeps?.length" class="flex flex-col gap-1.5">
            <li v-for="(item, index) in picker.impact.value.keeps" :key="`k${index}`" class="flex items-start gap-2 text-sm text-ink-800">
              <Check class="mt-0.5 h-4 w-4 shrink-0 text-success-500" aria-hidden="true" />
              <span>{{ kindText('keeps', item) }}</span>
            </li>
          </ul>
          <ul v-if="picker.impact.value.resets?.length" class="flex flex-col gap-1.5">
            <li v-for="(item, index) in picker.impact.value.resets" :key="`r${index}`" class="flex items-start gap-2 text-sm text-ink-800">
              <RotateCcw class="mt-0.5 h-4 w-4 shrink-0 text-gold-700" aria-hidden="true" />
              <span>{{ kindText('resets', item) }}</span>
            </li>
          </ul>
          <p v-if="picker.impact.value.restoresFromStash" class="rounded-xl bg-success-50 p-3 text-sm text-success-700">{{ t('templatePicker.confirm.restores') }}</p>
          <p v-if="picker.impact.value.changesPublishedLook" class="rounded-xl bg-warning-50 p-3 text-sm text-warning-700" role="note">{{ t('templatePicker.confirm.publishedLook') }}</p>
          <p class="text-sm text-ink-500">{{ t('templatePicker.confirm.undoHint') }}</p>
        </template>
        <p v-if="confirmError" class="rounded-xl bg-danger-50 p-3 text-sm text-danger-700" role="alert">{{ t(`templatePicker.errors.${confirmError}`) }}</p>
      </div>
      <template #footer>
        <UiButton variant="ghost" :disabled="busy" @click="confirmOpen = false">{{ conflictNames ? t('templatePicker.missing.cancel') : t('templatePicker.confirm.cancel') }}</UiButton>
        <UiButton v-if="picker.impact.value?.locked" @click="goUnlock">
          <Lock class="h-4 w-4" aria-hidden="true" />
          {{ unlockLabel }}
        </UiButton>
        <UiButton v-else data-testid="confirm-apply" :loading="busy" :disabled="picker.impactStatus.value !== 'ready'" @click="apply">
          {{ conflictNames ? t('templatePicker.missing.accept') : t('templatePicker.confirm.apply') }}
        </UiButton>
      </template>
    </UiModal>

    <!-- the invitation is published: only support changes the template -->
    <UiModal :open="publishedOpen" :title="t('templatePicker.published.title')" size="sm" @update:open="value => (publishedOpen = value)">
      <p class="text-base text-ink-700" role="alert">{{ t('templatePicker.published.text') }}</p>
      <p class="mt-2 text-sm text-ink-500">{{ t('templatePicker.published.hint', { email: SUPPORT_EMAIL }) }}</p>
      <template #footer>
        <UiButton variant="ghost" @click="leave">{{ t('templatePicker.published.close') }}</UiButton>
        <UiButton :href="mailHref">{{ t('templatePicker.published.contact') }}</UiButton>
      </template>
    </UiModal>

    <!-- closing while looking at a template she did not apply -->
    <UiModal :open="discardAsk" :title="t('templatePicker.discard.title')" size="sm" @update:open="value => (discardAsk = value)">
      <p class="text-base text-ink-700" data-testid="discard-ask">{{ t('templatePicker.discard.text', { name: selected?.name ?? '' }) }}</p>
      <template #footer>
        <UiButton variant="ghost" @click="discardAsk = false">{{ t('templatePicker.discard.stay') }}</UiButton>
        <UiButton data-testid="discard-leave" @click="leave">{{ t('templatePicker.discard.leave') }}</UiButton>
      </template>
    </UiModal>
  </UiModal>
</template>
