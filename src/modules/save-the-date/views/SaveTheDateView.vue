<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Check, Eye } from 'lucide-vue-next'
import { UiPageHeader, UiCard, UiField, UiTextarea, UiSwitch, UiButton, UiSkeleton, UiModal, UiBottomSheet, useToast, UiPage } from '@/ui'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { planLimitFrom } from '@/utils/planLimit'
import { eventDate, eventMoment, formatEventDate } from '@/utils/eventDateTime'
import { useFloatingBarSpace } from '@/composables/useFloatingBarSpace'
import GuestLimitNotice from '@/components/internal/limits/GuestLimitNotice.vue'
import SaveTheDateService from '../services/SaveTheDateService'
import SaveTheDatePreview from '../components/SaveTheDatePreview.vue'
import { MESSAGE_MAX, emptySettings, settingsFromApi, settingsPayload, stageView } from '../utils/stage'

const { t, locale } = useI18n()
const { success, error: showError } = useToast()
const eventsStore = useEventsStore()

const event = computed(() => eventsStore.activeEvent)
const canEdit = computed(() => ['owner', 'editor'].includes(event.value?.userRole))
const view = computed(() => stageView(event.value))

const loading = ref(true)
const saving = ref(false)
const acting = ref(false)
const form = ref(emptySettings())
const saved = ref(emptySettings())
const confirming = ref(null)
const limitInfo = ref(null)

const previewOpen = ref(false)
const sheetScale = ref(1)
watch(previewOpen, open => {
  // The phone is 500 px tall: on a short screen it shrinks to what the sheet leaves free (title + padding ~ 120 px).
  if (open) sheetScale.value = Math.min(1, Math.max(0.5, (window.innerHeight * 0.8 - 120) / 500))
})

const dateLabel = computed(() => {
  const text = formatEventDate(eventMoment(event.value), 'weekdayDate', locale.value, event.value?.timezone)
  return text ? text.charAt(0).toLocaleUpperCase(locale.value) + text.slice(1) : ''
})
// The real instant when the API sends one; otherwise the event's wall clock read in the browser's zone.
const target = computed(() => {
  const iso = event.value?.startsAt
  if (typeof iso === 'string' && iso) {
    const date = new Date(iso)
    if (!Number.isNaN(date.getTime())) return date
  }
  return eventDate(event.value)
})
// The three states of the notice: what guests see at the link right now.
const notice = computed(() => (view.value.key === 'live' ? 'live' : view.value.key === 'invitation' ? 'invitation' : 'none'))

// Phones: with unsaved changes the save button rides in a fixed bar, with the assistant's button on its right.
const saveBar = ref(null)
useFloatingBarSpace(saveBar, { inline: true })

const dirty = computed(() => JSON.stringify(settingsPayload(form.value)) !== JSON.stringify(settingsPayload(saved.value)))

async function load() {
  if (!event.value?.id) return
  loading.value = true
  try {
    saved.value = settingsFromApi(await SaveTheDateService.get(event.value.id))
    form.value = { ...saved.value }
  } catch {
    showError(t('app.saveTheDate.loadError'))
  } finally {
    loading.value = false
  }
}
onMounted(load)
watch(() => event.value?.id, load)

async function save() {
  saving.value = true
  try {
    saved.value = settingsFromApi(await SaveTheDateService.save(event.value.id, settingsPayload(form.value)))
    form.value = { ...saved.value }
    success(t('app.saveTheDate.saved'))
  } catch {
    showError(t('app.saveTheDate.saveError'))
  } finally {
    saving.value = false
  }
}

async function run(action) {
  acting.value = true
  limitInfo.value = null
  try {
    if (action === 'publishSaveTheDate') await eventsStore.runEventAction(event.value.id, 'publish', { stage: 'save_the_date' })
    else if (action === 'upgrade') await eventsStore.runEventAction(event.value.id, 'publish', { stage: 'invitation' })
    else await eventsStore.runEventAction(event.value.id, 'unpublish')
    confirming.value = null
    success(t(`app.saveTheDate.done.${action}`))
  } catch (e) {
    const limit = planLimitFrom(e)
    if (limit) limitInfo.value = limit
    confirming.value = null
    showError(limit ? t('app.saveTheDate.limitBlocked') : t('app.saveTheDate.actionError'))
  } finally {
    acting.value = false
  }
}

