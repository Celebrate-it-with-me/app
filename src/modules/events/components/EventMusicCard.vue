<script setup>
/**
 * Background music of the invitation, in the event settings: upload, replace, listen and delete the one file.
 * Sound only starts from the "listen" tap (no autoplay). Locked on the free plan; read only for a viewer;
 * disabled in a support session (the API blocks it too).
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Lock, Music, Pause, Play, Trash2, Upload } from 'lucide-vue-next'
import { UiButton, UiCard, UiField, UiInput, UiModal, UiSkeleton, useToast } from '@/ui'
import { isModuleLocked } from '@/utils/moduleLocked'
import { useImpersonationStore } from '@/modules/impersonation/stores/useImpersonationStore'
import BackgroundMusicService from '../services/BackgroundMusicService'
import { MUSIC_ACCEPT, formatBytes, musicErrorCodes, validateMusicFile } from '../utils/backgroundMusic'

const props = defineProps({
  eventId: { type: [String, Number], required: true },
  /** The plan does not include the module (from the event's modules). The API's 403 also sets it. */
  locked: { type: Boolean, default: false },
  /** A viewer reads and listens, nothing else. */
  readOnly: { type: Boolean, default: false }
})

const { t } = useI18n()
const { success, error: showError } = useToast()
const impersonation = useImpersonationStore()

const song = ref(null)
const loading = ref(true)
const loadFailed = ref(false)
const busy = ref(false)
const lockedByApi = ref(false)
const title = ref('')
const titleError = ref('')
const fileError = ref('')
const confirmOpen = ref(false)
const input = ref(null)

const isLocked = computed(() => props.locked || lockedByApi.value)
const frozen = computed(() => impersonation.active)
const canChange = computed(() => !props.readOnly && !isLocked.value && !frozen.value)
const displayTitle = computed(() => song.value?.title || t('events.music.untitled'))

