import { CWM_API } from './axios'

class MenusServices {

  async loadMenu({ eventId }) {
    return await CWM_API.get(`event/${eventId}/menu`)
  }

  async createMenu(formValues, eventId){
    return await CWM_API.post(`event/${eventId}/menu`, {
      title: formValues.title,
      description: formValues.description,
      allowMultipleChoices: formValues.allowMultipleChoices,
      allowCustomRequest: formValues.allowCustomRequest,
    })
  }

  async addMenuItem({ menuItem, menuId, eventId }) {
    return await CWM_API.post(`event/${eventId}/menu/${menuId}/menu-item`, {
      ...menuItem,
    })
  }
}

export default new MenusServices()
