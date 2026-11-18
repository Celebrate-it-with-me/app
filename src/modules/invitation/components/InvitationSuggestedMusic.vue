<script setup>
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { Check, Music2, Pause, Play, Search, ThumbsUp, Trash2 } from 'lucide-vue-next'
import InvitationService from '@/services/PublicEvents/InvitationService'
import { useInvitationContext } from '../composables/useInvitation'
import { safeHttpsUrl } from '../composables/safeUrl'
import { AUDIO_EVENT, announceAudio } from '../composables/audioBus'
import InvitationSection from './InvitationSection.vue'
import InvitationPanel from './InvitationPanel.vue'
import InvitationButton from './InvitationButton.vue'

const props = defineProps({
  section: { type: Object, required: true },
  /** list (default) | cards */
  variant: { type: String, default: 'list' }
})

const { tt, slug, code, preview } = useInvitationContext()

const DEBOUNCE_MS = 400
const MIN_CHARS = 2
const MAX_QUERY = 100
const DEFAULT_MAX = 5

const data = computed(() => props.section.data ?? {})
const title = computed(() => props.section.title || data.value.heading || tt('songs.title'))
const text = computed(() => props.section.text || data.value.subHeading || null)
const canWrite = computed(() => data.value.canWrite !== false && !readOnlyNow.value)
const maxSuggestions = computed(() => Number(data.value.maxSuggestions) || DEFAULT_MAX)
const usePreview = computed(() => data.value.usePreview === true)
const votesOff = ref(false) // flips on a 403 votes_disabled, in case the hydrated flag is stale
const readOnlyNow = ref(false) // flips on a 403 read_only, in case the hydrated flag is stale
const useVotes = computed(() => data.value.useVotes !== false && !votesOff.value)

const fieldId = useId()
const root = ref(null)

// ---- Codes ---------------------------------------------------------------------------------------------------------
const KNOWN = ['limit', 'duplicate', 'required', 'votes_disabled', 'votes_exhausted', 'spotify_unavailable', 'module_locked', 'too_many_attempts', 'read_only']

/** The contract names its errors by code: look for one in `code`, `error`, `message` and in the values of `errors`. */
function codeOf(error) {
  const body = error?.response?.data
  const candidates = [body?.code, body?.error, body?.message]
  for (const value of Object.values(body?.errors ?? {})) candidates.push(...(Array.isArray(value) ? value : [value]))
  return candidates.find(value => typeof value === 'string' && KNOWN.includes(value)) ?? null
}

/**
 * Maps a failed request to an i18n key under `songs.errors`.
 * `scope` says what the request was about: a 404 only means "that song is gone" when it targets a song (vote, remove);
 * on search/suggest it is a generic failure, and a 422 on search is a bad query.
 */
function errorKey(error, scope = 'song') {
  const status = error?.response?.status
  const known = codeOf(error)
  if (status === 429) return 'too_many_attempts'
  if (status === 503) return 'spotify_unavailable'
  if (status === 404) return scope === 'song' ? 'not_found' : 'retry_later'
  if (status === 403) return known === 'votes_disabled' ? 'votes_disabled' : known === 'read_only' ? 'read_only' : 'module_locked'
  if (status === 422 && scope === 'search') return 'invalid_query'
  if (status === 422) return known && ['limit', 'duplicate', 'required', 'votes_exhausted'].includes(known) ? known : 'generic'
  return 'generic'
}

// ---- List (lazy: loads when the section scrolls into view) ---------------------------------------------------------
/** idle | loading | ready | error */
const status = ref('idle')
const items = ref([])
const meta = ref({ currentPage: 0, lastPage: 0, total: 0 })
const orderBy = ref('popular')
const loadingMore = ref(false)
const listError = ref(false)
const notice = ref('') // success or failure of the last action on the list, as an i18n key under songs.*
const noticeTone = ref('error')
const mySuggestions = ref(Number(data.value.mySuggestions) || 0)
const votesRemaining = ref(null) // from the API's meta; null until it says
const busy = ref(new Set()) // song ids with a request in flight

