import { CWM_API } from './axios'

class STDService {
  async createSTD({
    stdTitle,
    stdSubTitle,
    backgroundColor,
    image,
    useCountdown,
    useAddToCalendar,
    isEnabled,
    eventId
  }) {
    try {
      const formData = new FormData()

      formData.append('stdTitle', stdTitle || '')
      formData.append('stdSubtitle', stdSubTitle || '')
      formData.append('backgroundColor', backgroundColor || '')
      formData.append('useCountdown', useCountdown || '')
      formData.append('useAddToCalendar', useAddToCalendar || '')
      formData.append('isEnabled', isEnabled || '')

      if (image instanceof File) {
        formData.append('image', image)
      }

      return await CWM_API.post(`event/${eventId}/save-the-date`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    } catch (error) {
      console.log('Error saving the Save the date data: ', error)

      throw error
    }
  }

  async getMyEvents() {
    return CWM_API.get(`event`)
  }
}

export default new STDService()
