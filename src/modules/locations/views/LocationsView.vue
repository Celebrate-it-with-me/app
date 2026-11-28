<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Plus } from 'lucide-vue-next'
import { UiPageHeader, UiButton, UiSkeleton, UiModal, useToast, UiPage } from '@/ui'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { useTimelineStore } from '@/modules/timeline/stores/timelineStore'
import { useLocationsStore } from '../stores/useLocationsStore'
import LocationsService from '../services/LocationsService'
import LocationForm from '../components/LocationForm.vue'
import LocationCard from '../components/LocationCard.vue'
import LocationEmpty from '../components/LocationEmpty.vue'
import { formFromLocation, toPayload } from '../utils/locationForm'
import { groupPlaces, momentOfType, scheduleOf } from '../utils/placeCard'
import { rangeLabel } from '@/modules/timeline/utils/timeMath'

const { t, locale } = useI18n()
const { success, error: showError } = useToast()
const eventsStore = useEventsStore()
const store = useLocationsStore()
const timeline = useTimelineStore()

const event = computed(() => eventsStore.activeEvent)
const canEdit = computed(() => ['owner', 'editor'].includes(event.value?.userRole))

const loading = ref(true)
const saving = ref(false)
const formOpen = ref(false)
const editing = ref(null)
const newType = ref('ceremony')
const removing = ref(null)

async function load() {
  if (!event.value?.id) return
  loading.value = true
  try {
    // The program only adds the hours: if it fails to load, the places still show.
    await Promise.all([store.fetch(event.value.id), timeline.fetchTimelines(event.value.id).catch(() => {})])
  } catch {
    showError(t('app.locations.loadError'))
  } finally {
    loading.value = false
  }
}
onMounted(load)
watch(() => event.value?.id, load)

function openForm(location = null, type = 'ceremony') {
  editing.value = location
  newType.value = type
  formOpen.value = true
}

const groups = computed(() => groupPlaces(store.locations))
const scheduleFor = place => scheduleOf(place, timeline.timelines, locale.value)

/** What a section without places says, from the program: a moment of that kind with no place, or a plain invitation to add one. */
function emptyFor(type) {
  const moment = momentOfType(timeline.timelines, type)
  if (moment) {
    return {
      title: t('app.locations.emptyWhere', { moment: moment.title.toLowerCase() }),
      text: t('app.locations.emptyWhereText', { time: rangeLabel(moment, locale.value).start })
    }
  }
  // An event without a ceremony is not an error: the section stays quiet.
  if (type === 'ceremony') return { title: t('app.locations.neutralTitle'), text: t('app.locations.neutralText') }
  return { title: t('app.locations.emptyAddTitle', { kind: t(`app.locations.kinds.${type}`) }), text: t('app.locations.emptyAddText') }
}

// Offered on the first "other place" while the reception has no place.
const suggestedId = computed(() => (groups.value.reception.length ? null : (groups.value.other[0]?.id ?? null)))

async function retypeToReception(place) {
  saving.value = true
  try {
    await LocationsService.update(event.value.id, place.id, toPayload({ ...formFromLocation(place), type: 'reception' }))
    await store.fetch(event.value.id)
    success(t('app.locations.saved'))
  } catch {
    showError(t('app.locations.saveError'))
  } finally {
    saving.value = false
  }
}

async function save({ form, files, googlePhotos, removedImageIds }) {
  saving.value = true
  const eventId = event.value.id
  try {
    const place = editing.value
      ? await LocationsService.update(eventId, editing.value.id, toPayload(form))
      : await LocationsService.create(eventId, toPayload(form))
    for (const id of removedImageIds) await LocationsService.removeImage(eventId, place.id, id)
    if (files.length || googlePhotos.length) await LocationsService.addImages(eventId, place.id, { files, googlePhotos })
    await store.fetch(eventId)
    formOpen.value = false
    success(t('app.locations.saved'))
  } catch (e) {
    showError(e.response?.data?.errors?.images?.[0] ?? t('app.locations.saveError'))
  } finally {
    saving.value = false
  }
}

async function confirmRemove() {
  saving.value = true
  try {
    await store.remove(event.value.id, removing.value.id)
    removing.value = null
  } catch {
    showError(t('app.locations.saveError'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UiPage>
    <UiPageHeader :title="t('app.locations.title')" :subtitle="t('app.locations.subtitle')" />

    <div v-if="loading" class="mt-6 flex max-w-[860px] flex-col gap-3">
      <UiSkeleton class="h-36" />
      <UiSkeleton class="h-36" />
    </div>

    <div v-else class="mt-6 flex max-w-[860px] flex-col gap-5" data-testid="locations-sections">
      <section v-for="type in ['ceremony', 'reception']" :key="type" :data-testid="`section-${type}`">
        <h2 class="mb-2 font-body text-[11px] font-semibold uppercase tracking-[.06em] text-ink-500">{{ t(`app.locations.types.${type}`) }}</h2>
        <ul v-if="groups[type].length" class="flex flex-col gap-3">
          <li v-for="place in groups[type]" :key="place.id">
            <LocationCard :place="place" :schedule="scheduleFor(place)" :can-edit="canEdit" @edit="openForm($event)" @remove="removing = $event" />
          </li>
        </ul>
        <LocationEmpty v-else v-bind="emptyFor(type)" :action="t('app.locations.addPlace')" :can-edit="canEdit" @add="openForm(null, type)" />
      </section>

      <section data-testid="section-other">
        <h2 class="mb-2 font-body text-[11px] font-semibold uppercase tracking-[.06em] text-ink-500">
          {{ t('app.locations.otherTitle') }}
          <span class="font-normal normal-case tracking-normal text-ink-500">{{ t('app.locations.otherHint') }}</span>
        </h2>
        <ul v-if="groups.other.length" class="flex flex-col gap-3">
          <li v-for="place in groups.other" :key="place.id">
            <LocationCard :place="place" :can-edit="canEdit" :suggest-reception="place.id === suggestedId" @edit="openForm($event)" @remove="removing = $event" @retype="retypeToReception" />
          </li>
        </ul>
        <div v-if="canEdit" :class="groups.other.length ? 'mt-3' : ''">
          <UiButton variant="secondary" data-testid="add-other" @click="openForm(null, 'other')">
            <Plus class="h-4 w-4" aria-hidden="true" />
            {{ t('app.locations.add') }}
          </UiButton>
        </div>
      </section>
    </div>

    <LocationForm v-model:open="formOpen" :event-id="event?.id ?? 0" :location="editing" :default-type="newType" :saving="saving" @save="save" />

    <UiModal :open="!!removing" :title="t('app.locations.removeTitle')" size="sm" @update:open="removing = null">
      <p class="text-ink-700">{{ t('app.locations.removeBody', { name: removing?.name ?? '' }) }}</p>
      <template #footer>
        <UiButton variant="ghost" @click="removing = null">{{ t('app.locations.cancel') }}</UiButton>
        <UiButton variant="danger" :loading="saving" @click="confirmRemove">{{ t('app.locations.remove') }}</UiButton>
      </template>
    </UiModal>
  </UiPage>
</template>
