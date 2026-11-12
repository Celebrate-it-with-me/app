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
import { parseEventDate } from '@/views/internal/dashboard/dashboardLogic'
import EventStatusBadge from '@/modules/events/components/EventStatusBadge.vue'

// header: a bordered control with a label (phones, and the top bar); card: the current event as a card
// at the top of the sidebar, like a workspace switcher.
defineProps({
  variant: { type: String, default: 'header' }
})

const { t, locale } = useI18n()
const router = useRouter()
const eventsStore = useEventsStore()

const active = computed(() => eventsStore.activeEvent)
const eventDate = computed(() => {
  const date = parseEventDate(active.value?.startDate)
  if (!date) return ''
  return new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
})

function select(event) {
  eventsStore.setActiveEvent(event)
}
</script>

<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger
      v-if="variant === 'header'"
      class="flex w-full max-w-full min-w-0 items-center gap-2.5 rounded-lg border border-line-strong bg-white px-2.5 py-1.5 text-left shadow-soft hover:bg-cream-100 focus-visible:outline-2 focus-visible:outline-rose-400 sm:w-auto sm:min-w-56"
      :aria-label="t('app.switchEvent')"
    >
      <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-rose-100 text-rose-700">
        <CalendarDays class="h-4 w-4" aria-hidden="true" />
      </span>
      <span class="min-w-0 flex-1">
        <span class="block text-[0.65rem] font-semibold uppercase leading-tight tracking-wide text-ink-500">{{ t('app.activeEvent') }}</span>
        <span class="block truncate font-heading text-base leading-tight text-ink-900">
          {{ active?.eventName || t('app.noEvent') }}
        </span>
      </span>
      <ChevronsUpDown class="h-4 w-4 shrink-0 text-ink-500" aria-hidden="true" />
    </DropdownMenuTrigger>

    <DropdownMenuTrigger
      v-else
      class="flex w-full min-w-0 items-center gap-2 rounded-xl border border-line bg-white p-3 text-left shadow-soft hover:bg-cream-100 focus-visible:outline-2 focus-visible:outline-rose-400"
      :aria-label="t('app.switchEvent')"
    >
      <!-- No icon here: the sidebar is narrow, the name and its date and status need the room. -->
      <span class="min-w-0 flex-1">
        <span class="line-clamp-2 font-heading text-base leading-snug text-ink-900">
          {{ active?.eventName || t('app.noEvent') }}
        </span>
        <span class="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-500">
          <span v-if="eventDate">{{ eventDate }}</span>
          <EventStatusBadge v-if="active?.status" :status="active.status" size="sm" />
        </span>
      </span>
      <ChevronsUpDown class="h-4 w-4 shrink-0 text-ink-500" aria-hidden="true" />
    </DropdownMenuTrigger>
    <DropdownMenuPortal>
      <DropdownMenuContent
        align="start"
        :side-offset="6"
        :class="cx('z-50 rounded-lg border border-line bg-white p-1 shadow-pop', variant === 'card' ? 'w-(--reka-dropdown-menu-trigger-width) min-w-64' : 'w-72')"
      >
        <DropdownMenuLabel class="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
          {{ t('app.switchEvent') }}
        </DropdownMenuLabel>
        <DropdownMenuItem
          v-for="event in eventsStore.activeEvents"
          :key="event.id"
          :class="
            cx(
              'flex cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2.5 text-base outline-none data-[highlighted]:bg-cream-200',
              active?.id === event.id ? 'text-rose-700' : 'text-ink-900'
            )
          "
          @select="select(event)"
        >
          <span class="truncate">{{ event.eventName }}</span>
          <Check v-if="active?.id === event.id" class="h-4 w-4 shrink-0" aria-hidden="true" />
        </DropdownMenuItem>
        <DropdownMenuSeparator class="my-1 h-px bg-line" />
        <DropdownMenuItem
          class="flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2.5 text-base text-ink-900 outline-none data-[highlighted]:bg-cream-200"
          @select="router.push('/dashboard/events')"
        >
          <LayoutList class="h-4 w-4 text-ink-500" aria-hidden="true" /> {{ t('app.allEvents') }}
        </DropdownMenuItem>
        <DropdownMenuItem
          class="flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2.5 text-base text-ink-900 outline-none data-[highlighted]:bg-cream-200"
          @select="router.push('/dashboard/events/create')"
        >
          <Plus class="h-4 w-4 text-ink-500" aria-hidden="true" /> {{ t('app.newEvent') }}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
