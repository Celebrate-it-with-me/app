<script setup>
import { useI18n } from 'vue-i18n'
import { BadgeCheck, Bell, Calendar, CalendarClock, Eye, Map, MapPin, MapPinOff, MessageCircle, MessageSquare, Music, PartyPopper, Pencil, Receipt, Sparkles, ThumbsUp, UserCheck, UserX } from 'lucide-vue-next'
import { UiCard } from '@/ui'
import { computed } from 'vue'
import { activitySentence, activityTime, activityTone, readableActivity } from './dashboardLogic'

const props = defineProps({
  /** `[{ id, type, params, message, icon, color, createdAt, occurredAt }]`; icon and color are names sent by the API. */
  activity: { type: Array, default: () => [] }
})

const { t, locale } = useI18n()
const items = computed(() => readableActivity(props.activity))

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
  <UiCard :title="t('app.dashboard.feed.title')" heading-level="h2">
    <p v-if="!items.length" class="text-base text-ink-500">{{ t('app.dashboard.feed.emptyText') }}</p>
    <ul v-else class="space-y-3 text-sm">
      <li v-for="item in items" :key="item.id" class="flex items-start gap-3">
        <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" :class="activityTone(item.color)" data-testid="activity-chip">
          <component :is="iconOf(item.icon)" class="h-4 w-4" aria-hidden="true" />
        </span>
        <div class="min-w-0">
          <p class="text-ink-900">{{ activitySentence(item, t) }}</p>
          <p class="text-xs text-ink-500">{{ activityTime(item, locale) }}</p>
        </div>
      </li>
    </ul>
  </UiCard>
</template>
