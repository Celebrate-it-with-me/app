import { CWM_API } from './axios'

class EventCommentsService {
  async createCommentsConfig({
                               eventId,
                               title,
                               subTitle,
                               backgroundColor,
                               commentsTitle,
                               buttonColor,
                               buttonText,
                               maxComments
               }) {

    return await CWM_API.post(`event/${eventId}/comments-config`, {
      title,
      subTitle,
      backgroundColor,
      commentsTitle,
      buttonColor,
      buttonText,
      maxComments
    })
  }

  async loadCommentConfig({ eventId }) {
    return await CWM_API.get(`event/${eventId}/comments-config`)
  }

  async updateCommentsConfig({
                               eventId,
                               id,
                               title,
                               subTitle,
                               backgroundColor,
                               commentsTitle,
                               buttonColor,
                               buttonText,
                               maxComments
                             }){
    return await CWM_API.put(`event/${eventId}/comments-config/${id}`, {
      title,
      subTitle,
      backgroundColor,
      commentsTitle,
      buttonColor,
      buttonText,
      maxComments
    })
  }
}

export default new EventCommentsService()
