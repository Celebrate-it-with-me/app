<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { CalendarPlus, Link as LinkIcon } from 'lucide-vue-next'
import { UiPageHeader, UiCard, UiField, UiTextarea, UiSwitch, UiButton, UiBadge, UiSkeleton, UiModal, useToast } from '@/ui'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { planLimitFrom } from '@/utils/planLimit'
import GuestLimitNotice from '@/components/internal/limits/GuestLimitNotice.vue'
import SaveTheDateService from '../services/SaveTheDateService'
import { MESSAGE_MAX, emptySettings, settingsFromApi, settingsPayload, stageView } from '../utils/stage'

const { t } = useI18n()
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

const dirty = computed(() => JSON.stringify(settingsPayload(form.value)) !== JSON.stringify(settingsPayload(saved.value)))
const startDate = computed(() => event.value?.startDate?.split(' ')[0] ?? '')

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
  <div class="mx-auto max-w-5xl">
    <UiPageHeader :title="t('app.saveTheDate.title')" :subtitle="t('app.saveTheDate.subtitle')" />

    <div v-if="loading" class="mt-6 space-y-4">
      <UiSkeleton class="h-32" />
      <UiSkeleton class="h-56" />
    </div>

    <div v-else-if="event" class="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div class="space-y-6">
        <UiCard :title="t('app.saveTheDate.stateTitle')" heading-level="h2">
          <template #actions>
            <UiBadge :tone="view.key === 'live' ? 'success' : view.key === 'invitation' ? 'info' : 'neutral'" dot>
              {{ t(`app.saveTheDate.state.${view.key}.badge`) }}
            </UiBadge>
          </template>
          <p class="text-base text-ink-700">{{ t(`app.saveTheDate.state.${view.key}.text`) }}</p>
          <GuestLimitNotice v-if="limitInfo" class="mt-4" :info="limitInfo" variant="publish" with-list-link />
          <div v-if="canEdit && view.actions.length" class="mt-4 flex flex-col gap-2 sm:flex-row">
            <UiButton
              v-for="(action, index) in view.actions"
              :key="action"
              :variant="index === 0 ? 'primary' : 'secondary'"
              :disabled="dirty && action !== 'unpublish'"
              @click="ask(action)"
            >
              {{ t(`app.saveTheDate.actions.${action}`) }}
            </UiButton>
          </div>
          <p v-if="dirty && view.actions.length" class="mt-2 text-sm text-ink-500">{{ t('app.saveTheDate.saveFirst') }}</p>
          <p v-if="view.key === 'live'" class="mt-4 flex items-start gap-2 text-sm text-ink-500">
            <LinkIcon class="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {{ t('app.saveTheDate.sameLink') }}
          </p>
        </UiCard>

        <UiCard :title="t('app.saveTheDate.settingsTitle')" heading-level="h2">
          <form class="space-y-5" novalidate @submit.prevent="save">
            <UiField :label="t('app.saveTheDate.message')" :hint="t('app.saveTheDate.messageHint')">
              <UiTextarea v-model="form.message" :rows="4" :maxlength="MESSAGE_MAX" :disabled="!canEdit" />
            </UiField>
            <UiSwitch v-model="form.showCountdown" :disabled="!canEdit" :label="t('app.saveTheDate.countdown')" :description="t('app.saveTheDate.countdownHint')" />
            <UiSwitch v-model="form.useAddToCalendar" :disabled="!canEdit" :label="t('app.saveTheDate.calendar')" :description="t('app.saveTheDate.calendarHint')" />
            <UiButton v-if="canEdit" type="submit" :loading="saving" :disabled="!dirty">{{ t('app.saveTheDate.save') }}</UiButton>
          </form>
        </UiCard>
      </div>

      <aside class="lg:sticky lg:top-6 lg:self-start" :aria-label="t('app.saveTheDate.previewTitle')">
        <UiCard :title="t('app.saveTheDate.previewTitle')" :subtitle="t('app.saveTheDate.previewSubtitle')" heading-level="h2">
          <div class="text-center">
            <p class="text-sm text-ink-500">{{ t('app.saveTheDate.previewKicker') }}</p>
            <p class="mt-1 font-heading text-2xl text-ink-900">{{ event?.eventName }}</p>
            <p v-if="startDate" class="mt-1 text-sm text-ink-700">{{ startDate }}</p>
            <ul v-if="form.showCountdown" class="mt-4 grid grid-cols-4 gap-2" aria-hidden="true">
              <li v-for="unit in ['days', 'hours', 'minutes', 'seconds']" :key="unit" class="rounded-lg bg-cream-100 py-2">
                <span class="block font-heading text-lg text-ink-900">00</span>
                <span class="block text-[11px] text-ink-500">{{ t(`app.saveTheDate.units.${unit}`) }}</span>
              </li>
            </ul>
            <p v-if="form.message.trim()" class="mt-4 text-sm text-ink-700">{{ form.message }}</p>
            <p v-if="form.useAddToCalendar" class="mt-4 inline-flex items-center gap-2 rounded-full border border-line-strong px-3 py-1.5 text-sm text-ink-700">
              <CalendarPlus class="h-4 w-4" aria-hidden="true" />
              {{ t('app.saveTheDate.previewCalendar') }}
            </p>
          </div>
        </UiCard>
      </aside>
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
  </div>
</template>
