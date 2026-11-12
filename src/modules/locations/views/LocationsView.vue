<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Pencil, Trash2, Plus, MapPin, Church, GlassWater } from 'lucide-vue-next'
import { UiPageHeader, UiCard, UiButton, UiBadge, UiSkeleton, UiEmptyState, UiModal, useToast } from '@/ui'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { useLocationsStore } from '../stores/useLocationsStore'
import LocationsService from '../services/LocationsService'
import LocationForm from '../components/LocationForm.vue'
import { toPayload } from '../utils/locationForm'

const { t } = useI18n()
const { success, error: showError } = useToast()
const eventsStore = useEventsStore()
const store = useLocationsStore()

const event = computed(() => eventsStore.activeEvent)
const canEdit = computed(() => ['owner', 'editor'].includes(event.value?.userRole))
const icons = { ceremony: Church, reception: GlassWater, other: MapPin }

const loading = ref(true)
const saving = ref(false)
const formOpen = ref(false)
const editing = ref(null)
const removing = ref(null)

async function load() {
  if (!event.value?.id) return
  loading.value = true
  try {
    await store.fetch(event.value.id)
  } catch {
    showError(t('app.locations.loadError'))
  } finally {
    loading.value = false
  }
}
onMounted(load)
watch(() => event.value?.id, load)

function openForm(location = null) {
  editing.value = location
  formOpen.value = true
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

const line = place => [place.address, [place.city, place.state].filter(Boolean).join(', '), place.zipCode].filter(Boolean).join(' · ')
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <UiPageHeader :title="t('app.locations.title')" :subtitle="t('app.locations.subtitle')" />

    <div v-if="loading" class="mt-6 space-y-3">
      <UiSkeleton class="h-28" />
      <UiSkeleton class="h-28" />
    </div>

    <UiCard v-else-if="!store.locations.length" class="mt-6">
      <UiEmptyState :title="t('app.locations.emptyTitle')" :description="t('app.locations.emptyText')">
        <UiButton v-if="canEdit" @click="openForm()">{{ t('app.locations.add') }}</UiButton>
      </UiEmptyState>
    </UiCard>

    <template v-else>
      <ul class="mt-6 space-y-3">
        <li v-for="place in store.locations" :key="place.id">
          <UiCard padding="sm">
            <div class="flex items-start gap-3">
              <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <component :is="icons[place.type] ?? MapPin" class="h-5 w-5" aria-hidden="true" />
              </span>
              <div class="min-w-0 flex-1">
                <UiBadge>{{ t(`app.locations.types.${place.type}`) }}</UiBadge>
                <h2 class="mt-1 font-heading text-lg text-ink-900">{{ place.name }}</h2>
                <p class="text-sm text-ink-700">{{ line(place) }}</p>
                <p v-if="place.directions" class="mt-1 text-sm text-ink-500">{{ place.directions }}</p>
                <ul v-if="place.images.length" class="mt-3 flex gap-2 overflow-hidden">
                  <li v-for="image in place.images.slice(0, 4)" :key="image.id" class="h-14 w-20 shrink-0 overflow-hidden rounded-md bg-cream-100">
                    <img :src="image.path" alt="" class="h-full w-full object-cover" loading="lazy" />
                  </li>
                </ul>
              </div>
              <div v-if="canEdit" class="flex shrink-0 gap-1">
                <UiButton variant="ghost" size="sm" icon :aria-label="t('app.locations.edit')" @click="openForm(place)">
                  <Pencil class="h-4 w-4" aria-hidden="true" />
                </UiButton>
                <UiButton variant="ghost" size="sm" icon :aria-label="t('app.locations.remove')" @click="removing = place">
                  <Trash2 class="h-4 w-4" aria-hidden="true" />
                </UiButton>
              </div>
            </div>
          </UiCard>
        </li>
      </ul>
      <div v-if="canEdit" class="mt-5">
        <UiButton variant="secondary" @click="openForm()">
          <Plus class="h-4 w-4" aria-hidden="true" />
          {{ t('app.locations.add') }}
        </UiButton>
      </div>
      <p class="mt-4 text-sm text-ink-500">{{ t('app.locations.timesNote') }}</p>
    </template>

    <LocationForm v-model:open="formOpen" :event-id="event?.id ?? 0" :location="editing" :saving="saving" @save="save" />

    <UiModal :open="!!removing" :title="t('app.locations.removeTitle')" size="sm" @update:open="removing = null">
      <p class="text-ink-700">{{ t('app.locations.removeBody', { name: removing?.name ?? '' }) }}</p>
      <template #footer>
        <UiButton variant="ghost" @click="removing = null">{{ t('app.locations.cancel') }}</UiButton>
        <UiButton variant="danger" :loading="saving" @click="confirmRemove">{{ t('app.locations.remove') }}</UiButton>
      </template>
    </UiModal>
  </div>
</template>
