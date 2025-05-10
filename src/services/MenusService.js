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

  async updateMenu(formValues, eventId){
    return await CWM_API.put(`event/${eventId}/menu/${formValues.id}`, {
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

  async loadRouteMenu({ eventId, menuId}){
    return await CWM_API.get(`event/${eventId}/menu/${menuId}`)
  }

  async deleteMenu(menuId, eventId) {
    return await CWM_API.delete(`event/${eventId}/menu/${menuId}`)
  }

  async removeMenuItem({ menuItem, eventId }) {
    return await CWM_API.delete(`event/${eventId}/menu/${menuItem.menu_id}/menu-item/${menuItem.id}`)
  }
}

export default new MenusServices()