/** Reads the per-guest counters the API puts in `meta` (votes left, optionally suggestions left). */
function readCounters(m) {
  if (!m) return
  const left = m.votesRemaining
  if (left !== null && left !== undefined && Number.isFinite(Number(left))) votesRemaining.value = Math.max(0, Number(left))
  const sLeft = m.suggestionsRemaining
  if (sLeft !== null && sLeft !== undefined && Number.isFinite(Number(sLeft))) mySuggestions.value = Math.max(0, maxSuggestions.value - Number(sLeft))
}

const limitReached = computed(() => mySuggestions.value >= maxSuggestions.value)
const hasMore = computed(() => meta.value.currentPage < meta.value.lastPage)

async function load() {
  if (preview || status.value === 'loading') return
  status.value = 'loading'
  listError.value = false
  try {
    const { data: body } = await InvitationService.listSongs({ slug: slug(), code: code(), orderBy: orderBy.value, page: 1 })
    items.value = body.data ?? []
    meta.value = body.meta ?? { currentPage: 1, lastPage: 1, total: items.value.length }
    readCounters(body.meta)
    status.value = 'ready'
  } catch {
    status.value = 'error'
  }
}

async function more() {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  listError.value = false
  try {
    const { data: body } = await InvitationService.listSongs({ slug: slug(), code: code(), orderBy: orderBy.value, page: meta.value.currentPage + 1 })
    const known = new Set(items.value.map(item => item.id))
    items.value = [...items.value, ...(body.data ?? []).filter(item => !known.has(item.id))]
    meta.value = body.meta ?? meta.value
    readCounters(body.meta)
  } catch {
    listError.value = true
  } finally {
    loadingMore.value = false
  }
}

function setOrder(value) {
  if (orderBy.value === value) return
  orderBy.value = value
  notice.value = ''
  status.value = 'idle'
  load()
}

function say(key, tone = 'error') {
  notice.value = key
  noticeTone.value = tone
}

function replaceItem(next) {
  const index = items.value.findIndex(item => item.id === next.id)
  if (index === -1) items.value = [next, ...items.value]
  else items.value.splice(index, 1, next)
}

function track(id, on) {
  const next = new Set(busy.value)
  if (on) next.add(id)
  else next.delete(id)
  busy.value = next
}

// ---- Search ---------------------------------------------------------------------------------------------------------
const query = ref('')
const searching = ref(false)
const searched = ref(false) // a search finished for the current query
const results = ref([])
const searchError = ref('')
const suggesting = ref(null) // platformId in flight
const suggestedIds = ref(new Set()) // platformIds suggested in this visit
let timer = null
let searchSeq = 0

const trimmed = computed(() => query.value.trim())
const tooShort = computed(() => trimmed.value.length > 0 && [...trimmed.value].length < MIN_CHARS)

/** Spotify's track object (or an already flat one) → what the suggestion endpoint takes. */
function normalize(raw) {
  if (!raw) return null
  const platformId = raw.platformId ?? raw.id
  const title = raw.title ?? raw.name
  if (!platformId || !title) return null
  const artist = raw.artist ?? (raw.artists ?? []).map(a => a.name).join(', ')
  const image = raw.thumbnailUrl ?? raw.album?.images?.[raw.album.images.length - 1]?.url ?? raw.album?.images?.[0]?.url
  const album = typeof raw.album === 'string' ? raw.album : raw.album?.name
  return {
    platformId: String(platformId),
    title: String(title),
    artist: String(artist ?? ''),
    album: album || undefined,
    thumbnailUrl: safeHttpsUrl(image) || undefined,
    previewUrl: safeHttpsUrl(raw.previewUrl ?? raw.preview_url) || undefined
  }
}

