import { computed, ref, toValue } from 'vue'
import { readFavorites, writeFavorites } from '../utils/templatePicker'

/** Favorite templates, kept in this browser (localStorage, per user). `userId` may be a ref or a getter. */
export function useFavoriteTemplates(userId) {
  const ids = ref(new Set(readFavorites(toValue(userId) || 'anon')))
  const count = computed(() => ids.value.size)

  const isFavorite = id => ids.value.has(String(id))

  function toggle(id) {
    const next = new Set(ids.value)
    const key = String(id)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    ids.value = next
    writeFavorites(next, toValue(userId) || 'anon')
    return next.has(key)
  }

  return { ids, count, isFavorite, toggle }
}
