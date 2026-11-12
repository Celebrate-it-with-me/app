<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ChevronsUpDown, Check, Plus, CalendarDays, LayoutList } from 'lucide-vue-next'
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from 'reka-ui'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { cx } from '@/ui/utils'
import { parseEventDate, daysUntil } from '@/views/internal/dashboard/dashboardLogic'
import EventStatusBadge from '@/modules/events/components/EventStatusBadge.vue'

/**
 * The event you are working on, as a control in the top bar: label, name, a quiet countdown and the
 * up/down arrows that say "you can change this". Its menu lists your live events, "all my events" and
 * "new event".
 */
const { t, locale } = useI18n()
const router = useRouter()
const eventsStore = useEventsStore()

const active = computed(() => eventsStore.activeEvent)

const shortDate = event => {
  const date = parseEventDate(event?.startDate)
  return date ? new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'short', year: 'numeric' }).format(date) : ''
}

// Quiet on purpose: small, regular weight, no colour. It is information, not an alert.
const countdown = computed(() => {
  if (!active.value || active.value.status === 'archived') return ''
  const days = daysUntil(parseEventDate(active.value.startDate))
  if (days === null) return ''
  if (days < 0) return t('app.dashboard.past')
  return t('app.dashboard.countdown', { n: days }, days)
})

function select(event) {
  eventsStore.setActiveEvent(event)
}
</script>

<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger
      class="flex w-full max-w-full min-w-0 items-center gap-2.5 rounded-lg border border-line-strong bg-white px-2.5 py-1.5 text-left shadow-soft hover:bg-cream-100 focus-visible:outline-2 focus-visible:outline-rose-400 sm:w-auto sm:min-w-64 sm:max-w-96"
      :aria-label="t('app.switchEvent')"
    >
      <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-rose-100 text-rose-700">
        <CalendarDays class="h-4 w-4" aria-hidden="true" />
      </span>
      <span class="min-w-0 flex-1">
        <span class="flex items-baseline justify-between gap-3">
          <span class="text-[0.65rem] font-semibold uppercase leading-tight tracking-wide text-ink-500">
            {{ t('app.activeEvent') }}
          </span>
          <span v-if="countdown" class="shrink-0 text-[0.65rem] leading-tight text-ink-500">{{ countdown }}</span>
        </span>
        <span class="block truncate font-heading text-base leading-tight text-ink-900">
          {{ active?.eventName || t('app.noEvent') }}
        </span>
      </span>
      <ChevronsUpDown class="h-4 w-4 shrink-0 text-ink-500" aria-hidden="true" />
    </DropdownMenuTrigger>

    <DropdownMenuPortal>
      <DropdownMenuContent
        align="end"
        :side-offset="8"
        class="z-50 w-80 max-w-[calc(100vw-1.5rem)] rounded-xl border border-line bg-white p-1.5 shadow-pop"
      >
        <DropdownMenuLabel class="px-2.5 pb-1.5 pt-2 text-[0.7rem] font-semibold uppercase tracking-wide text-ink-500">
          {{ t('app.switchEvent') }}
        </DropdownMenuLabel>

        <DropdownMenuItem
          v-for="event in eventsStore.activeEvents"
          :key="event.id"
          :class="
            cx(
              'flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 outline-none data-[highlighted]:bg-cream-200',
              active?.id === event.id && 'bg-rose-50'
            )
          "
          @select="select(event)"
        >
          <span class="min-w-0 flex-1">
            <span :class="cx('block truncate font-heading text-base leading-tight', active?.id === event.id ? 'text-rose-800' : 'text-ink-900')">
              {{ event.eventName }}
            </span>
            <span class="mt-1 flex items-center gap-2 text-xs text-ink-500">
              <span v-if="shortDate(event)">{{ shortDate(event) }}</span>
              <EventStatusBadge :status="event.status" size="sm" />
            </span>
          </span>
          <Check v-if="active?.id === event.id" class="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
        </DropdownMenuItem>

        <DropdownMenuSeparator class="my-1.5 h-px bg-line" />

        <DropdownMenuItem
          class="flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-ink-800 outline-none data-[highlighted]:bg-cream-200"
          @select="router.push('/dashboard/events')"
        >
          <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-cream-200 text-ink-700">
            <LayoutList class="h-4 w-4" aria-hidden="true" />
          </span>
          {{ t('app.allEvents') }}
        </DropdownMenuItem>
        <DropdownMenuItem
          class="flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-semibold text-rose-700 outline-none data-[highlighted]:bg-rose-50"
          @select="router.push('/dashboard/events/create')"
        >
          <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-rose-100 text-rose-700">
            <Plus class="h-4 w-4" aria-hidden="true" />
          </span>
          {{ t('app.newEvent') }}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
