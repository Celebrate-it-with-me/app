import { CWM_API } from '@/services/axios'

class SweetMemoriesService {
  async createSweetMemoriesConfig({ eventId, title, subTitle, backgroundColor, maxPictures }) {
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

  async updateSweetMemoriesConfig({ eventId, id, title, subTitle, backgroundColor, maxPictures }) {
    return await CWM_API.put(`event/${eventId}/sweet-memories-config/${id}`, {
      title,
      subTitle,
      backgroundColor,
      maxPictures
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
    return await CWM_API.get(`event/${eventId}/comments`, {
      params: {
        page: page
      }
    })
  }

  async uploadSweetMemoriesImages(files, eventId) {
    const genericFormData = this.prepareFormData(files)

    return await CWM_API.post(`event/${eventId}/sweet-memories-images`, genericFormData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  async updateSweetMemoriesImages({ eventId, files }) {
    console.log('in update sweetMemoriesImages in service', files)

    const genericFormData = this.prepareFormData(files)
    genericFormData.append('_method', 'PUT')

    return await CWM_API.post(`event/${eventId}/sweet-memories-images`, genericFormData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  async loadSweetMemoriesImages(eventId) {
    return await CWM_API.get(`event/${eventId}/sweet-memories-images`)
  }

  prepareFormData(files) {
    const formData = new FormData()

    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file.file)
      formData.append(`metadata[${index}][name]`, file.name)
      formData.append(`metadata[${index}][size]`, file.size)
    })

    return formData
  }

  async removeSweetMemoriesImage(eventId, fileId) {
    return await CWM_API.delete(`event/${eventId}/sweet-memories-images/${fileId}`)
  }

  async updateImageName(imageId, name) {
    return await CWM_API.patch(`sweet-memories-images/${imageId}`, {
      name
    })
  }

  //---- Sweet Memories V2 (Updated to match backend) ---- //
  async createSweetMemory({ eventId, title, description, year, visible, image, order }) {
    const formData = new FormData()

    if (image && image.length > 0) {
      image.forEach((img, index) => {
        if (img instanceof File) {
          formData.append(`files[${index}]`, img)
          formData.append(`metadata[${index}][name]`, img.name)
          formData.append(`metadata[${index}][size]`, img.size)
        }
      })
    }

    formData.append('title', title || '')
    formData.append('description', description || '')
    formData.append('year', year || '')
    formData.append('visible', visible ? 1 : 0)
    formData.append('order', order || 0)

    return await CWM_API.post(`event/${eventId}/sweet-memories-images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  async updateSweetMemory({ eventId, id, title, description, year, visible, image, order }) {
    const formData = new FormData()

    if (image && image.length > 0) {
      image.forEach((img, index) => {
        if (img instanceof File) {
          formData.append(`files[${index}]`, img)
          formData.append(`metadata[${index}][name]`, img.name)
          formData.append(`metadata[${index}][size]`, img.size)
        }
      })
    }

    formData.append('title', title || '')
    formData.append('description', description || '')
    formData.append('year', year || '')
    formData.append('visible', visible ? 1 : 0)
    formData.append('order', order || 0)
    formData.append('_method', 'PUT')

    return await CWM_API.post(`event/${eventId}/sweet-memories-images/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  async loadSweetMemoriesV2({ eventId }) {
    return await CWM_API.get(`event/${eventId}/sweet-memories-images`)
  }

  async deleteSweetMemory({ eventId, id }) {
    return await CWM_API.delete(`event/${eventId}/sweet-memories-images/${id}`)
  }
}

export default new SweetMemoriesService()
