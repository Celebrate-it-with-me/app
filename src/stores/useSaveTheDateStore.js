import { defineStore } from 'pinia'
import STDService from '../services/STDService'
import { useEventsStore } from './useEventsStore'
import { useUserStore } from './useUserStore'

export const useSaveTheDateStore = defineStore('stdStore', {
  state: () => ({
    id: null,
    title: '',
    titleStyles: {
      fontSize: '24px',
      color: '#000000',
      fontWeight: 'bold',
      textAlign: 'center',
      fontFamily: 'Arial, Helvetica, sans-serif',
    },
    message: '',
    messageStyles: {
      fontSize: '16px',
      color: '#000000',
      fontWeight: 'normal',
      textAlign: 'center',
      fontFamily: 'Arial, Helvetica, sans-serif',
    },
    useCountdown: false,
    useAddToCalendar: false,
    hasPreviousStd: false
  }),
  actions: {
    initStd(legacyStd) {
      console.log(legacyStd)
      if (Object.keys(legacyStd).length) {
        this.id = legacyStd.id
        this.hasPreviousStd = true
        this.stdTitle = legacyStd.stdTitle || ''
        this.stdSubTitle = legacyStd.stdSubTitle || ''
        this.backgroundColor = legacyStd.backgroundColor || ''
        this.image = legacyStd.imageUrl || null
        this.useCountdown = !!legacyStd.useCountdown
        this.useAddToCalendar = !!legacyStd.useAddToCalendar
        this.isEnabled = !!legacyStd.isEnabled
      }
    },

    cleanStd() {
        this.id = null
        this.hasPreviousStd = false
        this.stdTitle = ''
        this.stdSubTitle = ''
        this.backgroundColor = ''
        this.image = null
        this.useCountdown = false
        this.useAddToCalendar = false
        this.isEnabled = false
    },


    async createSTD({ stdTitle, stdSubTitle, backgroundColor, image, useCountdown, useAddToCalendar, isEnabled }) {
      const eventsStore = useEventsStore()

      return await STDService.createSTD({
        eventId: eventsStore?.currentEvent?.id,
        stdTitle,
        stdSubTitle,
        backgroundColor,
        image,
        useCountdown,
        useAddToCalendar,
        isEnabled
      })
    },

    async updateSTD({ stdTitle, stdSubTitle, backgroundColor, image, useCountdown, useAddToCalendar, isEnabled }) {
      return await STDService.updateSTD({
        stdId: this.id,
        stdTitle,
        stdSubTitle,
        backgroundColor,
        image,
        useCountdown,
        useAddToCalendar,
        isEnabled
      })
    },

    async getEventStd() {
      const userStore = useUserStore()

      return await STDService.getEventSTD({
        eventId: userStore.currentEventId
      })
    }
  }
})
