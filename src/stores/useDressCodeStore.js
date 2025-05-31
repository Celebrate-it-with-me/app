import { defineStore } from 'pinia'
import { useUserStore } from '@/stores/useUserStore'
import DressCodeService from '@/services/DressCodeService'

export const useDressCodeStore = defineStore('dressCodeStore',  {
  state: () => ({
    dressCode: {
      id: null,
      dressCodeType: '',
      description: '',
      reservedColors: [],
      dressCodeImages: []
    }
  }),
  actions: {
    async loadDressCode() {
      const userStore = useUserStore()

      const response = await DressCodeService.getDressCode({
        eventId: userStore.activeEvent
      })

      if (response.status === 200) {
        const { data } = response ?? {}
        console.log('Received dress code data from server:', data?.data)

        // Ensure we have the correct structure
        const dressCodeData = data?.data || {
          dressCodeType: '',
          description: '',
          reservedColors: [],
          dressCodeImages: []
        }

        // Make sure reservedColors is an array
        if (dressCodeData.reservedColors && !Array.isArray(dressCodeData.reservedColors)) {
          console.warn('reservedColors is not an array, converting:', dressCodeData.reservedColors)
          try {
            dressCodeData.reservedColors = JSON.parse(dressCodeData.reservedColors)
          } catch (e) {
            console.error('Failed to parse reservedColors:', e)
            dressCodeData.reservedColors = []
          }
        }

        // Make sure dressCodeImages is an array
        if (dressCodeData.dressCodeImages && !Array.isArray(dressCodeData.dressCodeImages)) {
          console.warn('dressCodeImages is not an array, converting:', dressCodeData.dressCodeImages)
          try {
            dressCodeData.dressCodeImages = JSON.parse(dressCodeData.dressCodeImages)
          } catch (e) {
            console.error('Failed to parse dressCodeImages:', e)
            dressCodeData.dressCodeImages = []
          }
        }

        this.dressCode = dressCodeData
        console.log('Updated store with dress code data:', this.dressCode)
      } else {
        console.error('Failed to load dress code:', response)
      }

    },

    async addDressCode({ dressCodeType, description, reservedColors, dressCodeImages })
    {
      try {
        const formData = new FormData()

        formData.append('dressCodeType', dressCodeType)
        formData.append('description', description)

        formData.append('reservedColors', JSON.stringify(reservedColors))

        if (dressCodeImages.length > 0) {
          dressCodeImages.forEach((file, index) => {
            formData.append(`dressCodeImages[${index}]`, file)
          })
        }

        return await DressCodeService.createDressCode({
          eventId: useUserStore().activeEvent,
          formData
        })

      } catch (error) {
        console.error('Error creating dress code:', error)
        throw error
      }
    },

    async updateDressCode({ dressCodeType, description, reservedColors, dressCodeImages })
    {
      try {
        const formData = new FormData()

        formData.append('dressCodeType', dressCodeType)
        formData.append('description', description)
        formData.append('reservedColors', JSON.stringify(reservedColors))
        formData.append('_method', 'PUT')

        // Handle both new file uploads and existing images
        if (dressCodeImages.length > 0) {
          // Track existing image IDs to preserve them
          const existingImageIds = []

          dressCodeImages.forEach((file, index) => {
            if (file instanceof File) {
              // New file upload
              formData.append(`dressCodeImages[${index}]`, file)
            } else if (file && file.id) {
              // Existing image with ID
              existingImageIds.push(file.id)
            }
          })

          // Include existing image IDs in the request
          if (existingImageIds.length > 0) {
            formData.append('existingImageIds', JSON.stringify(existingImageIds))
          }
        }

        return await DressCodeService.updateDressCode({
          eventId: useUserStore().activeEvent,
          dressCodeId: this.dressCode.id,
          formData
        })

      } catch (error) {
        console.error('Error updating dress code:', error)
        throw error
      }
    }
  },
  getters: {
    hasDressCode() {
      return this.dressCode.dressCodeType !== ''
    }
  }
})
