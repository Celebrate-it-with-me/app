<script setup>
import { useI18n } from 'vue-i18n'
import { BadgeCheck, Bell, Calendar, CalendarClock, Eye, Map, MapPin, MapPinOff, MessageCircle, MessageSquare, Music, PartyPopper, Pencil, Receipt, Sparkles, ThumbsUp, UserCheck, UserX } from 'lucide-vue-next'
import { UiCard } from '@/ui'
import { activityTone } from './dashboardLogic'

defineProps({
  /** `[{ id, message, icon, color, createdAt }]`; icon and color are names sent by the API. */
  activity: { type: Array, default: () => [] }
})

const { t } = useI18n()

/** API icon name -> lucide component. `edit` is the API's name for the pencil. Unknown names fall back to the bell. */
const ICONS = {
  'badge-check': BadgeCheck,
  calendar: Calendar,
  'calendar-clock': CalendarClock,
  edit: Pencil,
  eye: Eye,
  map: Map,
  'map-pin': MapPin,
  'map-pin-off': MapPinOff,
  'message-circle': MessageCircle,
  'message-square': MessageSquare,
  music: Music,
  'party-popper': PartyPopper,
  receipt: Receipt,
  sparkles: Sparkles,
  'thumbs-up': ThumbsUp,
  'user-check': UserCheck,
  'user-x': UserX
}
const iconOf = name => ICONS[String(name ?? '').toLowerCase()] ?? Bell
</script>

<template>
  <UiCard :title="t('app.dashboard.more.activity')" heading-level="h2">
    <p v-if="!activity.length" class="text-base text-ink-600">{{ t('app.dashboard.more.activityEmpty') }}</p>
    <ul v-else class="space-y-3 text-sm">
      <li v-for="item in activity" :key="item.id" class="flex items-start gap-3">
        <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" :class="activityTone(item.color)" data-testid="activity-chip">
          <component :is="iconOf(item.icon)" class="h-4 w-4" aria-hidden="true" />
        </span>
        <div class="min-w-0">
          <p class="text-ink-900">{{ item.message }}</p>
          <p class="text-xs text-ink-500">{{ item.createdAt }}</p>
        </div>
      </li>
    </ul>
  </UiCard>
</template>
