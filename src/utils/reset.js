import { getActivePinia } from 'pinia'

export const smartResetAllStores = () => {
  getActivePinia()._s.forEach(store => {
    const hasManualReset = typeof store.reset === 'function'
    const hasOptionReset = typeof store.$reset === 'function'

    try {
      if (hasManualReset) {
        store.reset()
      } else if (hasOptionReset) {
        store.$reset()
      } else {
        console.warn(`⚠️ Store "${store.$id}" has no reset method.`)
      }
    } catch (err) {
      console.error(`❌ Error resetting store "${store.$id}"`, err)
    }
  })
}
