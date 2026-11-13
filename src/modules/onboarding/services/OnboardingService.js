import { CWM_API } from '@/services/axios'

class OnboardingService {
  /** Progress of the four first steps of an event. */
  async progress(eventId) {
    return (await CWM_API.get(`/event/${eventId}/onboarding`)).data.data
  }
}

export default new OnboardingService()
