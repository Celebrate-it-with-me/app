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

  async addComment({ eventId, userId, origin, comment }) {
    return CWM_API.get('sanctum/csrf-cookie', {
      baseURL: import.meta.env.VITE_API_URL,
    }).then(async () => {
      return await CWM_API.post(`event/${eventId}/comments`, {
        userId,
        origin,
        comment
      })
    })
  }

  async loadComments(eventId) {
    return await CWM_API.get(`event/${eventId}/comments`)
  }

  async loadMoreComments(eventId, page) {
    console.log('in load more comments')
    return await CWM_API.get(`event/${eventId}/comments`,{
      params: {
        page: page
      }
    })
  }
}

export default new EventCommentsService()
