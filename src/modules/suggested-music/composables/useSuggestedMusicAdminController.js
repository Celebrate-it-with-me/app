import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import debounce from 'lodash.debounce'
import { useToast } from '@/ui'
import { useUserStore } from '@/stores/useUserStore'
import { useClickOutside } from '@/composables/useClickOutside'
import SpotifyService from '@/modules/suggested-music/services/SpotifyService'
import SongsService from '@/modules/suggested-music/services/SongsService'
import { useSuggestedMusicStore } from '@/modules/suggested-music/stores/useSuggestedMusicStore'
import {
  countGuestSuggested,
  filterAndSortSongs,
  getTopSong,
  getTotalVotes,
  mapSpotifyTracks
} from '@/modules/suggested-music/utils/music'

export function useSuggestedMusicAdminController() {
  const { t } = useI18n()
  const toast = useToast()
  const suggestedMusicStore = useSuggestedMusicStore()
  const userStore = useUserStore()

  const loading = ref(false)
  const exporting = ref(false)
  const deleting = ref(false)
  const searching = ref(false)
  const searchQuery = ref('')
  const searchResults = ref([])
  const searchContainerRef = ref(null)

  const showVoteDetailsModal = ref(false)
  const selectedSongForDetails = ref(null)

  const showRemoveConfirm = ref(false)
  const songIdToRemove = ref(null)

  const showPlayerModal = ref(false)
  const selectedSongForPlayer = ref(null)

  const localSearch = ref('')
  const sortBy = ref('recent')
  const filterBy = ref('all')

  onMounted(() => getSuggestedSongs())

  useClickOutside(searchContainerRef, () => {
    searchResults.value = []
  })

  const songs = computed(() => suggestedMusicStore.selectedSongs)
  const hasSongs = computed(() => songs.value.length > 0)
  const totalSongs = computed(() => songs.value.length)
  const totalVotes = computed(() => getTotalVotes(songs.value))
  const topSong = computed(() => getTopSong(songs.value))
  const guestSuggested = computed(() => countGuestSuggested(songs.value))
  const filteredAndSortedSongs = computed(() =>
    filterAndSortSongs(songs.value, {
      search: localSearch.value,
      filterBy: filterBy.value,
      sortBy: sortBy.value
    })
  )

  async function getSuggestedSongs() {
    loading.value = true
    try {
      const response = await suggestedMusicStore.getSuggestedSongs(userStore.activeEvent)
      if (response.status === 200) {
        suggestedMusicStore.setSongs(response?.data?.data ?? [])
      } else {
        toast.error(t('app.music.loadError'))
      }
    } catch {
      toast.error(t('app.music.loadError'))
    } finally {
      loading.value = false
    }
  }

  const searchSongs = debounce(async () => {
    if (!searchQuery.value) {
      searchResults.value = []
      return
    }

    searching.value = true
    try {
      const result = await SpotifyService.searchSongs(searchQuery.value)
      searchResults.value = mapSpotifyTracks(result)
    } catch {
      searchResults.value = []
      toast.error(t('app.music.searchError'))
    } finally {
      searching.value = false
    }
  }, 300)

  const addSong = async song => {
    try {
      const response = await suggestedMusicStore.addNewSong({
        eventId: userStore.activeEvent,
        platformId: song.platformId,
        title: song.title,
        artist: song.artist,
        album: song.album,
        thumbnailUrl: song.thumbnailUrl,
        previewUrl: song.previewUrl
      })

      if (response.status >= 200 && response.status < 300) {
        suggestedMusicStore.addSong(response?.data?.data ?? {})
        toast.success(t('app.music.added'))
        searchQuery.value = ''
        searchResults.value = []
      } else {
        toast.error(t('app.music.addError'))
      }
    } catch {
      toast.error(t('app.music.addError'))
    }
  }

  const confirmRemoveSong = songId => {
    songIdToRemove.value = songId
    showRemoveConfirm.value = true
  }

  const removeSong = async songId => {
    deleting.value = true
    try {
      const response = await SongsService.deleteSong(userStore.activeEvent, songId)
      if (response.status === 200) {
        suggestedMusicStore.removeSong(songId)
        toast.success(t('app.music.removed'))
      } else {
        toast.error(t('app.music.removeError'))
      }
    } catch {
      toast.error(t('app.music.removeError'))
    } finally {
      deleting.value = false
      showRemoveConfirm.value = false
      songIdToRemove.value = null
    }
  }

  const viewSongDetails = song => {
    selectedSongForDetails.value = song
    showVoteDetailsModal.value = true
  }

  const openPlayer = song => {
    selectedSongForPlayer.value = song
    showPlayerModal.value = true
  }

  const closePlayer = () => {
    showPlayerModal.value = false
    selectedSongForPlayer.value = null
  }

  const exportPlaylist = async format => {
    exporting.value = true
    try {
      const response = await SongsService.exportPlaylist(userStore.activeEvent, format)

      const blob = new Blob([response.data], { type: response.headers['content-type'] })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      const contentDisposition = response.headers['content-disposition']
      let fileName = `playlist.${format}`
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/)
        if (fileNameMatch?.[1]) fileName = fileNameMatch[1]
      }

      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success(t('app.music.exported'))
    } catch {
      toast.error(t('app.music.exportError'))
    } finally {
      exporting.value = false
    }
  }

  return {
    loading,
    exporting,
    deleting,
    searching,
    searchQuery,
    searchResults,
    searchContainerRef,
    showVoteDetailsModal,
    selectedSongForDetails,
    showRemoveConfirm,
    songIdToRemove,
    showPlayerModal,
    selectedSongForPlayer,
    localSearch,
    sortBy,
    filterBy,
    totalSongs,
    totalVotes,
    topSong,
    guestSuggested,
    filteredAndSortedSongs,
    hasSongs,
    searchSongs,
    addSong,
    confirmRemoveSong,
    removeSong,
    viewSongDetails,
    openPlayer,
    closePlayer,
    exportPlaylist
  }
}
