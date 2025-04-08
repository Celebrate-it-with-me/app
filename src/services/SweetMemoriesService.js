import { CWM_API } from './axios'

class SweetMemoriesService {
  async createSweetMemoriesConfig({
                               eventId,
                               title,
                               subTitle,
                               backgroundColor,
                               maxPictures,
               }) {

    return await CWM_API.post(`event/${eventId}/sweet-memories-config`, {
      title,
      subTitle,
      backgroundColor,
      maxPictures
    })
  }

  async loadSweetMemoriesConfig({ eventId }) {
    return await CWM_API.get(`event/${eventId}/sweet-memories-config`)
  }

  async updateSweetMemoriesConfig({
                               eventId,
                               id,
                               title,
                               subTitle,
                               backgroundColor,
                               maxPictures
                             }){
    return await CWM_API.put(`event/${eventId}/sweet-memories-config/${id}`, {
      title,
      subTitle,
      backgroundColor,
      maxPictures,
    })
  }

  async addComment({ eventId, userId, origin, comment }) {
    return await CWM_API.post(`event/${eventId}/comments`, {
      userId,
      origin,
      comment
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

export default new SweetMemoriesService()
