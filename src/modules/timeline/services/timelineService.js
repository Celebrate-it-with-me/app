import { CWM_API } from '@/services/axios'
import { format, parse } from 'date-fns'

class TimelineService {
  /**
   * Helper to format date for backend (YYYY-MM-DD HH:mm:ss)
   * @param {string} dateStr - Date string in format MM/dd/yyyy HH:mm
   * @returns {string|null} Formatted date string or null
   */
  formatDateForBackend(dateStr) {
    if (!dateStr) return null
    try {
      // CDate.vue uses toLocaleString('en-US') which might produce "MM/DD/YYYY, HH:mm" or "MM/DD/YYYY HH:mm"
      // or even "MM/DD/YYYY 24:00" depending on environment.
      // A more robust way is to use native Date constructor if it's already a valid date string
      const date = new Date(dateStr)
      if (!isNaN(date.getTime())) {
        return format(date, 'yyyy-MM-dd HH:mm:ss')
      }

      // Fallback: try parsing the common format emitted by CDate
      // removing possible comma from toLocaleString
      const cleanDateStr = dateStr.replace(',', '')
      const parsedDate = parse(cleanDateStr, 'MM/dd/yyyy HH:mm', new Date())
      if (!isNaN(parsedDate.getTime())) {
        return format(parsedDate, 'yyyy-MM-dd HH:mm:ss')
      }

      return dateStr
    } catch (error) {
      console.error('Error formatting date for backend:', error)
      return dateStr
    }
  }

  /**
   * List timelines for an event
   * GET /event/{event}/timeline
   */
  async getTimelines(eventId) {
    return CWM_API.get(`event/${eventId}/timeline`)
  }

  /**
   * Create timeline for an event
   * POST /event/{event}/timeline
   */
  async createTimeline(eventId, timelineData) {
    const data = {
      ...timelineData,
      start_time: this.formatDateForBackend(timelineData.start_time),
      end_time: this.formatDateForBackend(timelineData.end_time)
    }
    return CWM_API.post(`event/${eventId}/timeline`, data)
  }

  /**
   * Update timeline
   * PUT /event/{event}/timeline/{id}
   */
  async updateTimeline(eventId, id, timelineData) {
    const data = {
      ...timelineData,
      start_time: this.formatDateForBackend(timelineData.start_time),
      end_time: this.formatDateForBackend(timelineData.end_time)
    }
    return CWM_API.put(`event/${eventId}/timeline/${id}`, data)
  }

  /**
   * Delete timeline
   * DELETE /event/{event}/timeline/{id}
   */
  async deleteTimeline(eventId, id) {
    return CWM_API.delete(`event/${eventId}/timeline/${id}`)
  }
}

export default new TimelineService()
