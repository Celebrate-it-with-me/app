<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ChevronDown, Check, Plus, CalendarDays } from 'lucide-vue-next'
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

const { t, locale } = useI18n()
const router = useRouter()
const eventsStore = useEventsStore()

const active = computed(() => eventsStore.activeEvent)
const eventDate = computed(() => {
  const raw = active.value?.startDate
  if (!raw) return ''
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
})

function select(event) {
  eventsStore.setActiveEvent(event)
}
</script>

<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger
      class="flex w-full max-w-full min-w-0 items-center gap-2 overflow-hidden rounded-lg px-2 py-1.5 text-left hover:bg-cream-200 focus-visible:outline-2 focus-visible:outline-rose-400 sm:w-auto"
      :aria-label="t('app.switchEvent')"
    >
      <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-rose-100 text-rose-700">
        <CalendarDays class="h-4 w-4" aria-hidden="true" />
      </span>
      <span class="min-w-0">
        <span class="block truncate font-heading text-base leading-tight text-ink-900">
          {{ active?.eventName || t('app.noEvent') }}
        </span>
        <span v-if="eventDate" class="block truncate text-xs text-ink-500">{{ eventDate }}</span>
      </span>
      <ChevronDown class="h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
    </DropdownMenuTrigger>
    <DropdownMenuPortal>
      <DropdownMenuContent align="start" :side-offset="6" class="z-50 w-72 rounded-lg border border-line bg-white p-1 shadow-pop">
        <DropdownMenuLabel class="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
          {{ t('app.switchEvent') }}
        </DropdownMenuLabel>
        <DropdownMenuItem
          v-for="event in eventsStore.events"
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
          @select="router.push('/dashboard/events/create')"
        >
          <Plus class="h-4 w-4 text-ink-500" aria-hidden="true" /> {{ t('app.newEvent') }}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
