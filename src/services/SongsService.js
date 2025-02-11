import { CWM_API } from './axios'

class SongsService {
  async create({ eventId, platformId, title, artist, album, thumbnailUrl, accessCode }) {
    return CWM_API.post(`event/${eventId}/suggest-music`, {
      platformId,
      title,
      artist,
      album,
      thumbnailUrl,
      accessCode
    })
  }

  async getSuggestedSongs(eventId, pageSelected) {
    return CWM_API.get(`event/${eventId}/suggest-music`, {
      params: {
        pageSelected
      }
    })
  }

  async deleteSong(eventId, songId) {
    return CWM_API.delete(`suggest-music/${songId}`)
  }

  async voteSong({ songId, direction }) {
    return CWM_API.post(`suggest-music/${songId}/vote`, {
      direction: direction
    })
  }

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
  }){
    return CWM_API.post(`event/${eventId}/suggest-music-config`,{
      useSuggestedMusic,
      title,
      subTitle,
      usePreview,
      mainColor,
      secondaryColor,
      useVoteSystem,
      searchLimit,
      eventId
    })
  }

  async updateSuggestedConfig({
                                id,
                                useSuggestedMusic,
                                title,
                                subTitle,
                                usePreview,
                                mainColor,
                                secondaryColor,
                                useVoteSystem,
                                searchLimit,
                              }) {
    return CWM_API.put(`suggest-music-config/${id}`,{
      useSuggestedMusic,
      title,
      subTitle,
      usePreview,
      mainColor,
      secondaryColor,
      useVoteSystem,
      searchLimit,
    })
  }

  async getSuggestedConfig(eventId){
    return CWM_API.get(`event/${eventId}/suggest-music-config`)
  }

}

export default new SongsService()
