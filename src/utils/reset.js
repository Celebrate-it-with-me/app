import { getActivePinia } from 'pinia'

export const smartResetAllStores = () => {
  console.log('🧹 Running smartResetAllStores...')
  getActivePinia()._s.forEach(store => {
    const hasManualReset = typeof store.reset === 'function'
    const hasOptionReset = typeof store.$reset === 'function'

    console.log(`→ Resetting store "${store.$id}"`, {
      hasManualReset,
      hasOptionReset
    })

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
