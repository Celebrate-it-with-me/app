import { CWM_API } from './axios'

class SongsService {
  /**
   * Create a new suggested song (organizer)
   * POST /event/{eventId}/suggest-music
   */
  async create({ eventId, platformId, title, artist, album, thumbnailUrl, previewUrl }) {
    return CWM_API.post(`event/${eventId}/suggest-music`, {
      platformId,
      title,
      artist,
      album,
      thumbnailUrl,
      previewUrl
    })
  }

  async createPublic({
    eventId,
    platformId,
    title,
    artist,
    album,
    thumbnailUrl,
    previewUrl,
    accessCode
  }) {
    return CWM_API.post(`template/event/${eventId}/suggest-music`, {
      platformId,
      title,
      artist,
      album,
      thumbnailUrl,
      previewUrl,
      accessCode
    })
  }

  /**
   * Get suggested songs for an event (organizer view)
   * GET /event/{eventId}/suggest-music
   */
  async getSuggestedSongs(eventId, options = {}) {
    const { perPage = 10, orderBy = 'recent', search = '' } = options

    return CWM_API.get(`event/${eventId}/suggest-music`, {
      params: {
        perPage,
        orderBy,
        search
      }
    })
  }

  async getSuggestedSongsPublic(eventId, options = {}) {
    const { perPage = 5, pageSelected = 1, orderBy = 'recent', search = '' } = options

    return CWM_API.get(`template/event/${eventId}/suggest-music`, {
      params: {
        perPage,
        pageSelected,
        orderBy,
        search
      }
    })
  }

  /**
   * Delete a suggested song (organizer)
   * DELETE /event/{eventId}/suggest-music/{songId}
   */
  async deleteSong(eventId, songId) {
    return CWM_API.delete(`event/${eventId}/suggest-music/${songId}`)
  }

  async deleteSongPublic(eventId, songId, accessCode) {
    return CWM_API.delete(`template/event/${eventId}/suggest-music/`, {
      params: {
        songId,
        accessCode
      }
    })
  }

  /**
   * Vote on a song (guest with accessCode)
   * POST /event/{eventId}/suggest-music/{songId}/vote
   */
  async voteSong(eventId, songId, direction, accessCode) {
    return CWM_API.post(`event/${eventId}/suggest-music/${songId}/vote`, {
      direction,
      accessCode
    })
  }

  /**
   * Get available votes for a guest
   * GET /event/{eventId}/suggest-music/votes/available
   */
  async getAvailableVotes(eventId, accessCode) {
    return CWM_API.get(`event/${eventId}/suggest-music/votes/available`, {
      params: {
        accessCode
      }
    })
  }

  /**
   * Get user's vote on a specific song
   * GET /event/{eventId}/suggest-music/{songId}/vote
   */
  async getUserVote(eventId, songId, accessCode) {
    return CWM_API.get(`event/${eventId}/suggest-music/${songId}/vote`, {
      params: {
        accessCode
      }
    })
  }

  // ===============================================
  // CONFIG METHODS (Deprecated - kept for legacy)
  // TODO: Remove when migrated to eventTheme
  // ===============================================

  /**
   * @deprecated Use eventTheme instead
   */
  async saveSuggestedConfig({
    useSuggestedMusic,
    title,
    subTitle,
    usePreview,
    mainColor,
    secondaryColor,
    useVoteSystem,
    searchLimit,
    eventId
  }) {
    return CWM_API.post(`event/${eventId}/suggest-music-config`, {
      useSuggestedMusic,
      title,
      subTitle,
      usePreview,
      mainColor,
      secondaryColor,
      useVoteSystem,
      searchLimit
    })
  }

  /**
   * @deprecated Use eventTheme instead
   */
  async updateSuggestedConfig({
    id,
    title,
    subTitle,
    usePreview,
    mainColor,
    secondaryColor,
    useVoteSystem,
    searchLimit
  }) {
    return CWM_API.put(`suggest-music-config/${id}`, {
      title,
      subTitle,
      usePreview,
      mainColor,
      secondaryColor,
      useVoteSystem,
      searchLimit
    })
  }

  /**
   * @deprecated Use eventTheme instead
   */
  async getSuggestedConfig(eventId) {
    return CWM_API.get(`event/${eventId}/suggest-music-config`)
  }
}

export default new SongsService()
