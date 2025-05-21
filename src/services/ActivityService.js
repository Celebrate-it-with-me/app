import { CWM_API } from './axios'

class ActivityService {
  async loadDashboardActivities({eventId}) {
    return CWM_API.get(`/event/${eventId}/dashboard-logs`)
  }
}

export default new ActivityService()
