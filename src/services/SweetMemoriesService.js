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

  async uploadSweetMemoriesImages(files, eventId) {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })
    return await CWM_API.post(`event/${eventId}/sweet-memories-images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

export default new SweetMemoriesService()
