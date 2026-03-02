<script setup>
import { ref, watch } from 'vue'
import { useSuggestedMusicStore } from '@/stores/useSuggestedMusicStore'
import SongsService from '@/modules/suggested-music/services/SongsService'
import { useNotificationStore } from '@/stores/useNotificationStore'
import CWMSimplePagination from '@/components/UI/pagination/CWMSimplePagination.vue'
import HNSongSearchInput from '@/views/non-authenticated/templates/habana-nights/SuggestedMusic/HNSongSearchInput.vue'
import HNSongList from '@/views/non-authenticated/templates/habana-nights/SuggestedMusic/HNSongList.vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  subTitle: {
    type: String,
    default: ''
  },
  mainColor: {
    type: String,
    required: true
  },
  secondaryColor: {
    type: String,
    required: true
  },
  usePreview: {
    type: Boolean,
    required: true
  },
  useVoteSystem: {
    type: Boolean,
    required: true
  },
  mode: {
    type: String,
    default: 'normal',
    validator: value => ['normal', 'creator'].includes(value)
  },
  event: {
    type: Object,
    required: true
  }
})

const songsStore = useSuggestedMusicStore()
const loading = ref(false)
const notification = useNotificationStore()
const totalItems = ref(0)
const pageSelected = ref(1)

const getSuggestedSongs = async () => {
  try {
    loading.value = true

    const options = {
      perPage: 5,
      pageSelected: pageSelected.value,
      orderBy: 'recent',
      search: ''
    }

    const response = await SongsService.getSuggestedSongsPublic(props?.event?.id, options)

    if (response.status === 200) {
      songsStore.selectedSongs = response?.data?.data ?? []
      totalItems.value = response.data?.meta?.total ?? 0
    } else {
      notification.addNotification({
        type: 'error',
        message: 'Oops something went wrong!'
      })
    }
  } catch (e) {
    console.log(e)
  } finally {
    loading.value = false
  }
}

const handleUpdatedList = async () => {
  await getSuggestedSongs()
}

watch(pageSelected, () => getSuggestedSongs())

watch(
  () => props.event,
  newValue => {
    if (Object.entries(newValue).length) {
      getSuggestedSongs()
    }
  },
  {
    deep: true,
    immediate: true
  }
)
</script>

<template>
  <div class="hn-music-shell w-full">
    <!-- Meta bar -->
    <div class="hn-music-meta mb-6">
      <span class="hn-music-meta-text">Selección Musical</span>
      <span class="hn-music-meta-dot">•</span>
      <span class="hn-music-meta-text">Sugerencias de Invitados</span>
    </div>

    <!-- Title -->
    <div class="hn-music-header mb-8">
      <h2 class="hn-music-title">
        {{ title }}
      </h2>
      <p class="hn-music-subtitle">
        {{ subTitle }}
      </p>
    </div>

    <!-- Search -->
    <div class="hn-music-search mb-6">
      <HNSongSearchInput
        :event="event"
        :main-color="mainColor"
        :secondary-color="secondaryColor"
        :mode="mode"
        @update:list="handleUpdatedList"
      />
    </div>

    <!-- List -->
    <div class="hn-music-list">
      <HNSongList
        :event="event"
        :mode="mode"
        :main-color="mainColor"
        :use-preview="usePreview"
        :use-vote-system="useVoteSystem"
        @update:list="handleUpdatedList"
      />
    </div>

    <div v-if="!loading && !songsStore.selectedSongs.length" class="hn-music-empty">
      <div class="hn-music-empty-inner">
        <div class="hn-music-empty-badge">Aún no hay sugerencias</div>

        <h3 class="hn-music-empty-title">Sé el primero en poner el mood 🎷</h3>
        <p class="hn-music-empty-text">
          Usa el buscador de arriba para sugerir una canción. Aparecerá aquí para que todos la vean.
        </p>

        <div class="hn-music-empty-hint">Tip: busca por artista, canción o álbum.</div>
      </div>
    </div>

    <!-- Pagination (contained and separated) -->
    <div v-if="songsStore.selectedSongs.length" class="hn-music-pagination mt-8 pt-6">
      <CWMSimplePagination v-model="pageSelected" :total-items="totalItems" />
    </div>

    <!-- Loading (optional visual hint, no logic change) -->
    <div v-if="loading" class="hn-music-loading" aria-live="polite">Loading…</div>
  </div>
</template>

<style scoped>
.hn-music-empty {
  margin-top: 1.25rem;
  padding: 1.25rem;
  border-radius: 16px;
  border: 1px dashed rgba(212, 175, 55, 0.22);
  background: rgba(15, 23, 42, 0.35);
}

.hn-music-empty-inner {
  text-align: center;
  padding: 1.25rem 1rem;
}

.hn-music-empty-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(212, 175, 55, 0.95);
  background: rgba(212, 175, 55, 0.12);
  border: 1px solid rgba(212, 175, 55, 0.22);
}

.hn-music-empty-title {
  margin-top: 0.9rem;
  font-family: 'Cinzel', serif;
  font-weight: 600;
  font-size: 1.25rem;
  letter-spacing: 0.08em;
  color: rgba(248, 241, 231, 0.95);
}

.hn-music-empty-text {
  margin-top: 0.6rem;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.95rem;
  line-height: 1.6;
  color: rgba(148, 163, 184, 0.95);
  max-width: 36rem;
  margin-left: auto;
  margin-right: auto;
}

.hn-music-empty-hint {
  margin-top: 0.85rem;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.8rem;
  color: rgba(148, 163, 184, 0.8);
}

.hn-music-shell {
  width: 100%;
  max-width: 56rem;
  margin: 0 auto;
}

/* Meta bar */
.hn-music-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(212, 175, 55, 0.15);
}

.hn-music-meta-text {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #94a3b8;
}

.hn-music-meta-dot {
  margin: 0 0.75rem;
  color: rgba(212, 175, 55, 0.5);
}

/* Title block */
.hn-music-header {
  text-align: center;
}

.hn-music-title {
  font-family: 'Cinzel', serif;
  font-weight: 600;
  font-size: clamp(2rem, 4vw, 3rem);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #f8f1e7;
  line-height: 1.1;
  margin-bottom: 0.75rem;
}

.hn-music-title::after {
  content: '';
  display: block;
  width: 72px;
  height: 2px;
  margin: 0.9rem auto 0;
  background: linear-gradient(
    90deg,
    rgba(212, 175, 55, 0),
    rgba(212, 175, 55, 0.9),
    rgba(212, 175, 55, 0)
  );
  opacity: 0.9;
}

.hn-music-subtitle {
  max-width: 42rem;
  margin: 0.9rem auto 0;
  font-family: 'Montserrat', sans-serif;
  font-size: 1rem;
  line-height: 1.6;
  color: rgba(148, 163, 184, 0.95);
}

/* Keep spacing consistent */
.hn-music-search,
.hn-music-list {
  width: 100%;
}

/* Pagination containment */
.hn-music-pagination {
  border-top: 1px solid rgba(212, 175, 55, 0.12);
  display: flex;
  justify-content: center;
  overflow: hidden;
}

/* Loading */
.hn-music-loading {
  margin-top: 1rem;
  text-align: center;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.9rem;
  color: rgba(148, 163, 184, 0.9);
}
</style>
