import { CWM_API } from './axios'

class STDService {
  /**
   * Prepares the FormData object for STD requests.
   * @param {Object} params - The parameters for preparing FormData.
   */
  prepareSTDFormData({
                       stdTitle = '',
                       stdSubtitle = '',
                       backgroundColor = '',
                       image,
                       useCountdown = '',
                       useAddToCalendar = '',
                       isEnabled = ''
                     }) {
    const formData = new FormData();
    formData.append('stdTitle', stdTitle);
    formData.append('stdSubtitle', stdSubtitle);
    formData.append('backgroundColor', backgroundColor);
    formData.append('useCountdown', useCountdown);
    formData.append('useAddToCalendar', useAddToCalendar);
    formData.append('isEnabled', isEnabled);
    if (image instanceof File) {
      formData.append('image', image);
    }
    return formData;
  }

  async createSTD({ eventId, ...params }) {
    try {
      const formData = this.prepareSTDFormData(params);
      return await CWM_API.post(`event/${eventId}/save-the-date`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.log('Error saving the Save the Date data: ', error);
      throw error;
    }
  }

  async updateSTD({ stdId, ...params }) {
    try {
      const formData = this.prepareSTDFormData(params);
      formData.append('_method', 'PUT')

      return await CWM_API.post(`save-the-date/${stdId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.log('Error updating the Save the Date data: ', error);
      throw error;
    }
  }

  async getEventSTD({ eventId }) {
    return CWM_API.get(`event/${eventId}/save-the-date`);
  }
}

export default new STDService()