// Every action asks first: guests are going to see (or stop seeing) the link.
const ask = action => (confirming.value = action)
</script>

<template>
  <UiPage>
    <UiPageHeader :title="t('app.saveTheDate.title')" :subtitle="t('app.saveTheDate.subtitle')" />

    <div v-if="loading" class="mt-6 space-y-4">
      <UiSkeleton class="h-32" />
      <UiSkeleton class="h-56" />
    </div>

    <div v-else-if="event" class="mt-6">
      <div class="space-y-6">
        <section class="flex flex-col items-start gap-2 rounded-xl border border-line bg-white px-[18px] py-3.5 shadow-card md:flex-row md:items-center md:gap-4" data-testid="std-notice">
          <div class="min-w-0 flex-1">
            <h2 class="font-body text-base font-semibold text-ink-900">{{ t(`app.saveTheDate.notice.${view.key === 'archived' ? 'archived' : notice}.title`) }}</h2>
            <p class="mt-0.5 text-sm text-ink-500">{{ t(`app.saveTheDate.notice.${view.key === 'archived' ? 'archived' : notice}.text`) }}</p>
            <GuestLimitNotice v-if="limitInfo" class="mt-3" :info="limitInfo" variant="publish" with-list-link />
            <div v-if="canEdit && view.actions.length" class="mt-3 flex flex-col gap-2 sm:flex-row">
              <UiButton
                v-for="(action, index) in view.actions"
                :key="action"
                size="sm"
                :variant="index === 0 ? 'primary' : 'secondary'"
                :disabled="dirty && action !== 'unpublish'"
                @click="ask(action)"
              >
                {{ t(`app.saveTheDate.actions.${action}`) }}
              </UiButton>
            </div>
            <p v-if="dirty && view.actions.length" class="mt-2 text-sm text-ink-500">{{ t('app.saveTheDate.saveFirst') }}</p>
          </div>
          <ol class="flex items-center gap-2 text-xs whitespace-nowrap" :aria-label="t('app.saveTheDate.sequence.label')" data-testid="std-sequence">
            <li class="flex items-center gap-2" :class="notice === 'live' ? 'font-semibold text-ink-900' : 'text-ink-500'" :aria-current="notice === 'live' ? 'step' : undefined">
              <span class="h-2 w-2 rounded-full" :class="notice === 'live' ? 'bg-success-500' : 'bg-ink-300'" aria-hidden="true" />
              {{ t('app.saveTheDate.sequence.saveTheDate') }}
            </li>
            <li aria-hidden="true" class="text-ink-500">→</li>
            <li class="flex items-center gap-2" :class="notice === 'invitation' ? 'font-semibold text-ink-900' : 'text-ink-500'" :aria-current="notice === 'invitation' ? 'step' : undefined">
              <span class="h-2 w-2 rounded-full" :class="notice === 'invitation' ? 'bg-success-500' : 'bg-ink-300'" aria-hidden="true" />
              {{ t('app.saveTheDate.sequence.invitation') }}
            </li>
          </ol>
          <router-link to="/dashboard/invitation" class="text-sm font-semibold whitespace-nowrap text-wine-800 underline-offset-4 hover:underline">
            {{ t('app.saveTheDate.viewInvitation') }}
          </router-link>
        </section>

        <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_270px]">
          <UiCard :title="t('app.saveTheDate.settingsTitle')" heading-level="h2">
            <template #actions>
              <UiButton class="lg:hidden" variant="secondary" size="sm" data-testid="std-preview-open" @click="previewOpen = true">
                <Eye class="h-4 w-4" aria-hidden="true" />
                {{ t('app.saveTheDate.preview.open') }}
              </UiButton>
            </template>
            <form class="space-y-5" novalidate @submit.prevent="save">
              <UiField :label="t('app.saveTheDate.message')" :hint="t('app.saveTheDate.messageHint')">
                <UiTextarea v-model="form.message" :rows="3" class="min-h-24" :maxlength="MESSAGE_MAX" :placeholder="t('app.saveTheDate.messagePlaceholder')" :disabled="!canEdit" />
              </UiField>
              <UiSwitch
                v-model="form.showCountdown"
                class="min-h-[48px]"
                :disabled="!canEdit"
                :label="t('app.saveTheDate.countdown')"
                :description="t('app.saveTheDate.countdownHint')"
              />
              <UiSwitch
                v-model="form.useAddToCalendar"
                class="min-h-[48px]"
                :disabled="!canEdit"
                :label="t('app.saveTheDate.calendar')"
                :description="t('app.saveTheDate.calendarHint')"
              />
              <div v-if="canEdit">
                <p v-if="!dirty" class="flex items-center gap-1.5 text-sm text-ink-500" data-testid="std-all-saved">
                  <Check class="h-4 w-4 text-success-500" aria-hidden="true" />
                  {{ t('app.saveTheDate.allSaved') }}
                </p>
                <UiButton v-else class="max-md:hidden" type="submit" :loading="saving">{{ t('app.saveTheDate.save') }}</UiButton>
              </div>
            </form>
          </UiCard>

          <aside class="sticky top-[88px] hidden pb-20 lg:block" :aria-label="t('app.saveTheDate.preview.title')">
            <p class="mb-2.5 text-center text-xs font-semibold tracking-[.06em] text-ink-500 uppercase">{{ t('app.saveTheDate.preview.title') }}</p>
            <SaveTheDatePreview
              :event-name="event.eventName ?? ''"
              :date-label="dateLabel"
              :target="target"
              :message="form.message"
              :show-countdown="form.showCountdown"
              :show-calendar="form.useAddToCalendar"
              :inactive="notice === 'invitation'"
            />
            <p class="mt-2.5 text-center text-xs text-ink-500">{{ t('app.saveTheDate.preview.live') }}</p>
          </aside>
        </div>
      </div>

    </div>

    <UiBottomSheet v-model:open="previewOpen" :title="t('app.saveTheDate.preview.title')" :subtitle="t('app.saveTheDate.preview.live')">
      <SaveTheDatePreview
        :event-name="event?.eventName ?? ''"
        :date-label="dateLabel"
        :target="target"
        :message="form.message"
        :show-countdown="form.showCountdown"
        :show-calendar="form.useAddToCalendar"
        :inactive="notice === 'invitation'"
        :scale="sheetScale"
      />
    </UiBottomSheet>

    <!-- Phones with unsaved changes: the save button stays in reach above the bottom navigation; the assistant's icon sits on its right. -->
    <div
      v-if="canEdit && dirty && !loading"
      ref="saveBar"
      class="fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] left-4 right-[4.5rem] z-20 flex items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-3 shadow-card md:hidden"
      data-testid="std-save-bar"
    >
      <span class="min-w-0 text-sm leading-tight text-ink-700">{{ t('app.saveTheDate.unsaved') }}</span>
      <UiButton size="sm" :loading="saving" @click="save">{{ t('app.saveTheDate.saveShort') }}</UiButton>
    </div>

    <UiModal
      :open="!!confirming"
      :title="confirming ? t(`app.saveTheDate.confirm.${confirming}.title`) : ''"
      :description="confirming ? t(`app.saveTheDate.confirm.${confirming}.text`) : ''"
      size="sm"
      @update:open="confirming = null"
    >
      <template #footer>
        <UiButton variant="ghost" @click="confirming = null">{{ t('app.saveTheDate.cancel') }}</UiButton>
        <UiButton :loading="acting" :variant="confirming === 'unpublish' ? 'danger' : 'primary'" @click="run(confirming)">
          {{ confirming ? t(`app.saveTheDate.actions.${confirming}`) : '' }}
        </UiButton>
      </template>
    </UiModal>
  </UiPage>
</template>
