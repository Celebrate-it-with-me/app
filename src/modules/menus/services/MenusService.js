import { CWM_API } from '@/services/axios'
import { toMenuPayload } from '@/modules/menus/utils/menus'

class MenusService {
  async loadMenus({ eventId }) {
    return await CWM_API.get(`event/${eventId}/menus`)
  }

  async createMenu(formValues, eventId) {
    return await CWM_API.post(`event/${eventId}/menus`, toMenuPayload(formValues))
  }

  async updateMenu(formValues, eventId) {
    return await CWM_API.put(`event/${eventId}/menus/${formValues.id}`, toMenuPayload(formValues))
  }

  async addMenuItem({ menuItem, menuId, eventId }) {
    return await CWM_API.post(`event/${eventId}/menus/${menuId}/menu-item`, {
      ...menuItem
    })
  }

  async loadRouteMenu({ eventId, menuId }) {
    return await CWM_API.get(`event/${eventId}/menus/${menuId}`)
  }

  async deleteMenu(menuId, eventId) {
    return await CWM_API.delete(`event/${eventId}/menus/${menuId}`)
  }

  async removeMenuItem({ menuItem, eventId }) {
    return await CWM_API.delete(
      `event/${eventId}/menus/${menuItem.menu_id}/menu-item/${menuItem.id}`
    )
  }

  async loadGuestMenu({ eventId, page = 1, perPage = 10 }) {
    return await CWM_API.get(`event/${eventId}/menus/guests`, {
      params: { page, per_page: perPage }
    })
  }

  async exportGuestsMenu({ eventId }) {
    return await CWM_API.get(`event/${eventId}/menus/guests/download`, {
      responseType: 'blob'
    })
  }
}

export default new MenusService()
