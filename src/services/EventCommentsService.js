import { CWM_API } from './axios'

class EventCommentsService {
  async createCommentsConfig({
                 eventId,
                 title,
                 subTitle,
                 backgroundColor,
                 commentsTitle,
                 maxComments
               }) {

    return CWM_API.post(`event/${eventId}/comments-config`, {
      title,
      subTitle,
      backgroundColor,
      commentsTitle,
      maxComments
    })
  }
}

export default new EventCommentsService()
