<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Ellipsis, Mail, RefreshCw, ShieldCheck, Eye, Trash2, X } from 'lucide-vue-next'
import { UiAvatar, UiBadge, UiButton, UiDropdown } from '@/ui'
import { resolveAvatarUrl } from '@/utils/avatar'
import { rowActions, statusTone } from '../utils/collaborators'

const props = defineProps({
  row: { type: Object, required: true },
  /** Whether the person looking can manage access (shows the actions menu). */
  manage: { type: Boolean, default: false },
  busy: { type: Boolean, default: false }
})
const emit = defineEmits(['action'])

const { t } = useI18n()

const ICONS = { resend: RefreshCw, cancel: X, makeEditor: ShieldCheck, makeViewer: Eye, remove: Trash2 }
const items = computed(() =>
  rowActions(props.row).map(action => ({
    label: t(`app.collaborators.actions.${action}`),
    icon: ICONS[action],
    danger: action === 'remove' || action === 'cancel',
    separator: action === 'remove' || action === 'cancel',
    onSelect: () => emit('action', action, props.row)
  }))
)
const showStatus = computed(() => props.row.type === 'invite')
</script>

<template>
  <li class="flex items-center gap-3 px-4 py-3" :data-testid="`collaborator-${row.key}`">
    <UiAvatar v-if="row.type === 'member'" :name="row.name" :src="resolveAvatarUrl(row.avatarUrl)" size="md" />
    <span v-else class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-200 text-ink-600" aria-hidden="true">
      <Mail class="h-5 w-5" />
    </span>
    <div class="min-w-0 flex-1">
      <p class="truncate text-base font-medium text-ink-900">{{ row.name }}</p>
      <p v-if="row.email && row.email !== row.name" class="truncate text-sm text-ink-500">{{ row.email }}</p>
      <div class="mt-1 flex flex-wrap gap-1.5">
        <UiBadge :tone="row.role === 'owner' ? 'rose' : 'neutral'" size="sm">{{ t(`app.collaborators.roles.${row.role}`) }}</UiBadge>
        <UiBadge v-if="showStatus" :tone="statusTone(row.status)" size="sm" dot>{{ t(`app.collaborators.status.${row.status}`) }}</UiBadge>
      </div>
    </div>
    <UiDropdown v-if="manage && items.length" :items="items">
      <template #trigger>
        <UiButton icon variant="ghost" :disabled="busy" :aria-label="t('app.collaborators.actionsFor', { name: row.name })">
          <Ellipsis class="h-5 w-5" aria-hidden="true" />
        </UiButton>
      </template>
    </UiDropdown>
  </li>
</template>
