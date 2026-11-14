<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Download, FileSpreadsheet, PartyPopper } from 'lucide-vue-next'
import { UiButton, UiDropdown, useToast } from '@/ui'
import RosterService from '../services/RosterService'
import { saveBlob } from '../utils/roster'

const props = defineProps({
  eventId: { type: [Number, String], required: true },
  /** The tab of the screen: 'all', 'attending', 'pending' or 'not-attending'. */
  status: { type: String, default: 'all' },
  search: { type: String, default: '' }
})

const { t, locale } = useI18n()
const { success, error: showError } = useToast()
const busy = ref(false)

const filtered = computed(() => props.status !== 'all' || !!props.search.trim())
const tabName = computed(() => (props.status !== 'all' ? t(`app.roster.tabs.${props.status}`) : t('app.roster.title')))

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
      onSelect: () => run(() => RosterService.download(props.eventId, { status: props.status, search: props.search.trim(), locale: locale.value }))
    })
  }
  list.push(
    {
      label: t('app.roster.download.all'),
      icon: FileSpreadsheet,
      onSelect: () => run(() => RosterService.download(props.eventId, { locale: locale.value }))
    },
    {
      label: t('app.roster.download.venue'),
      icon: PartyPopper,
      separator: true,
      onSelect: () => run(() => RosterService.downloadVenue(props.eventId, { locale: locale.value }))
    }
  )
  return list
})
</script>

<template>
  <UiDropdown :items="items">
    <template #trigger>
      <UiButton variant="secondary" :loading="busy" :aria-label="t('app.roster.download.label')">
        <Download class="h-4 w-4" aria-hidden="true" />
        {{ t('app.roster.download.button') }}
      </UiButton>
    </template>
  </UiDropdown>
</template>
