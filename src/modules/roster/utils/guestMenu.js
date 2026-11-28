import { Pencil, Languages, MessageCircle, Link as LinkIcon, CheckCheck, Undo2, Trash2 } from 'lucide-vue-next'
import { guestMenuEntries, localeFromValue, localeOptions, localeValue } from './roster'

export const MENU_ICONS = { edit: Pencil, locale: Languages, send: MessageCircle, copy: LinkIcon, confirm: CheckCheck, revert: Undo2, remove: Trash2 }

/** Items for UiDropdown (desktop): the language entry opens a submenu with the three choices. */
export function dropdownItems(family, { canEdit, t, eventLocale, act, onLocale }) {
  return guestMenuEntries(family, { canEdit, t }).map(entry => {
    const item = { ...entry, icon: MENU_ICONS[entry.key] }
    if (entry.key === 'locale') {
      item.radio = { value: localeValue(family), options: localeOptions(t, eventLocale), onChange: value => onLocale(family, localeFromValue(value)) }
    } else {
      item.onSelect = () => act(entry.key, family)
    }
    return item
  })
}
