<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Ellipsis, Mail, RefreshCw, ShieldCheck, Eye, Trash2, X } from 'lucide-vue-next'
import { activityTime } from '@/views/internal/dashboard/dashboardLogic'
import { UiAvatar, UiBadge, UiButton, UiDropdown } from '@/ui'
import { resolveAvatarUrl } from '@/utils/avatar'
import { LOCKED_ACTIONS, rowActions, statusTone } from '../utils/collaborators'

const props = defineProps({
  row: { type: Object, required: true },
  /** Whether the person looking can manage access (shows the actions menu). */
  manage: { type: Boolean, default: false },
  busy: { type: Boolean, default: false },
  /** The plan does not include collaborators: removing and cancelling stay, the rest is disabled. */
  locked: { type: Boolean, default: false },
  /** The signed-in person is this row: shows the "You" chip. */
  isMe: { type: Boolean, default: false }
})
const emit = defineEmits(['action'])

const { t, locale } = useI18n()

const ICONS = { resend: RefreshCw, cancel: X, makeEditor: ShieldCheck, makeViewer: Eye, remove: Trash2 }
const items = computed(() =>
  rowActions(props.row).map(action => ({
    label: t(`app.collaborators.actions.${action}`),
    icon: ICONS[action],
    disabled: props.locked && LOCKED_ACTIONS.includes(action),
    danger: action === 'remove' || action === 'cancel',
    separator: action === 'remove' || action === 'cancel',
    onSelect: () => emit('action', action, props.row)
  }))
)
const showStatus = computed(() => props.row.type === 'invite')
// Pending and declined invitations can be resent from the row itself, not only from the menu.
const canResend = computed(() => props.manage && showStatus.value && rowActions(props.row).includes('resend'))
/** "Enviada hace 3 días" / "hace 1 día" (the chip already says Rechazada); empty while the API sends no date. */
const when = computed(() => {
  const { status, sentAt, declinedAt } = props.row
  const at = status === 'declined' ? declinedAt ?? sentAt : sentAt
  if (!at || !showStatus.value || Number.isNaN(new Date(at).getTime())) return ''
  return t(status === 'declined' ? 'app.collaborators.declinedAgo' : 'app.collaborators.sentAgo', { when: activityTime({ occurredAt: at }, locale.value) })
})
</script>

<template>
  <li class="flex flex-wrap items-center gap-x-3 gap-y-2 py-3 pl-4 lg:pr-4 fab-safe md:flex-nowrap" :data-testid="`collaborator-${row.key}`">
    <UiAvatar v-if="row.type === 'member'" :name="row.name" :src="resolveAvatarUrl(row.avatarUrl)" size="md" />
    <span v-else class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-200 text-ink-600" aria-hidden="true">
      <Mail class="h-5 w-5" />
    </span>
    <div class="min-w-0 flex-1">
      <p class="flex min-w-0 items-center text-base font-medium text-ink-900">
        <span class="truncate" :title="row.name">{{ row.name }}</span>
        <span v-if="isMe" class="ml-1.5 shrink-0 rounded-full bg-ink-900 px-2 text-[11px] font-semibold text-white" data-testid="me-chip">{{ t('app.collaborators.you') }}</span>
      </p>
      <p v-if="row.email && row.email !== row.name" class="truncate text-sm text-ink-500" :title="row.email">{{ row.email }}</p>
      <div class="mt-1 flex flex-wrap gap-1.5">
        <UiBadge :tone="row.role === 'owner' ? 'rose' : 'neutral'" size="sm">{{ t(`app.collaborators.roles.${row.role}`) }}</UiBadge>
        <UiBadge v-if="showStatus" :tone="statusTone(row.status)" size="sm" dot>{{ t(`app.collaborators.status.${row.status}`) }}</UiBadge>
        <span v-if="when" class="self-center text-xs text-ink-500" data-testid="invite-when">{{ when }}</span>
      </div>
    </div>
    <div v-if="canResend" class="order-last w-full pl-[52px] md:order-none md:w-auto md:pl-0">
      <button
        type="button"
        class="relative inline-flex h-8 items-center gap-1.5 rounded-full border border-cream-300 bg-white px-3 text-[13px] font-semibold text-ink-900 transition-colors hover:bg-cream-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:text-ink-400 touch-target"
        :disabled="busy || locked"
        :aria-label="t('app.collaborators.resendFor', { name: row.name })"
        data-testid="resend-button"
        @click="emit('action', 'resend', row)"
      >
        <RefreshCw class="h-3.5 w-3.5" aria-hidden="true" />{{ t('app.collaborators.resend') }}
      </button>
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
