<script setup>
/**
 * "Plantilla" card of the invitation editor: the template in use, the button that opens the selector and the undo
 * notice after a change. The editor ("Tu invitación") places it; this component brings its own selector sheet.
 *
 *   <TemplatePickerEntry :event-id="event.id" :template-locked="state.templateLocked" @changed="reload" />
 *
 * `changed` fires after a template was applied or the change undone, with the editor state the API answered (like GET invitation).
 * `current` ({ name, tier, previewImage }) is optional: without it the card reads the list itself.
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { LayoutTemplate, Undo2 } from 'lucide-vue-next'
import { UiBadge, UiButton, UiCard, UiSkeleton, useToast } from '@/ui'
import { SUPPORT_EMAIL, mailtoLink } from '@/config/brand'
import TemplatePickerService from '../services/TemplatePickerService'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { activeModuleKeys, unlockLocation } from '../utils/templatePicker'
import TemplatePickerSheet from './TemplatePickerSheet.vue'
import InvitationMiniature from './InvitationMiniature.vue'

const props = defineProps({
  eventId: { type: [Number, String], required: true },
  current: { type: Object, default: null },
  /** The invitation is published: the API refuses the change (409 template_locked) and soporte does it. */
  templateLocked: { type: Boolean, default: false },
  /** The event's template is gone and the invitation falls back to Clásica (`fallbackToClassic`). */
  unavailable: { type: Boolean, default: false },
  /** The role cannot edit (viewer): the change button stays off. */
  disabled: { type: Boolean, default: false }
})
const emit = defineEmits(['changed'])

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const eventsStore = useEventsStore()
const activeModules = computed(() => activeModuleKeys(eventsStore.activeEvent?.modules))

const open = ref(false)
const sheet = ref(null)
const initialTemplateId = ref(null)
const fromPayment = ref(false)
const own = ref(null)
const loadingCurrent = ref(false)
const undoNotice = ref(null) // { name, until }
let undoTimer = null

const shown = computed(() => own.value ?? props.current)
const mailHref = computed(() => mailtoLink({ subject: t('templatePicker.published.mailSubject') }))

async function loadCurrent() {
  if (props.current) return
  loadingCurrent.value = true
  try {
    own.value = (await TemplatePickerService.templates(props.eventId)).find(item => item.current) ?? null
  } catch {
    own.value = null
  } finally {
    loadingCurrent.value = false
  }
}

/** Coming back from the payment (or a deep link): reopen the selector on that template and clean the address. */
function takeTemplateFromAddress() {
  const wanted = route.query.template
  if (!wanted) return
  initialTemplateId.value = String(wanted)
  fromPayment.value = true
  open.value = true
  const rest = { ...route.query }
  delete rest.template
  router.replace({ query: rest })
}

function openPicker() {
  initialTemplateId.value = null
  fromPayment.value = false
  open.value = true
}

function goUnlock(template) {
  router.push(template ? unlockLocation(template.id) : { name: 'unlock', params: { module: 'full' } })
}

function onChanged(data, template, undo) {
  own.value = { ...(own.value ?? {}), ...template, current: true }
  toast.success(t('templatePicker.applied', { name: template.name }))
  clearTimeout(undoTimer)
  const until = undo?.until ? new Date(undo.until).getTime() : Date.now() + 10 * 60 * 1000
  undoNotice.value = { name: undo?.name || '', until }
  undoTimer = setTimeout(() => (undoNotice.value = null), Math.max(0, until - Date.now()))
  emit('changed', data)
}

async function undo() {
  const result = await sheet.value?.undo()
  if (result?.ok) {
    undoNotice.value = null
    clearTimeout(undoTimer)
    own.value = null
    props.current || loadCurrent()
    emit('changed', result.data)
  }
}

onMounted(() => {
  loadCurrent()
  takeTemplateFromAddress()
})
onBeforeUnmount(() => clearTimeout(undoTimer))
watch(() => props.eventId, loadCurrent)
</script>

<template>
  <UiCard :title="t('templatePicker.entry.title')" heading-level="h2">
    <p v-if="unavailable" class="mb-3 rounded-xl bg-warning-50 p-3 text-sm text-warning-700" role="status">{{ t('templatePicker.entry.unavailable') }}</p>

    <div class="flex items-center gap-4">
      <div v-if="loadingCurrent" class="h-[121px] w-14 shrink-0 rounded-lg bg-cream-200" aria-hidden="true"></div>
      <InvitationMiniature
        v-else
        :key="shown?.id ?? 'active'"
        :event-id="eventId"
        :width="56"
        :live="!disabled"
       
        :fallback-image="shown?.previewImage ?? ''"
        :name="shown?.name ?? ''"
        class="shrink-0 rounded-lg ring-1 ring-line"
      />
      <div class="min-w-0 flex-1">
        <UiSkeleton v-if="loadingCurrent" width="9rem" height="1.5rem" />
        <template v-else>
          <p class="truncate font-heading text-xl text-ink-900">{{ shown?.name ?? t('templatePicker.entry.none') }}</p>
          <UiBadge v-if="shown" class="mt-1" :tone="shown.tier === 'premium' ? 'gold' : 'neutral'" size="sm">
            {{ shown.tier === 'premium' ? t('templatePicker.premium') : t('templatePicker.free') }}
          </UiBadge>
        </template>
      </div>
    </div>

    <div v-if="undoNotice" class="mt-4 flex items-center justify-between gap-3 rounded-xl bg-cream-100 p-3" role="status">
      <p class="text-sm text-ink-700">{{ undoNotice.name ? t('templatePicker.undoNotice', { name: undoNotice.name }) : t('templatePicker.undoNoticeGeneric') }}</p>
      <UiButton size="sm" variant="secondary" @click="undo">
        <Undo2 class="h-4 w-4" aria-hidden="true" />
        {{ t('templatePicker.undo') }}
      </UiButton>
    </div>

    <div class="mt-4">
      <UiButton block variant="secondary" :disabled="templateLocked || disabled" :aria-describedby="templateLocked ? 'template-picker-locked' : undefined" @click="openPicker">
        <LayoutTemplate class="h-4 w-4" aria-hidden="true" />
        {{ t('templatePicker.entry.change') }}
      </UiButton>
      <div v-if="templateLocked" id="template-picker-locked" class="mt-3 text-sm text-ink-600">
        <p>{{ t('templatePicker.published.text') }}</p>
        <a :href="mailHref" class="mt-1 inline-block font-medium text-rose-700 underline underline-offset-2">{{ t('templatePicker.published.contact') }} ({{ SUPPORT_EMAIL }})</a>
      </div>
    </div>

    <TemplatePickerSheet
      ref="sheet"
      v-model:open="open"
      :event-id="eventId"
      :initial-template-id="initialTemplateId"
      :from-payment="fromPayment"
      :active-modules="activeModules"
      @changed="onChanged"
      @unlock="goUnlock"
    />
  </UiCard>
</template>
