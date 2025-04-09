import { CWM_API } from './axios'

class BackgroundMusicService {
  async create({
                 eventId,
                 iconSize,
                 iconColor,
                 iconPosition,
                 autoplay,
                 songFile
               }) {

    const formData =  new FormData()

    formData.append('iconSize', iconSize)
    formData.append('iconColor', iconColor)
    formData.append('iconPosition', iconPosition)
    formData.append('autoplay', autoplay)
    formData.append('songFile', songFile)

    return CWM_API.post(`event/${eventId}/background-music`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  async update({
                 backgroundMusicId,
                 iconSize,
                 iconColor,
                 iconPosition,
                 autoplay,
                 songFile
               }) {

    const formData =  new FormData()

    formData.append('iconSize', iconSize)
    formData.append('iconColor', iconColor)
    formData.append('iconPosition', iconPosition)
    formData.append('autoplay', autoplay)
    formData.append('songFile', songFile)

    return CWM_API.post(`background-music/${backgroundMusicId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  async load({ eventId }){
    return CWM_API.get(`event/${eventId}/background-music`)
  }

}

export default new BackgroundMusicService()
