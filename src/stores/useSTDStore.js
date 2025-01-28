import { defineStore } from 'pinia'
import STDService from '../services/STDService'
import { useEventsStore } from './useEventsStore'

export const useSTDStore = defineStore('stdStore', {
  state: () => ({
    stdTitle: '',
    stdSubTitle: '',
    backgroundColor: '',
    image: null,
    useCountDown: false,
    useAddToCalendar: false,
    isEnabled: false
  }),
  actions: {
    async createSTD({ stdTitle, stdSubTitle, backgroundColor, image, useCountdown, useAddToCalendar }) {
      const eventsStore = useEventsStore()

      return await STDService.createSTD({
        eventId: eventsStore?.currentEvent.id,
        stdTitle,
        stdSubTitle,
        backgroundColor,
        image,
        useCountdown,
        useAddToCalendar,
        isEnabled: this.isEnabled
      })
    }
  }
})
