import { CWM_API } from './axios'

class MenusServices {

  async loadMenus({ eventId }) {
    return await CWM_API.get(`event/${eventId}/menus`)
  }

  async createMenu(formValues, eventId){
    console.log('checking form values', formValues)

    return await CWM_API.post(`event/${eventId}/menus`, {
      title: formValues.title,
      description: formValues.description,
      allowMultipleChoices: formValues.allow_multiple_choices,
      allowCustomRequest: formValues.allow_custom_request,
      isDefault: formValues.main_menu,
    })
  }

  async updateMenu(formValues, eventId){
    return await CWM_API.put(`event/${eventId}/menus/${formValues.id}`, {
      title: formValues.title,
      description: formValues.description,
      allowMultipleChoices: formValues.allow_multiple_choices,
      allowCustomRequest: formValues.allow_custom_request,
      isDefault: formValues.main_menu,
    })
  }

  async addMenuItem({ menuItem, menuId, eventId }) {
    return await CWM_API.post(`event/${eventId}/menus/${menuId}/menu-item`, {
      ...menuItem,
    })
  }

  async loadRouteMenu({ eventId, menuId}){
    return await CWM_API.get(`event/${eventId}/menus/${menuId}`)
  }

  async deleteMenu(menuId, eventId) {
    return await CWM_API.delete(`event/${eventId}/menus/${menuId}`)
  }

  async removeMenuItem({ menuItem, eventId }) {
    return await CWM_API.delete(`event/${eventId}/menus/${menuItem.menu_id}/menu-item/${menuItem.id}`)
  }

  async loadGuestMenu({ eventId }) {
    return await CWM_API.get(`event/${eventId}/menus/guests`)
  }

  async exportGuestsMenu({ eventId }) {
    return await CWM_API.get(`event/${eventId}/menus/guests/download`, {
      responseType: 'blob'
    })
  }
}

export default new MenusServices()
