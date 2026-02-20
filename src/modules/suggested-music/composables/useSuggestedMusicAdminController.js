import { computed, onMounted, ref } from 'vue'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { useUserStore } from '@/stores/useUserStore'
import { useClickOutside } from '@/composables/useClickOutside'
import debounce from 'lodash.debounce'
import SpotifyService from '@/modules/suggested-music/services/SpotifyService'
import SongsService from '@/modules/suggested-music/services/SongsService'
import { useSuggestedMusicStore } from '@/modules/suggested-music/stores/useSuggestedMusicStore'

export function useSuggestedMusicAdminController() {
  // UI state
  const suggestedMusicStore = useSuggestedMusicStore()
  const notificationStore = useNotificationStore()
  const userStore = useUserStore()

  // State
  const loading = ref(false)
  const exporting = ref(false)
  const showExportDropdown = ref(false)
  const exportDropdownRef = ref(null)
  const searchQuery = ref('')
  const searchResults = ref([])
  const searchContainerRef = ref(null)

  const showVoteDetailsModal = ref(false)
  const selectedSongForDetails = ref(null)

  const showRemoveConfirm = ref(false)
  const songIdToRemove = ref(null)

  // Player Modal State
  const showPlayerModal = ref(false)
  const selectedSongForPlayer = ref(null)

  // Filter and Sort
  const localSearch = ref('')
  const sortBy = ref('recent')
  const filterBy = ref('all')

  // Get songs on mount
  onMounted(async () => {
    await getSuggestedSongs()
  })

  useClickOutside(searchContainerRef, () => {
    searchResults.value = []
  })

  useClickOutside(exportDropdownRef, () => {
    showExportDropdown.value = false
  })

  // Stats Computed
  const hasSongs = computed(() => {
    return suggestedMusicStore.selectedSongs.length > 0
  })

  const totalSongs = computed(() => {
    return suggestedMusicStore.selectedSongs.length
  })

  const totalVotes = computed(() => {
    return suggestedMusicStore.selectedSongs.reduce((total, song) => {
      const upVotes = song.votes?.up || 0
      const downVotes = song.votes?.down || 0
      return total + upVotes + downVotes
    }, 0)
  })

  const topSong = computed(() => {
    if (suggestedMusicStore.selectedSongs.length === 0) return null

    return suggestedMusicStore.selectedSongs.reduce((top, song) => {
      const currentNetScore = (song.votes?.up || 0) - (song.votes?.down || 0)
      const topNetScore = (top.votes?.up || 0) - (top.votes?.down || 0)
      return currentNetScore > topNetScore ? song : top
    })
  })

  const guestSuggested = computed(() => {
    return suggestedMusicStore.selectedSongs.filter(song => {
      return song.suggestedBy?.isOrganizer === false
    }).length
  })

  // Filtered and sorted songs
  const filteredAndSortedSongs = computed(() => {
    let songs = [...suggestedMusicStore.selectedSongs]

    // Apply local search
    if (localSearch.value.trim()) {
      const search = localSearch.value.toLowerCase()
      songs = songs.filter(
        song =>
          song.title.toLowerCase().includes(search) ||
          song.artist.toLowerCase().includes(search) ||
          song.album.toLowerCase().includes(search)
      )
    }

    // Apply filters
    if (filterBy.value === 'admin') {
      songs = songs.filter(song => song.suggestedBy?.isOrganizer === true)
    } else if (filterBy.value === 'guest') {
      songs = songs.filter(song => song.suggestedBy?.isOrganizer === false)
    } else if (filterBy.value === 'topVoted') {
      songs = songs.filter(song => isTopVoted(song))
    }

    // Apply sorting
    if (sortBy.value === 'popular') {
      songs.sort((a, b) => getNetScore(b) - getNetScore(a))
    } else if (sortBy.value === 'mostVoted') {
      songs.sort((a, b) => {
        const totalA = (a.votes?.up || 0) + (a.votes?.down || 0)
        const totalB = (b.votes?.up || 0) + (b.votes?.down || 0)
        return totalB - totalA
      })
    } else if (sortBy.value === 'alphabetical') {
      songs.sort((a, b) => a.title.localeCompare(b.title))
    }

    return songs
  })

  // Get suggested songs from the API
  const getSuggestedSongs = async () => {
    try {
      loading.value = true
      const response = await suggestedMusicStore.getSuggestedSongs(userStore.activeEvent)

      if (response.status === 200) {
        suggestedMusicStore.setSongs(response?.data?.data ?? [])
      } else {
        notificationStore.addNotification({
          type: 'error',
          message: 'Failed to load suggested music'
        })
      }
    } catch (error) {
      console.error(error)
      notificationStore.addNotification({
        type: 'error',
        message: 'An error occurred while loading suggested music'
      })
    } finally {
      loading.value = false
    }
  }

  // Search for songs using Spotify API
  const searchSongs = debounce(async () => {
    if (!searchQuery.value) {
      searchResults.value = []
      return
    }

    try {
      const result = await SpotifyService.searchSongs(searchQuery.value)
      searchResults.value = result.tracks.items.map(track => ({
        platformId: track.id,
        title: track.name,
        artist: track.artists.map(artist => artist.name).join(', '),
        album: track.album.name || 'Unknown Album',
        thumbnailUrl: track.album.images[0]?.url || 'https://via.placeholder.com/48',
        previewUrl: track.preview_url || null
      }))
    } catch (error) {
      console.error('Error searching songs:', error)
      searchResults.value = []
      notificationStore.addNotification({
        type: 'error',
        message: 'Failed to search for songs'
      })
    }
  }, 300)

  // Add a song to the suggested songs list
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
        notificationStore.addNotification({
          type: 'success',
          message: 'Song added successfully!'
        })
        searchQuery.value = ''
        searchResults.value = []
      } else {
        notificationStore.addNotification({
          type: 'error',
          message: 'Failed to add song'
        })
      }
    } catch (error) {
      console.error('Error adding song:', error)
      notificationStore.addNotification({
        type: 'error',
        message: 'An error occurred while adding the song'
      })
    }
  }

  // Remove a song from the suggested songs list
  const confirmRemoveSong = songId => {
    songIdToRemove.value = songId
    showRemoveConfirm.value = true
  }

  const removeSong = async songId => {
    try {
      loading.value = true
      const response = await SongsService.deleteSong(userStore.activeEvent, songId)

      if (response.status === 200) {
        suggestedMusicStore.removeSong(songId)
        notificationStore.addNotification({
          message: 'Song removed successfully'
        })
      } else {
        notificationStore.addNotification({
          type: 'error',
          message: 'Failed to remove song'
        })
      }
    } catch (error) {
      console.error('Error removing song:', error)
      notificationStore.addNotification({
        type: 'error',
        message: 'An error occurred while removing the song'
      })
    } finally {
      loading.value = false
      showRemoveConfirm.value = false
      songIdToRemove.value = null
    }
  }

  // Check if a song is "top voted" (high net score)
  const isTopVoted = song => {
    if (!song.votes) return false
    const netScore = (song.votes.up || 0) - (song.votes.down || 0)
    return netScore >= 10
  }

  // Get net score for a song
  const getNetScore = song => {
    if (!song.votes) return 0
    return (song.votes.up || 0) - (song.votes.down || 0)
  }

  // View song details
  const viewSongDetails = song => {
    selectedSongForDetails.value = song
    showVoteDetailsModal.value = true
  }

  // Player Modal Functions
  const openPlayer = song => {
    selectedSongForPlayer.value = song
    showPlayerModal.value = true
  }

  const closePlayer = () => {
    showPlayerModal.value = false
    selectedSongForPlayer.value = null
  }

  const exportPlaylist = async format => {
    try {
      exporting.value = true
      showExportDropdown.value = false
      const response = await SongsService.exportPlaylist(userStore.activeEvent, format)

      const blob = new Blob([response.data], { type: response.headers['content-type'] })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      // Try to get filename from content-disposition
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

      notificationStore.addNotification({
        type: 'success',
        message: 'Playlist exported successfully'
      })
    } catch (error) {
      console.error('Error exporting playlist:', error)
      notificationStore.addNotification({
        type: 'error',
        message: 'Failed to export playlist'
      })
    } finally {
      exporting.value = false
    }
  }

  return {
    confirmRemoveSong,
    removeSong,
    exportPlaylist,
    closePlayer,
    openPlayer,
    isTopVoted,
    viewSongDetails,
    addSong,
    searchSongs,
    getSuggestedSongs,
    getNetScore,
    filteredAndSortedSongs,
    guestSuggested,
    topSong,
    totalVotes,
    totalSongs,
    hasSongs,

    // State
    loading,
    exporting,
    showExportDropdown,
    exportDropdownRef,
    searchQuery,
    searchResults,
    searchContainerRef,

    showVoteDetailsModal,
    selectedSongForDetails,

    showRemoveConfirm,
    songIdToRemove,

    // Player Modal State
    showPlayerModal,
    selectedSongForPlayer,

    // Filter and Sort
    localSearch,
    sortBy,
    filterBy
  }
}
