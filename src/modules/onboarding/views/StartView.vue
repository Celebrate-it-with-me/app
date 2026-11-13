<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Check, ArrowRight, FileSpreadsheet, UserPlus } from 'lucide-vue-next'
import { UiPageHeader, UiCard, UiButton, UiBadge, UiSkeleton, useToast } from '@/ui'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { useUserStore } from '@/stores/useUserStore'
import GuestImportModal from '@/modules/roster/components/GuestImportModal.vue'
import OnboardingService from '../services/OnboardingService'
import { DETAIL_LINKS, emptyProgress, firstName, normalizeProgress, shareState, stepCards } from '../utils/steps'

const { t } = useI18n()
const { error: showError } = useToast()
const eventsStore = useEventsStore()
const userStore = useUserStore()

const event = computed(() => eventsStore.activeEvent)
const progress = ref(emptyProgress())
const loading = ref(true)
const importing = ref(false)

const name = computed(() => firstName(userStore.name))
const heading = computed(() => (name.value ? t('app.start.welcome', { name: name.value }) : t('app.start.welcomeNoName')))
const cards = computed(() => stepCards(progress.value))
const percent = computed(() => Math.round((progress.value.done / progress.value.total) * 100))
const live = computed(() => shareState(progress.value))
const editTarget = computed(() => (event.value ? { name: 'edit-event', params: { id: event.value.id } } : null))

let loadId = 0
async function load() {
  const current = event.value
  if (!current?.id) return
  const id = ++loadId
  loading.value = true
  try {
    const data = await OnboardingService.progress(current.id)
    if (id === loadId) progress.value = normalizeProgress(data)
  } catch {
    if (id === loadId) showError(t('app.start.loadError'))
  } finally {
    if (id === loadId) loading.value = false
  }
}

async function onImported() {
  await load()
  eventsStore.fetchEvent(event.value.id).catch(() => {})
}

watch(() => event.value?.id, load)
onMounted(load)
</script>