function extract(body) {
  const payload = body?.data ?? body
  const list = Array.isArray(payload) ? payload : (payload?.tracks?.items ?? [])
  return list.map(normalize).filter(Boolean)
}

async function runSearch() {
  const q = trimmed.value
  const seq = ++searchSeq
  if ([...q].length < MIN_CHARS) {
    searching.value = false
    searched.value = false
    results.value = []
    searchError.value = ''
    return
  }
  searching.value = true
  searchError.value = ''
  try {
    const { data: body } = await InvitationService.searchSongs({ slug: slug(), code: code(), q, limit: 8 })
    if (seq !== searchSeq) return
    results.value = extract(body)
    searched.value = true
  } catch (error) {
    if (seq !== searchSeq) return
    // The typed text stays: the guest can retry without writing it again.
    results.value = []
    searched.value = false
    searchError.value = errorKey(error, 'search')
  } finally {
    if (seq === searchSeq) searching.value = false
  }
}

watch(query, value => {
  clearTimeout(timer)
  notice.value = ''
  if (preview) return
  if (value.trim() === '') {
    searchSeq++
    searching.value = false
    searched.value = false
    results.value = []
    searchError.value = ''
    return
  }
  searching.value = [...value.trim()].length >= MIN_CHARS
  timer = setTimeout(runSearch, DEBOUNCE_MS)
})

function retrySearch() {
  clearTimeout(timer)
  runSearch()
}

const isSuggested = song => suggestedIds.value.has(song.platformId)
const visibleResults = computed(() => results.value)

async function suggest(song) {
  if (preview || suggesting.value || limitReached.value || isSuggested(song)) return
  suggesting.value = song.platformId
  notice.value = ''
  try {
    const { data: body } = await InvitationService.suggestSong({ slug: slug(), code: code(), song })
    suggestedIds.value = new Set([...suggestedIds.value, song.platformId])
    mySuggestions.value += 1
    readCounters(body?.meta)
    if (body?.data) {
      replaceItem({ ...body.data, suggestedByMe: true })
      meta.value = { ...meta.value, total: (meta.value.total || 0) + 1 }
    }
    if (status.value !== 'ready') status.value = 'ready'
    say('suggested', 'ok')
  } catch (error) {
    const key = errorKey(error, 'suggest')
    if (key === 'duplicate') suggestedIds.value = new Set([...suggestedIds.value, song.platformId])
    if (key === 'read_only') readOnlyNow.value = true
    say(`errors.${key}`)
  } finally {
    suggesting.value = null
  }
}

async function remove(item) {
  if (preview || busy.value.has(item.id)) return
  track(item.id, true)
  notice.value = ''
  try {
    await InvitationService.removeSong({ slug: slug(), code: code(), id: item.id })
    items.value = items.value.filter(entry => entry.id !== item.id)
    meta.value = { ...meta.value, total: Math.max(0, (meta.value.total || 1) - 1) }
    mySuggestions.value = Math.max(0, mySuggestions.value - 1)
    stopPreview(item.id)
    say('removed', 'ok')
  } catch (error) {
    const key = errorKey(error)
    if (key === 'read_only') readOnlyNow.value = true
    if (key === 'not_found') items.value = items.value.filter(entry => entry.id !== item.id)
    say(`errors.${key}`)
  } finally {
    track(item.id, false)
  }
}

async function vote(item) {
  if (preview || busy.value.has(item.id)) return
  track(item.id, true)
  notice.value = ''
  try {
    const { data: body } = await InvitationService.voteSong({ slug: slug(), code: code(), id: item.id, vote: !item.votedByMe })
    if (body?.data) replaceItem(body.data)
    readCounters(body?.meta)
  } catch (error) {
    const key = errorKey(error)
    if (key === 'votes_disabled') votesOff.value = true
    if (key === 'read_only') readOnlyNow.value = true
    if (key === 'votes_exhausted') votesRemaining.value = 0
    say(`errors.${key}`)
  } finally {
    track(item.id, false)
  }
}

