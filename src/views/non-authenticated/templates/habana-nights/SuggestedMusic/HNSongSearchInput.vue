<script setup>
import { ref } from 'vue'
import debounce from 'lodash.debounce'
import SongsService from '@/modules/suggested-music/services/SongsService'
import { useNotificationStore } from '@/stores/useNotificationStore'
import SpotifyService from '@/modules/suggested-music/services/SpotifyService'
import { useTemplateStore } from '@/stores/publicEvents/useTemplateStore'

const emit = defineEmits(['update:List'])
const props = defineProps({
  event: {
    type: Object,
    required: true
  }
})

const notification = useNotificationStore()
const searchQuery = ref('')
const suggestions = ref([])
let skipFetch = false
const templateStore = useTemplateStore()

const selectSuggestion = song => {
  skipFetch = true

  saveSelectedSong(song)
  searchQuery.value = ''
  suggestions.value = []

  setTimeout(() => {
    skipFetch = false
  }, 300)
}

const saveSelectedSong = async song => {
  if (props.mode === 'creator') return

  try {
    const response = await SongsService.createPublic({
      eventId: props.event?.id ?? 0,
      platformId: song.platformId,
      title: song.title,
      artist: song.artist,
      album: song.album,
      thumbnailUrl: song.thumbnailUrl,
      accessCode: templateStore.guest.accessCode ?? ''
    })

    if (response.status >= 200 && response.status < 300) {
      emit('update:List')
      notification.addNotification({
        message: 'Song added successfully'
      })
    } else {
      notification.addNotification({
        type: 'error',
        message: 'Oops something went wrong!'
      })
    }
  } catch (e) {
    console.log(e)
  }
}

const fetchSuggestions = debounce(async () => {
  if (searchQuery.value && !skipFetch) {
    try {
      const result = await SpotifyService.searchSongs(searchQuery.value)

      suggestions.value = result.tracks.items.map(track => ({
        platformId: track.id,
        title: track.name,
        artist: track.artists.map(artist => artist.name).join(', '),
        album: track.album.name || 'Unknown Album',
        thumbnailUrl: track.album.images[0]?.url || 'https://via.placeholder.com/48'
      }))
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      suggestions.value = []
    }
  } else {
    suggestions.value = []
  }
}, 300)
</script>

<template>
  <div class="hn-search-wrap relative w-full">
    <!-- Label / hint -->
    <div class="hn-search-hint mb-3">
      <span class="hn-search-kicker">Spotify Search</span>
    </div>

    <!-- Input -->
    <div class="hn-search-input relative">
      <div class="hn-search-icon" aria-hidden="true">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-4.3-4.3M10 18a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>
      </div>

      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search a song, artist, or album…"
        class="hn-input"
        @input="fetchSuggestions"
      />

      <!-- Accent underline -->
      <div class="hn-underline" aria-hidden="true"></div>
    </div>

    <!-- Dropdown -->
    <div
      v-if="suggestions.length"
      class="hn-dropdown absolute left-0 top-full mt-3 w-full z-50"
      role="listbox"
    >
      <div class="hn-dropdown-inner">
        <ul class="hn-dropdown-list">
          <li
            v-for="(song, index) in suggestions"
            :key="index"
            class="hn-suggestion"
            @click="selectSuggestion(song)"
          >
            <img :src="song.thumbnailUrl" alt="" class="hn-thumb" aria-hidden="true" />

            <div class="min-w-0 flex-1">
              <p class="hn-title truncate">{{ song.title }}</p>
              <p class="hn-sub truncate">{{ song.artist }} — {{ song.album }}</p>
            </div>

            <div class="hn-add" aria-hidden="true">
              <span class="hn-add-text">Add</span>
            </div>
          </li>
        </ul>
      </div>

      <!-- dropdown vignette -->
      <div class="hn-dropdown-vignette" aria-hidden="true"></div>
    </div>
  </div>
</template>

<style scoped>
.hn-search-wrap {
  max-width: 56rem;
  margin: 0 auto;
}

/* Hint */
.hn-search-hint {
  display: flex;
  align-items: center;
  justify-content: center;
}

.hn-search-kicker {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.72rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.95);
}

.hn-search-dot {
  margin: 0 0.75rem;
  color: rgba(212, 175, 55, 0.55);
}

/* Input container */
.hn-search-input {
  position: relative;
  border-radius: 14px;
  background: rgba(17, 24, 39, 0.45);
  border: 1px solid rgba(212, 175, 55, 0.18);
  box-shadow:
    0 18px 40px rgba(0, 0, 0, 0.35),
    0 0 90px rgba(232, 93, 74, 0.06),
    0 0 60px rgba(212, 175, 55, 0.04);
  overflow: hidden;
}

.hn-search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(212, 175, 55, 0.65);
  pointer-events: none;
}

.hn-input {
  width: 100%;
  height: 48px;
  padding-left: 48px;
  padding-right: 14px;
  background: transparent;
  border: none;
  outline: none;
  color: #f8f1e7;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.95rem;
}

.hn-input::placeholder {
  color: rgba(148, 163, 184, 0.72);
}

.hn-underline {
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    rgba(212, 175, 55, 0),
    rgba(212, 175, 55, 0.8),
    rgba(232, 93, 74, 0.35),
    rgba(212, 175, 55, 0)
  );
  opacity: 0.65;
}

.hn-search-input:focus-within {
  border-color: rgba(212, 175, 55, 0.35);
  box-shadow:
    0 18px 40px rgba(0, 0, 0, 0.35),
    0 0 120px rgba(212, 175, 55, 0.08),
    0 0 110px rgba(232, 93, 74, 0.1);
}

.hn-search-input:focus-within .hn-underline {
  opacity: 0.95;
}

/* Dropdown */
.hn-dropdown {
  position: absolute;
}

.hn-dropdown-inner {
  background: rgba(17, 24, 39, 0.7);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  overflow: hidden;
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.55),
    0 0 120px rgba(232, 93, 74, 0.08);
}

.hn-dropdown-list {
  max-height: 340px;
  overflow-y: auto;
  padding: 0.5rem;
}

/* suggestions */
.hn-suggestion {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.75rem 0.85rem;
  border-radius: 14px;
  cursor: pointer;
  transition:
    transform 180ms ease,
    background 180ms ease,
    border-color 180ms ease;
  border: 1px solid rgba(212, 175, 55, 0.08);
  background: rgba(11, 18, 32, 0.25);
}

.hn-suggestion:hover {
  background: rgba(11, 18, 32, 0.42);
  border-color: rgba(212, 175, 55, 0.22);
  transform: translateY(-1px);
}

.hn-thumb {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.hn-title {
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 0.92rem;
  color: #f8f1e7;
}

.hn-sub {
  margin-top: 0.15rem;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.78rem;
  color: rgba(148, 163, 184, 0.95);
}

.hn-add {
  display: none;
}

@media (min-width: 640px) {
  .hn-add {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.45rem 0.75rem;
    border-radius: 999px;
    border: 1px solid rgba(212, 175, 55, 0.18);
    background: rgba(212, 175, 55, 0.08);
  }

  .hn-add-text {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.72rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(212, 175, 55, 0.95);
  }
}

.hn-dropdown-vignette {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  pointer-events: none;
  background: radial-gradient(ellipse at 70% 20%, rgba(232, 93, 74, 0.1) 0%, transparent 55%);
}
</style>
