import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { FileSpreadsheet, PartyPopper } from 'lucide-vue-next'
import { useToast } from '@/ui'
import RosterService from '../services/RosterService'
import { saveBlob } from '../utils/roster'

/**
 * The download choices of the guest list (this list, everyone, for the venue) and whether one is running. Shared by the
 * "Descargar" button and by the phones' "⋯" menu. `get` returns `{ eventId, status, search }`.
 */
export function useRosterDownload(get) {
  const p = get
  const { t, locale } = useI18n()
  const { success, error: showError } = useToast()
  const busy = ref(false)

  const filtered = computed(() => p().status !== 'all' || !!p().search.trim())
  const tabName = computed(() => (p().status !== 'all' ? t(`app.roster.tabs.${p().status}`) : t('app.roster.title')))

  async function run(request) {
    if (busy.value) return
    busy.value = true
    try {
      const { blob, filename } = await request()
      saveBlob(blob, filename)
      success(t('app.roster.download.done'))
    } catch (e) {
      showError(t(e?.response?.status === 429 ? 'app.roster.download.tooMany' : 'app.roster.download.error'))
    } finally {
      busy.value = false
    }
  }

  const items = computed(() => {
    const list = []
    if (filtered.value) {
      list.push({
        label: t('app.roster.download.current', { tab: tabName.value }),
        icon: FileSpreadsheet,
        onSelect: () => run(() => RosterService.download(p().eventId, { status: p().status, search: p().search.trim(), locale: locale.value }))
      })
    }
    list.push(
      {
        label: t('app.roster.download.all'),
        icon: FileSpreadsheet,
        onSelect: () => run(() => RosterService.download(p().eventId, { locale: locale.value }))
      },
      {
        label: t('app.roster.download.venue'),
        icon: PartyPopper,
        separator: true,
        onSelect: () => run(() => RosterService.downloadVenue(p().eventId, { locale: locale.value }))
      }
    )
    return list
  })
  return { items, busy }
}