// ---- 30 s preview: one player, only on tap, never autoplay ----------------------------------------------------------
const playingId = ref(null)
const previewFailed = ref(null)
let audio = null

function stopPreview(id = null) {
  if (id !== null && playingId.value !== id) return
  audio?.pause()
  playingId.value = null
}

async function togglePreview(key, url) {
  const safe = safeHttpsUrl(url)
  if (!safe || preview) return
  previewFailed.value = null
  if (playingId.value === key) return stopPreview()
  if (!audio) {
    audio = new Audio()
    audio.preload = 'none'
    audio.addEventListener('ended', () => (playingId.value = null))
    audio.addEventListener('pause', () => {
      if (audio.ended || audio.paused) playingId.value = null
    })
    audio.addEventListener('error', () => {
      const failed = playingId.value
      playingId.value = null
      previewFailed.value = failed
    })
  }
  audio.pause()
  audio.src = safe
  playingId.value = key
  announceAudio('suggested-music') // the background music (if any) steps aside
  try {
    await audio.play()
  } catch {
    playingId.value = null
    previewFailed.value = key
  }
}

function onOtherAudio(event) {
  if (event.detail?.source !== 'suggested-music') stopPreview()
}
function onVisibility() {
  if (document.hidden) stopPreview()
}

// ---- Lifecycle ------------------------------------------------------------------------------------------------------
let observer
onMounted(() => {
  window.addEventListener(AUDIO_EVENT, onOtherAudio)
  document.addEventListener('visibilitychange', onVisibility)
  if (preview) return
  if (!('IntersectionObserver' in window) || !root.value) return void load()
  observer = new IntersectionObserver(
    entries => {
      if (!entries.some(entry => entry.isIntersecting)) return
      observer.disconnect()
      load()
    },
    { rootMargin: '200px' }
  )
  observer.observe(root.value)
})
onBeforeUnmount(() => {
  clearTimeout(timer)
  observer?.disconnect()
  window.removeEventListener(AUDIO_EVENT, onOtherAudio)
  document.removeEventListener('visibilitychange', onVisibility)
  if (audio) {
    audio.pause()
    audio.removeAttribute('src')
    audio = null
  }
})

const sampleItems = computed(() =>
  [1, 2, 3].map(n => ({ id: `sample-${n}`, title: tt(`songs.sample.${n}.title`), artist: tt(`songs.sample.${n}.artist`), votes: 12 - n * 3, votedByMe: false, suggestedByMe: false }))
)
const shown = computed(() => (preview ? sampleItems.value : items.value))
const noticeText = computed(() => (notice.value ? tt(`songs.${notice.value}`) : ''))
const votesLeftText = computed(() => {
  const n = votesRemaining.value
  if (n === null || preview || !useVotes.value || !canWrite.value) return ''
  return tt(n === 1 ? 'songs.votesLeftOne' : n === 0 ? 'songs.votesLeftNone' : 'songs.votesLeft', { n })
})
const searchErrorText = computed(() => (searchError.value ? tt(`songs.errors.${searchError.value}`) : ''))
const initial = song => [...(song.title || '?')][0].toUpperCase()
const previewable = song => usePreview.value && !!safeHttpsUrl(song.previewUrl)
</script>

