import { CWM_API } from './axios'

class MenusServices {

  async loadMenu({ eventId }) {
    return CWM_API.get(`event/${eventId}/menu`)
  }

  async createMenu(formValues, eventId){
    return CWM_API.post(`event/${eventId}/menu`, {
      title: formValues.title,
      description: formValues.description,
      allowMultipleChoices: formValues.allowMultipleChoices,
      allowCustomRequest: formValues.allowCustomRequest,
    })
  }

  async addMenuItem(menuItem, eventId) {
    return CWM_API.post(`event/${eventId}/menu/${menuItem.menu_id}/menu-item`, {
      name: menuItem.name,
      itemType: menuItem.itemType,
      dietType: menuItem.dietType,
      notes: menuItem.notes,
    })
  }
}

export default new MenusServices()
