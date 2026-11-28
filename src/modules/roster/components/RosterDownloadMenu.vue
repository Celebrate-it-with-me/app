<script setup>
import { useI18n } from 'vue-i18n'
import { Download } from 'lucide-vue-next'
import { UiButton, UiDropdown } from '@/ui'
import { useRosterDownload } from '../composables/useRosterDownload'

const props = defineProps({
  eventId: { type: [Number, String], required: true },
  /** The tab of the screen: 'all', 'attending', 'pending' or 'not-attending'. */
  status: { type: String, default: 'all' },
  search: { type: String, default: '' }
})

const { t } = useI18n()
const { items, busy } = useRosterDownload(() => props)
</script>

<template>
  <UiDropdown :items="items">
    <template #trigger>
      <UiButton variant="secondary" class="w-full md:w-auto" :loading="busy" :aria-label="t('app.roster.download.label')">
        <Download class="h-4 w-4" aria-hidden="true" />
        {{ t('app.roster.download.button') }}
      </UiButton>
    </template>
  </UiDropdown>
</template>