<template>
  <InvitationSection id="suggested-music" :title="title" :text="text" variant="alt">
    <div ref="root" class="inv-songs text-left" :data-variant="variant">
      <!-- Search and suggest -->
      <InvitationPanel v-if="canWrite" class="inv-songs__search">
        <label :for="`${fieldId}-q`" class="block text-sm font-medium text-inv-ink-soft">{{ tt('songs.searchLabel') }}</label>
        <div class="relative mt-1">
          <Search class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-inv-ink-soft" aria-hidden="true" />
          <input
            :id="`${fieldId}-q`"
            v-model="query"
            type="search"
            name="q"
            :maxlength="MAX_QUERY"
            autocomplete="off"
            enterkeyhint="search"
            :disabled="preview"
            :placeholder="tt('songs.searchPlaceholder')"
            :aria-describedby="`${fieldId}-hint`"
            class="inv-songs__input block min-h-12 w-full rounded-full border border-inv-ink/20 bg-inv-surface py-2 pl-12 pr-4 text-base text-inv-ink placeholder:text-inv-ink-soft/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inv-primary disabled:opacity-60"
          />
        </div>
        <p :id="`${fieldId}-hint`" class="mt-2 text-sm text-inv-ink-soft">
          {{ tt('songs.remaining', { n: Math.max(0, maxSuggestions - mySuggestions), max: maxSuggestions }) }}
        </p>
        <p v-if="limitReached" role="status" class="mt-2 rounded-2xl bg-inv-primary/10 px-4 py-3 text-sm text-inv-primary-ink text-pretty" data-testid="songs-limit">
          {{ tt('songs.limitReached', { max: maxSuggestions }) }}
        </p>
        <p v-if="preview" role="note" class="mt-3 text-center text-sm text-inv-ink-soft">{{ tt('previewNotice') }}</p>

        <div v-if="!preview" class="mt-3" aria-live="polite">
          <p v-if="tooShort" class="text-sm text-inv-ink-soft">{{ tt('songs.tooShort', { n: MIN_CHARS }) }}</p>
          <ul v-else-if="searching" class="flex flex-col gap-2" role="status" :aria-label="tt('songs.searching')">
            <li v-for="n in 3" :key="n" class="h-16 animate-pulse rounded-2xl bg-inv-ink/10" />
          </ul>
          <div v-else-if="searchError" class="rounded-2xl bg-inv-surface px-4 py-4 text-center ring-1 ring-inv-ink/10" data-testid="songs-search-error">
            <p role="alert" class="text-danger-700 text-pretty">{{ searchErrorText }}</p>
            <InvitationButton v-if="searchError !== 'module_locked'" variant="outline" class="mt-3" @click="retrySearch">{{ tt('retry') }}</InvitationButton>
          </div>
          <p v-else-if="searched && !visibleResults.length" class="py-2 text-center text-inv-ink-soft text-pretty">{{ tt('songs.noResults') }}</p>
          <ul v-else-if="visibleResults.length" :aria-label="tt('songs.results')" class="flex flex-col gap-2">
            <li
              v-for="song in visibleResults"
              :key="song.platformId"
              class="inv-songs__result flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl bg-inv-surface px-3 py-2.5 ring-1 ring-inv-ink/10"
            >
              <span class="inv-songs__cover flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-inv-primary/10 font-inv-heading text-lg text-inv-primary">
                <img v-if="song.thumbnailUrl" :src="song.thumbnailUrl" alt="" width="48" height="48" loading="lazy" referrerpolicy="no-referrer" class="h-full w-full object-cover" />
                <template v-else>{{ initial(song) }}</template>
              </span>
              <span class="min-w-[9rem] flex-1">
                <span class="block truncate font-medium">{{ song.title }}</span>
                <span class="block truncate text-sm text-inv-ink-soft">{{ song.artist }}</span>
              </span>
              <div class="inv-songs__actions ml-auto flex shrink-0 items-center gap-2">
              <button
                v-if="previewable(song)"
                type="button"
                class="inv-songs__play flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-inv-primary text-inv-primary transition-[background-color,scale] duration-150 ease-out hover:bg-inv-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inv-primary active:scale-[0.97]"
                :aria-label="`${tt(playingId === song.platformId ? 'songs.pausePreview' : 'songs.playPreview')}: ${song.title}`"
                :aria-pressed="playingId === song.platformId"
                @click="togglePreview(song.platformId, song.previewUrl)"
              >
                <component :is="playingId === song.platformId ? Pause : Play" class="h-4 w-4" aria-hidden="true" />
              </button>
              <span v-if="isSuggested(song)" class="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-inv-primary-ink">
                <Check class="h-4 w-4" aria-hidden="true" />{{ tt('songs.suggestedDone') }}
              </span>
              <InvitationButton
                v-else
                variant="outline"
                class="!min-h-11 shrink-0 !px-4 text-sm"
                :loading="suggesting === song.platformId"
                :disabled="limitReached || !!suggesting"
                :aria-label="`${tt('songs.suggest')}: ${song.title}`"
                @click="suggest(song)"
              >
                {{ tt('songs.suggest') }}
              </InvitationButton>
              </div>
            </li>
          </ul>
        </div>
      </InvitationPanel>
      <p v-else class="rounded-2xl bg-inv-surface px-4 py-3 text-center text-inv-ink-soft text-pretty ring-1 ring-inv-ink/10">
        {{ tt('songs.readOnly') }}
      </p>

      <p
        v-if="noticeText"
        :role="noticeTone === 'ok' ? 'status' : 'alert'"
        :class="['mt-4 text-center text-sm text-pretty', noticeTone === 'ok' ? 'text-inv-primary-ink' : 'text-danger-700']"
        data-testid="songs-notice"
      >
        {{ noticeText }}
      </p>

      <!-- The event's list -->
      <div class="mt-8">
        <div v-if="useVotes || shown.length > 1" class="mb-3 flex items-center justify-between gap-3">
          <h3 class="font-inv-heading text-xl">{{ tt('songs.listTitle') }}</h3>
          <div class="inline-flex rounded-full bg-inv-ink/5 p-1" role="group" :aria-label="tt('songs.order')">
            <button
              v-for="option in ['popular', 'recent']"
              :key="option"
              type="button"
              :aria-pressed="orderBy === option"
              :disabled="preview"
              :class="[
                'min-h-9 rounded-full px-3 text-sm font-medium transition-[background-color,color] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inv-primary',
                orderBy === option ? 'bg-inv-primary text-inv-on-primary' : 'text-inv-ink-soft hover:text-inv-ink'
              ]"
              @click="setOrder(option)"
            >
              {{ tt(`songs.${option}`) }}
            </button>
          </div>
        </div>

        <p v-if="votesLeftText" class="mb-3 text-sm text-inv-ink-soft" data-testid="songs-votes-left">{{ votesLeftText }}</p>

        <div aria-live="polite">
          <ul v-if="!preview && (status === 'loading' || status === 'idle')" class="flex flex-col gap-3" role="status" :aria-label="tt('songs.loading')">
            <li v-for="n in 3" :key="n" class="h-[4.5rem] animate-pulse rounded-2xl bg-inv-ink/10" />
          </ul>

          <div v-else-if="!preview && status === 'error'" class="rounded-2xl bg-inv-surface px-4 py-5 text-center ring-1 ring-inv-ink/10" data-testid="songs-list-error">
            <p class="text-inv-ink-soft text-pretty">{{ tt('songs.loadError') }}</p>
            <InvitationButton variant="outline" class="mt-4" @click="load">{{ tt('retry') }}</InvitationButton>
          </div>

          <p v-else-if="!shown.length" class="flex flex-col items-center gap-3 py-4 text-center text-inv-ink-soft text-pretty" data-testid="songs-empty">
            <Music2 class="h-7 w-7 text-inv-primary" aria-hidden="true" />
            {{ canWrite ? tt('songs.empty') : tt('songs.emptyReadOnly') }}
          </p>

          <template v-else>
            <ul :aria-label="tt('songs.list')" :class="variant === 'cards' ? 'grid gap-3 sm:grid-cols-2' : 'flex flex-col gap-3'">
              <li
                v-for="item in shown"
                :key="item.id"
                class="inv-songs__item flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl bg-inv-surface px-3 py-3 ring-1 ring-inv-ink/10"
              >
                <span class="inv-songs__cover flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-inv-primary/10 font-inv-heading text-xl text-inv-primary">
                  <img v-if="safeHttpsUrl(item.thumbnailUrl)" :src="safeHttpsUrl(item.thumbnailUrl)" alt="" width="56" height="56" loading="lazy" referrerpolicy="no-referrer" class="h-full w-full object-cover" />
                  <template v-else>{{ initial(item) }}</template>
                </span>
                <span class="min-w-[9rem] flex-1">
                  <span class="block truncate font-inv-heading text-lg">{{ item.title }}</span>
                  <span class="block truncate text-sm text-inv-ink-soft">{{ item.artist }}</span>
                  <span v-if="item.suggestedByMe" class="mt-0.5 inline-block rounded-full bg-inv-accent/20 px-2 text-xs text-inv-primary-ink">{{ tt('songs.yours') }}</span>
                  <span v-if="previewFailed === item.id" class="block text-xs text-danger-700" role="alert">{{ tt('songs.previewError') }}</span>
                </span>
                <div class="inv-songs__actions ml-auto flex shrink-0 items-center gap-2">
                <button
                  v-if="previewable(item)"
                  type="button"
                  class="inv-songs__play flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-inv-primary text-inv-primary transition-[background-color,scale] duration-150 ease-out hover:bg-inv-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inv-primary active:scale-[0.97]"
                  :aria-label="`${tt(playingId === item.id ? 'songs.pausePreview' : 'songs.playPreview')}: ${item.title}`"
                  :aria-pressed="playingId === item.id"
                  @click="togglePreview(item.id, item.previewUrl)"
                >
                  <component :is="playingId === item.id ? Pause : Play" class="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  v-if="canWrite && item.suggestedByMe"
                  type="button"
                  class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-inv-ink-soft transition-[background-color,color] duration-150 ease-out hover:bg-inv-ink/5 hover:text-danger-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inv-primary disabled:opacity-50"
                  :aria-label="`${tt('songs.remove')}: ${item.title}`"
                  :disabled="busy.has(item.id)"
                  data-testid="song-remove"
                  @click="remove(item)"
                >
                  <Trash2 class="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  v-if="useVotes && canWrite"
                  type="button"
                  :class="[
                    'inv-songs__vote flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm font-semibold transition-[background-color,color,scale] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inv-primary active:scale-[0.97] disabled:opacity-50',
                    item.votedByMe ? 'border-inv-primary bg-inv-primary text-inv-on-primary' : 'border-inv-primary text-inv-primary hover:bg-inv-primary/10'
                  ]"
                  :aria-label="`${tt(item.votedByMe ? 'songs.unvote' : 'songs.vote')}: ${item.title}`"
                  :aria-pressed="!!item.votedByMe"
                  :disabled="busy.has(item.id) || preview"
                  data-testid="song-vote"
                  @click="vote(item)"
                >
                  <ThumbsUp class="h-4 w-4" aria-hidden="true" />
                  <span>{{ item.votes ?? 0 }}</span>
                </button>
                <span v-else-if="useVotes" class="inline-flex shrink-0 items-center gap-1.5 text-sm text-inv-ink-soft" :aria-label="tt('songs.votesCount', { n: item.votes ?? 0 })">
                  <ThumbsUp class="h-4 w-4" aria-hidden="true" />{{ item.votes ?? 0 }}
                </span>
                </div>
              </li>
            </ul>
            <p v-if="listError" class="mt-3 text-center text-sm text-danger-700">{{ tt('songs.loadError') }}</p>
            <div v-if="!preview && hasMore" class="mt-5 text-center">
              <InvitationButton variant="outline" :loading="loadingMore" @click="more">{{ tt('songs.more') }}</InvitationButton>
            </div>
          </template>
        </div>
      </div>
    </div>
  </InvitationSection>
</template>

<style scoped>
.inv-songs__input::-webkit-search-cancel-button {
  appearance: none;
  display: none;
}
</style>