async function load() {
  loading.value = true
  loadFailed.value = false
  try {
    song.value = await BackgroundMusicService.get(props.eventId)
  } catch {
    loadFailed.value = true
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(() => props.eventId, load)

// ── Listening ───────────────────────────────────────────────
const playing = ref(false)
const playFailed = ref(false)
let audio = null

function dropAudio() {
  if (!audio) return
  audio.pause()
  audio.removeAttribute('src')
  audio = null
  playing.value = false
}

/** Called straight from the tap: browsers only allow sound after a gesture. */
async function togglePlay() {
  if (!song.value?.songUrl) return
  playFailed.value = false
  if (!audio) {
    audio = new Audio()
    audio.preload = 'none'
    audio.addEventListener('play', () => (playing.value = true))
    audio.addEventListener('pause', () => (playing.value = false))
    audio.addEventListener('ended', () => (playing.value = false))
    audio.addEventListener('error', () => {
      playing.value = false
      playFailed.value = true
    })
    audio.src = song.value.songUrl
  }
  if (!audio.paused) {
    audio.pause()
    return
  }
  try {
    await audio.play()
  } catch {
    playing.value = false
    playFailed.value = true
  }
}

watch(() => song.value?.songUrl, dropAudio)
onBeforeUnmount(dropAudio)

// ── Upload / replace ────────────────────────────────────────
function pick() {
  fileError.value = ''
  input.value?.click()
}

async function onFile(event) {
  const file = event.target.files?.[0]
  event.target.value = '' // the same file can be chosen again after an error
  if (!file) return
  fileError.value = ''
  titleError.value = ''
  const code = validateMusicFile(file)
  if (code) {
    fileError.value = t(`events.music.errors.${code}`)
    return
  }
  busy.value = true
  const replacing = !!song.value
  try {
    song.value = await BackgroundMusicService.upload(props.eventId, file, title.value)
    title.value = ''
    success(t(replacing ? 'events.music.replaced' : 'events.music.uploaded'))
  } catch (e) {
    handleError(e)
  } finally {
    busy.value = false
  }
}

function handleError(e) {
  if (isModuleLocked(e)) {
    lockedByApi.value = true // the interceptor already told her; the card shows the unlock button
    return
  }
  const status = e?.response?.status
  if (status === 422) {
    const codes = musicErrorCodes(e)
    if (codes.songFile) fileError.value = t(`events.music.errors.${codes.songFile}`)
    if (codes.title) titleError.value = t(`events.music.errors.title_${codes.title}`)
    if (!codes.songFile && !codes.title) showError(t('common.genericError'))
    return
  }
  if (status === 429) return showError(t('events.music.errors.tooMany'))
  if (status === 403) return showError(t('events.edit.forbidden'))
  showError(t('common.genericError'))
}

// ── Delete ──────────────────────────────────────────────────
async function confirmRemove() {
  busy.value = true
  try {
    await BackgroundMusicService.remove(props.eventId)
    song.value = null
    confirmOpen.value = false
    success(t('events.music.removed'))
  } catch (e) {
    if (e?.response?.status === 404) {
      song.value = null // already gone
      confirmOpen.value = false
    } else {
      confirmOpen.value = false
      handleError(e)
    }
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <UiCard :title="t('events.music.title')" :subtitle="t('events.music.subtitle')" heading-level="h2" data-test="music-card">
    <div v-if="loading" class="flex flex-col gap-3" aria-busy="true">
      <UiSkeleton height="1.25rem" width="50%" />
      <UiSkeleton height="2.75rem" />
    </div>

    <!-- Free plan: the card is visible but nothing can be uploaded. -->
    <div v-else-if="isLocked" class="flex flex-col gap-3 rounded-xl border border-gold-300 bg-gold-50 p-4" data-test="music-locked">
      <div class="flex items-start gap-3">
        <Lock class="mt-0.5 h-5 w-5 shrink-0 text-gold-700" aria-hidden="true" />
        <p class="text-base text-ink-700">{{ t('events.music.locked') }}</p>
      </div>
      <UiButton to="/dashboard/unlock/background_music" size="sm" class="w-full sm:w-auto sm:self-start">{{ t('events.music.unlock') }}</UiButton>
    </div>

    <div v-else-if="loadFailed" class="flex flex-col gap-3">
      <p class="text-base text-ink-600" role="alert">{{ t('events.music.loadError') }}</p>
      <UiButton variant="secondary" size="sm" class="w-full sm:w-auto sm:self-start" @click="load">{{ t('events.music.retry') }}</UiButton>
    </div>

    <div v-else class="flex flex-col gap-4">
      <p v-if="frozen" class="text-sm text-ink-500" role="status">{{ t('events.music.supportSession') }}</p>

      <div v-if="song" class="flex items-center gap-3 rounded-xl border border-line bg-cream-50 p-3" data-test="music-current">
        <button
          type="button"
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-600 text-white transition-[opacity,scale] duration-150 ease-out hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 active:scale-[0.97]"
          :aria-label="`${t(playing ? 'events.music.pause' : 'events.music.play')}: ${displayTitle}`"
          :aria-pressed="playing"
          data-test="music-play"
          @click="togglePlay"
        >
          <component :is="playing ? Pause : Play" class="h-5 w-5" aria-hidden="true" />
        </button>
        <div class="min-w-0 flex-1">
          <p class="truncate font-medium text-ink-900">{{ displayTitle }}</p>
          <p class="text-sm text-ink-500">{{ formatBytes(song.sizeBytes) }}</p>
        </div>
      </div>
      <p v-if="playFailed" class="text-sm text-danger-700" role="status">{{ t('events.music.playError') }}</p>

      <div v-if="!song" class="flex items-center gap-3 text-ink-600">
        <Music class="h-5 w-5 shrink-0 text-ink-400" aria-hidden="true" />
        <p class="text-base">{{ t('events.music.empty') }}</p>
      </div>

      <template v-if="canChange">
        <UiField :label="t('events.music.titleLabel')" :hint="t('events.music.titleHint')" :error="titleError" id="music_title">
          <UiInput v-model="title" :maxlength="60" autocomplete="off" :disabled="busy" />
        </UiField>

        <UiField :error="fileError" :hint="t('events.music.help')" id="music_file">
          <template #default="{ id }">
            <input :id="id" ref="input" type="file" class="sr-only" :accept="MUSIC_ACCEPT" :aria-invalid="!!fileError" tabindex="-1" data-test="music-input" @change="onFile" />
          </template>
        </UiField>

        <div class="flex flex-col gap-2 sm:flex-row">
          <UiButton :loading="busy" class="w-full sm:w-auto" data-test="music-pick" @click="pick">
            <Upload class="h-4 w-4" aria-hidden="true" />
            {{ t(song ? 'events.music.replace' : 'events.music.upload') }}
          </UiButton>
          <UiButton v-if="song" variant="ghost" :disabled="busy" class="w-full sm:w-auto" data-test="music-remove" @click="confirmOpen = true">
            <Trash2 class="h-4 w-4" aria-hidden="true" />
            {{ t('events.music.remove') }}
          </UiButton>
        </div>
      </template>
      <p v-else-if="!song" class="sr-only">{{ t('events.music.help') }}</p>
    </div>

    <UiModal v-model:open="confirmOpen" :title="t('events.music.confirmTitle')" :description="t('events.music.confirmText')" size="sm">
      <template #footer>
        <UiButton variant="ghost" :disabled="busy" @click="confirmOpen = false">{{ t('events.publication.confirm.cancel') }}</UiButton>
        <UiButton variant="danger" :loading="busy" data-test="music-confirm-remove" @click="confirmRemove">{{ t('events.music.remove') }}</UiButton>
      </template>
    </UiModal>
  </UiCard>
</template>
