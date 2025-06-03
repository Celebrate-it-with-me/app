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
  }) {
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
    try {
      // Log para debug
      console.log('Request parameters:', { eventId, userId, origin, comment })

      await CWM_API.get('sanctum/csrf-cookie', {
        baseURL: import.meta.env.VITE_API_URL
      })

      const response = await CWM_API.post(`event/${eventId}/comments`, {
        userId,
        origin,
        comment
      })

      return response
    } catch (error) {
      // Log detallado del error
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      throw error
    }
  }

  async loadComments({ eventId }) {
    return await CWM_API.get(`event/${eventId}/comments`)
  }

  async loadMoreComments(eventId, page) {
    return await CWM_API.get(`event/${eventId}/comments`, {
      params: {
        page: page
      }
    })
  }

  async loadNewComments({ eventId, currentPage, perPage, search }) {
    return await CWM_API.get(`event/${eventId}/event-comments`, {
      params: {
        page: currentPage,
        perPage,
        search
      }
    })
  }

  async addNewComment({ eventId, comment }) {
    return await CWM_API.post(`event/${eventId}/event-comments`, {
      comment,
      origin: 'admin'
    })
  }

  async toggleCommentVisibility({ eventId, commentId }) {
    return await CWM_API.patch(`event/${eventId}/event-comments/${commentId}/toggle-visibility`)
  }

  async deleteComment({ eventId, commentId }) {
    return await CWM_API.delete(`event/${eventId}/event-comments/${commentId}`)
  }
}

export default new EventCommentsService()
