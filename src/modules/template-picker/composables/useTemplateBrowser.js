import { computed, ref, toValue, watch } from 'vue'
import { availableTags, canBrowse, filterTemplates } from '../utils/templatePicker'

/**
 * Search and filters over the list of templates. With two templates or fewer there is nothing to browse: the controls
 * hide and everything is shown. `list` is a ref or getter; `favorites` is the Set of favorite ids (also a ref or getter).
 */
export function useTemplateBrowser(list, favorites = () => new Set()) {
  const access = ref('all')
  const tag = ref('')
  const query = ref('')
  const favoritesOnly = ref(false)

  const enabled = computed(() => canBrowse(toValue(list)))
  const tags = computed(() => availableTags(toValue(list)))
  const active = computed(() => access.value !== 'all' || !!tag.value || !!query.value.trim() || favoritesOnly.value)
  const results = computed(() =>
    enabled.value
      ? filterTemplates(toValue(list), { access: access.value, tag: tag.value, query: query.value, favoritesOnly: favoritesOnly.value, favorites: toValue(favorites) })
      : toValue(list)
  )

  function clear() {
    access.value = 'all'
    tag.value = ''
    query.value = ''
    favoritesOnly.value = false
  }

  // A tag that disappeared (the list reloaded) must not leave an empty grid with no visible reason.
  watch(tags, value => {
    if (tag.value && !value.includes(tag.value)) tag.value = ''
  })

  return { access, tag, query, favoritesOnly, enabled, tags, active, results, clear }
}
