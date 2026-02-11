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

      return await CWM_API.post(`event/${eventId}/comments`, {
        userId,
        origin,
        comment
      })
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

  async loadPublicComments({ eventId }) {
    return await CWM_API.get(`template/event/${eventId}/comments`)
  }

  async loadMoreComments(eventId, page) {
    return await CWM_API.get(`event/${eventId}/comments`, {
      params: {
        page: page
      }
    })
  }

  async loadMoreCommentsPublic(eventId, page) {
    return await CWM_API.get(`template/event/${eventId}/comments`, {
      params: {
        page: page
      }
    })
  }

  async loadNewComments({ eventId, currentPage, perPage, search }) {
    return await CWM_API.get(`event/${eventId}/comments`, {
      params: {
        page: currentPage,
        perPage,
        search
      }
    })
  }

  async loadCommentsPaginated({ eventId, currentPage, perPage, search }) {
    return await CWM_API.get(`event/${eventId}/comments/paginated`, {
      params: {
        page: currentPage,
        perPage,
        search
      }
    })
  }

  async addNewComment({ eventId, comment }) {
    return await CWM_API.post(`event/${eventId}/comments`, {
      comment
    })
  }

  async addNewCommentPublic({ eventId, accessCode, comment }) {
    return await CWM_API.post(`template/event/${eventId}/comments`, {
      accessCode,
      comment
    })
  }

  async toggleCommentVisibility({ eventId, commentId }) {
    return await CWM_API.patch(`event/${eventId}/comments/${commentId}/status`)
  }

  async updateStatus({ eventId, commentId, status }) {
    return await CWM_API.patch(`event/${eventId}/comments/${commentId}/status`, {
      status
    })
  }

  async deleteComment({ eventId, commentId }) {
    return await CWM_API.delete(`event/${eventId}/comments/${commentId}`)
  }

  async toggleCommentPin({ eventId, commentId }) {
    return await CWM_API.patch(`event/${eventId}/comments/${commentId}/pin`)
  }

  async toggleCommentFavorite({ eventId, commentId }) {
    return await CWM_API.patch(`event/${eventId}/comments/${commentId}/favorite`)
  }
}

export default new EventCommentsService()