<template>
  <div v-if="event" class="mx-auto max-w-3xl">
    <UiPageHeader :title="heading" :subtitle="t('app.start.subtitle', { event: event.eventName })" />

    <section class="mt-5 rounded-2xl border border-line bg-white p-4 sm:p-5" :aria-label="t('app.start.progressLabel')">
      <UiSkeleton v-if="loading && progress.done === 1" class="h-12" />
      <template v-else>
        <p class="font-heading text-xl text-ink-900">{{ t('app.start.progress', { done: progress.done, total: progress.total }) }}</p>
        <div class="mt-3 h-2 overflow-hidden rounded-full bg-cream-100" role="progressbar" :aria-valuenow="percent" aria-valuemin="0" aria-valuemax="100" :aria-label="t('app.start.progressLabel')">
          <div class="h-full origin-left rounded-full bg-rose-600 transition-transform duration-500 ease-out" :style="{ transform: `scaleX(${percent / 100})` }" />
        </div>
      </template>
    </section>

    <ol class="mt-5 space-y-3" :aria-busy="loading">
      <li v-for="(card, index) in cards" :key="card.id">
        <UiCard :aria-labelledby="`step-${card.id}`">
          <div class="flex items-start gap-3 sm:gap-4">
            <span
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold"
              :class="card.done ? 'border-success-600 bg-success-50 text-success-700' : 'border-line-strong bg-cream-50 text-ink-700'"
              aria-hidden="true"
            >
              <Check v-if="card.done" class="h-4 w-4" stroke-width="3" />
              <template v-else>{{ index + 1 }}</template>
            </span>

            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <h2 :id="`step-${card.id}`" class="font-heading text-xl text-ink-900">{{ t(`app.start.steps.${card.id}.title`) }}</h2>
                <UiBadge :tone="card.done ? 'success' : 'neutral'" size="sm">{{ t(card.done ? 'app.start.done' : 'app.start.pending') }}</UiBadge>
              </div>

              <!-- 1. Your event -->
              <p v-if="card.id === 'event'" class="mt-1 text-base text-ink-700">{{ t('app.start.steps.event.text', { event: event.eventName }) }}</p>

              <!-- 2. Guests -->
              <template v-else-if="card.id === 'guests'">
                <p class="mt-1 text-base text-ink-700">{{ t('app.start.steps.guests.text') }}</p>
                <p v-if="progress.guests > 0" class="mt-1 text-sm font-medium text-success-700">{{ t('app.start.steps.guests.count', { n: progress.guests }, progress.guests) }}</p>
                <div class="mt-4 flex flex-col gap-2 sm:flex-row">
                  <UiButton :variant="progress.guests > 0 ? 'secondary' : 'primary'" @click="importing = true">
                    <FileSpreadsheet class="h-4 w-4" aria-hidden="true" />
                    {{ t('app.start.steps.guests.import') }}
                  </UiButton>
                  <UiButton variant="secondary" to="/dashboard/guests">
                    <UserPlus class="h-4 w-4" aria-hidden="true" />
                    {{ t(progress.guests > 0 ? 'app.start.steps.guests.see' : 'app.start.steps.guests.add') }}
                  </UiButton>
                </div>
              </template>

              <!-- 3. Details -->
              <template v-else-if="card.id === 'details'">
                <p class="mt-1 text-base text-ink-700">{{ t('app.start.steps.details.text') }}</p>
                <ul class="mt-3 grid gap-2 sm:grid-cols-3">
                  <li v-for="link in DETAIL_LINKS" :key="link.key">
                    <router-link
                      :to="link.to"
                      class="flex min-h-11 items-center justify-between gap-2 rounded-xl border border-line bg-white px-3 py-2 text-base font-medium text-ink-900 hover:border-rose-400 focus-visible:outline-2 focus-visible:outline-rose-600"
                    >
                      <span>{{ t(`app.start.steps.details.${link.key}`) }}</span>
                      <span v-if="progress.details[link.key]" class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success-50 text-success-700">
                        <Check class="h-3.5 w-3.5" stroke-width="3" aria-hidden="true" />
                        <span class="sr-only">{{ t('app.start.done') }}</span>
                      </span>
                      <ArrowRight v-else class="h-4 w-4 shrink-0 text-ink-500" aria-hidden="true" />
                    </router-link>
                  </li>
                </ul>
              </template>

              <!-- 4. Share -->
              <template v-else>
                <p class="mt-1 text-base text-ink-700">{{ t('app.start.steps.share.text') }}</p>
                <ul class="mt-2 space-y-1 text-base text-ink-700">
                  <li>{{ t('app.start.steps.share.saveTheDate') }}</li>
                  <li>{{ t('app.start.steps.share.invitation') }}</li>
                </ul>
                <p v-if="live !== 'none'" class="mt-3 text-sm font-medium text-success-700">
                  {{ t(live === 'saveTheDate' ? 'app.start.steps.share.liveSaveTheDate' : 'app.start.steps.share.liveInvitation') }}
                  <span class="font-normal text-ink-700">{{ t('app.start.steps.share.sendLinks') }}</span>
                </p>
                <div class="mt-4 flex flex-col gap-2 sm:flex-row">
                  <UiButton v-if="live === 'none'" variant="secondary" to="/dashboard/save-the-date">{{ t('app.start.steps.share.publishSaveTheDate') }}</UiButton>
                  <UiButton v-if="live !== 'invitation' && editTarget" variant="secondary" :to="editTarget">{{ t('app.start.steps.share.publishInvitation') }}</UiButton>
                  <UiButton v-if="live !== 'none'" to="/dashboard/guests">{{ t('app.start.steps.share.goGuests') }}</UiButton>
                </div>
              </template>
            </div>
          </div>
        </UiCard>
      </li>
    </ol>

    <div class="mt-6 flex flex-col items-start gap-2 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
      <p class="text-sm text-ink-500">{{ t('app.start.skipHint') }}</p>
      <UiButton variant="secondary" to="/dashboard" class="w-full sm:w-auto">
        {{ t('app.start.skip') }}
        <ArrowRight class="h-4 w-4" aria-hidden="true" />
      </UiButton>
    </div>

    <GuestImportModal v-model:open="importing" :event-id="event.id" @imported="onImported" />
  </div>
</template>
